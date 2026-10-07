// Fabrique public/villes.tsv, la liste des villes embarquée dans l'app : le priant
// choisit son lieu sans qu'aucune recherche ne quitte le téléphone (phase 12).
//
// Source : GeoNames (https://www.geonames.org), licence CC BY 4.0. Villes de plus de
// 15 000 habitants du monde entier (et capitales), noms en français quand GeoNames en a.
//
// Fichiers à télécharger à la main dans un dossier hors du dépôt :
//   https://download.geonames.org/export/dump/cities15000.zip
//   https://download.geonames.org/export/dump/admin1CodesASCII.txt
//   https://download.geonames.org/export/dump/alternateNamesV2.zip  (~200 Mo)
// Les archives sont lues telles quelles par `unzip -p` (les .txt déjà extraits
// conviennent aussi) ; les noms alternatifs (~800 Mo décompressés) sont filtrés en flux.
//
// Commande : node scripts/generer-villes.mjs <dossier-geonames> [public/villes.tsv]
import { spawn } from 'node:child_process'
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

const POPULATION_MIN = 15000
// Quartiers (PPLX), lieux abandonnés, détruits ou historiques : pas des villes où l'on prie.
const CODES_EXCLUS = new Set(['PPLX', 'PPLH', 'PPLQ', 'PPLW', 'PPLCH'])

const [dossier, sortie = 'public/villes.tsv'] = process.argv.slice(2)
if (!dossier) {
  console.error('Usage : node scripts/generer-villes.mjs <dossier-geonames> [sortie.tsv]')
  process.exit(1)
}

/** Lignes d'un fichier GeoNames, extrait ou encore dans son archive. */
function lignes(nom) {
  const texte = join(dossier, `${nom}.txt`)
  if (existsSync(texte))
    return createInterface({ input: createReadStream(texte), crlfDelay: Infinity })
  const archive = join(dossier, `${nom}.zip`)
  if (!existsSync(archive)) throw new Error(`Introuvable : ${texte} ou ${archive}`)
  const unzip = spawn('unzip', ['-p', archive, `${nom}.txt`], {
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  return createInterface({ input: unzip.stdout, crlfDelay: Infinity })
}

// 1. Les villes retenues.
const villes = []
for await (const ligne of lignes('cities15000')) {
  const c = ligne.split('\t')
  if (c.length < 15) continue
  const [id, nom, , , lat, lon, , code, pays, , admin1] = c
  const population = Number(c[14])
  if (CODES_EXCLUS.has(code)) continue
  // Les arrondissements de Paris et de Marseille, rangés en villes par GeoNames :
  // à quelques kilomètres de leur ville, ils ne feraient qu'encombrer la recherche.
  if (pays === 'FR' && /^(Paris|Marseille) \d/.test(nom)) continue
  if (population < POPULATION_MIN && code !== 'PPLC') continue
  villes.push({ id, nom, lat: Number(lat), lon: Number(lon), pays, admin1, population })
}

// 2. Les régions (division admin1) : code « FR.84 » → nom GeoNames et identifiant.
const regions = new Map()
for (const ligne of readFileSync(join(dossier, 'admin1CodesASCII.txt'), 'utf8').split('\n')) {
  const [code, nom, , id] = ligne.split('\t')
  if (code && nom) regions.set(code, { nom, id })
}

// 3. Les noms français des villes et des régions, filtrés en flux. Rang : préféré et court
// (« Londres », « Latium », « Île-de-France » plutôt que « Région Île-de-France »), puis
// préféré, puis courant ; un nom court non préféré (souvent un sigle) ne sert qu'en dernier.
// Familiers et datés sont écartés (« Paname » ne doit pas nommer Paris) ; un nom historique
// ne passe que s'il est aussi préféré, GeoNames marquant ainsi « Québec » par erreur.
const utiles = new Set([...villes.map((v) => v.id), ...[...regions.values()].map((r) => r.id)])
const francais = new Map()
for await (const ligne of lignes('alternateNamesV2')) {
  const c = ligne.split('\t')
  if (c[2] !== 'fr' || !utiles.has(c[1])) continue
  const [, id, , nom, prefere, court, familier, historique, depuis, jusque] = c
  if (familier === '1' || depuis || jusque) continue
  if (historique === '1' && prefere !== '1') continue
  const rang = prefere === '1' ? (court === '1' ? 4 : 3) : court === '1' ? 1 : 2
  const deja = francais.get(id)
  if (!deja || rang > deja.rang) francais.set(id, { nom, rang })
}

// 4. Le fichier : une ligne de commentaire, puis les villes de la plus peuplée à la moins peuplée.
// L'apostrophe typographique, comme tous les libellés de l'app (« Côte d’Azur »).
const propre = (texte) =>
  texte
    .replace(/[\t\n\r]/g, ' ')
    .replace(/'/g, '’')
    .trim()
// « Karachi » n'ajoute rien à « Karâchi » : la recherche ignore déjà accents et apostrophes.
const reduit = (texte) =>
  texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-'’.\s]/g, '')
    .toLowerCase()
// « Région Occitanie », « Municipalité de Shanghai » : le nom français n'ajoute qu'une
// étiquette au nom GeoNames, qui suffit à situer la ville.
const nommerRegion = (region) => {
  const fr = francais.get(region.id)?.nom
  if (!fr) return propre(region.nom)
  const etiquette = reduit(fr).length > reduit(region.nom).length
  return propre(etiquette && reduit(fr).endsWith(reduit(region.nom)) ? region.nom : fr)
}
villes.sort((a, b) => b.population - a.population || a.nom.localeCompare(b.nom, 'fr'))
const sorties = [
  '# nom\tautre\tregion\tpays\tlatitude\tlongitude\tpopulation (milliers) — GeoNames, CC BY 4.0',
]
for (const v of villes) {
  const nom = propre(francais.get(v.id)?.nom ?? v.nom)
  const autre = reduit(nom) === reduit(v.nom) ? '' : propre(v.nom)
  const region = regions.get(`${v.pays}.${v.admin1}`)
  const nomRegion = region ? nommerRegion(region) : ''
  const population = Math.round(v.population / 1000)
  sorties.push(
    [nom, autre, nomRegion, v.pays, v.lat.toFixed(2), v.lon.toFixed(2), population].join('\t'),
  )
}
writeFileSync(sortie, sorties.join('\n') + '\n')
console.log(`✓ ${villes.length} villes écrites dans ${sortie}`)
