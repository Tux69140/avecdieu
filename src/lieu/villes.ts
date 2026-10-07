// Les villes où le priant peut se situer (phase 12). La liste est embarquée dans l'app
// (public/villes.tsv, fabriqué par scripts/generer-villes.mjs depuis GeoNames) : chercher
// son lieu ne fait sortir aucune requête du téléphone.

export interface Ville {
  /** Nom français quand GeoNames en a un : « Saint-Denis », « Londres ». */
  nom: string
  /** Nom GeoNames d'origine s'il diffère : « London ». Sert aussi à la recherche. */
  autre?: string
  /** Division administrative (« Île-de-France »), ou '' si inconnue. */
  region: string
  /** Code ISO à deux lettres : « FR », « RE »… */
  pays: string
  latitude: number
  longitude: number
  /** En milliers d'habitants : départage les villes de même rang dans la recherche. */
  population: number
}

/** Analyse le fichier des villes ; les lignes commençant par « # » sont des commentaires. */
export function lireVilles(texte: string): Ville[] {
  const villes: Ville[] = []
  for (const ligne of texte.split('\n')) {
    if (!ligne.trim() || ligne.startsWith('#')) continue
    const [nom, autre, region = '', pays = '', latitude, longitude, population] = ligne.split('\t')
    villes.push({
      nom,
      ...(autre ? { autre } : {}),
      region,
      pays,
      latitude: Number(latitude),
      longitude: Number(longitude),
      population: Number(population),
    })
  }
  return villes
}

let chargement: Promise<Ville[]> | undefined

/** Le fichier des villes, lu une seule fois ; après un échec, le prochain appel réessaie. */
export function chargerVilles(): Promise<Ville[]> {
  chargement ??= (async () => {
    const reponse = await fetch('/villes.tsv')
    if (!reponse.ok) throw new Error(`Liste des villes illisible (${reponse.status})`)
    return lireVilles(await reponse.text())
  })().catch((erreur: unknown) => {
    chargement = undefined
    throw erreur
  })
  return chargement
}

// « St-Étienne », « st etienne » et « Saint-Étienne » doivent se rejoindre.
const ABREVIATIONS: Record<string, string> = { st: 'saint', ste: 'sainte' }

/** Minuscules sans accents, mots séparés d'une seule espace, « st » et « ste » développés. */
function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-'’.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((mot) => ABREVIATIONS[mot] ?? mot)
    .join(' ')
}

// Normaliser trente mille noms à chaque lettre tapée serait du travail perdu.
const formes = new WeakMap<Ville, string[]>()
function formesDe(ville: Ville): string[] {
  let f = formes.get(ville)
  if (!f) {
    f = [ville.nom, ville.autre].filter((n): n is string => !!n).map(normaliser)
    formes.set(ville, f)
  }
  return f
}

/** 0 : nom égal ; 1 : nom qui commence par la saisie ; 2 : un mot qui commence par elle. */
function rang(forme: string, saisie: string): number | undefined {
  if (forme === saisie) return 0
  if (forme.startsWith(saisie)) return 1
  if (` ${forme}`.includes(` ${saisie}`)) return 2
  return undefined
}

/** Les villes qui répondent à la saisie, les meilleures correspondances d'abord. */
export function chercherVilles(villes: Ville[], saisie: string, max = 8): Ville[] {
  const cherche = normaliser(saisie)
  if (cherche.length < 2) return []
  const trouvees: { ville: Ville; rang: number }[] = []
  for (const ville of villes) {
    const rangs = formesDe(ville)
      .map((forme) => rang(forme, cherche))
      .filter((r) => r !== undefined)
    if (rangs.length) trouvees.push({ ville, rang: Math.min(...rangs) })
  }
  trouvees.sort((a, b) => a.rang - b.rang || b.ville.population - a.ville.population)
  // Deux villes qui s'afficheraient pareil ne se distinguent pas à l'écran : la plus peuplée suffit.
  const vues = new Set<string>()
  const resultat: Ville[] = []
  for (const { ville } of trouvees) {
    const cle = `${ville.nom}\t${ville.region}\t${ville.pays}`
    if (vues.has(cle)) continue
    vues.add(cle)
    resultat.push(ville)
    if (resultat.length >= max) break
  }
  return resultat
}

/** La ville la plus proche d'un lieu (distance équirectangulaire, suffisante à cette échelle). */
export function villeLaPlusProche(
  villes: Ville[],
  lieu: { latitude: number; longitude: number },
): Ville | undefined {
  const cosinus = Math.cos((lieu.latitude * Math.PI) / 180)
  let meilleure: Ville | undefined
  let distanceMin = Infinity
  for (const ville of villes) {
    // Ramené entre -180 et 180 : de part et d'autre de l'antiméridien, les Fidji et les
    // Samoa sont voisines.
    const ecart = ((((ville.longitude - lieu.longitude) % 360) + 540) % 360) - 180
    const dx = ecart * cosinus
    const dy = ville.latitude - lieu.latitude
    const distance = dx * dx + dy * dy
    if (distance < distanceMin) {
      distanceMin = distance
      meilleure = ville
    }
  }
  return meilleure
}

// L'outre-mer français se dit « La Réunion, France » : le territoire tient lieu de région.
const OUTRE_MER = new Set(['GP', 'MQ', 'GF', 'RE', 'YT', 'PM', 'BL', 'MF', 'NC', 'PF', 'WF'])
let nomsDesPays: Intl.DisplayNames | undefined

function nommerPays(code: string): string {
  nomsDesPays ??= new Intl.DisplayNames(['fr'], { type: 'region' })
  try {
    return nomsDesPays.of(code) ?? code
  } catch {
    return code
  }
}

/** Ce qui suit le nom de la ville : « Île-de-France, France », « La Réunion, France ». */
export function decrireVille(ville: Ville): string {
  if (OUTRE_MER.has(ville.pays)) return `${nommerPays(ville.pays)}, France`
  const pays = nommerPays(ville.pays)
  return ville.region ? `${ville.region}, ${pays}` : pays
}
