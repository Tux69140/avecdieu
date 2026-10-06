import type {
  CouleurLiturgique,
  JourLiturgique,
  NomOffice,
  Office,
  Partie,
  TypePartie,
} from '../office/modele'
import { lireFragment } from './fragments'

// Une réponse de l'AELF (/v1/<office>/<date>/<zone>) devient un Office : les
// parties dans l'ordre de l'AELF, avec les libellés validés par le porteur du
// projet (2026-10-06). Le texte est donné tel que l'AELF le fournit ; sa
// reconstitution selon les rubriques viendra en phase 6.

type Brut = Record<string, unknown>

const estObjet = (valeur: unknown): valeur is Brut =>
  typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)

const chaine = (valeur: unknown): string | undefined =>
  typeof valeur === 'string' && valeur.trim() !== '' ? valeur.trim() : undefined

// L'apostrophe typographique des libellés de l'app.
const typographier = (texte: string) => texte.replace(/'/g, '’')

// Champs d'une partie : l'AELF donne soit le texte seul, soit un objet.
interface Champs {
  texte?: string
  titre?: string
  reference?: string
  auteur?: string
  editeur?: string
}

function champs(valeur: unknown): Champs {
  if (typeof valeur === 'string') return { texte: chaine(valeur) }
  if (!estObjet(valeur)) return {}
  return {
    texte: chaine(valeur.texte),
    titre: chaine(valeur.titre),
    reference: chaine(valeur.reference),
    auteur: chaine(valeur.auteur),
    editeur: chaine(valeur.editeur),
  }
}

// « 84 » → « Psaume 84 » ; « CANTIQUE d'Isaïe (Is 26) » → « Cantique d’Isaïe (Is 26) ».
function libellePsaume(brute: string | undefined): [TypePartie, string] {
  // « 14. », « (Ep 1). » : le point final de l'AELF n'a pas sa place dans un titre.
  const reference = brute?.replace(/\.$/, '')
  if (!reference) return ['psaume', 'Psaume']
  if (/^\d/.test(reference)) return ['psaume', `Psaume ${reference}`]
  const cantique = /^cantique/i.exec(reference)
  if (cantique) return ['cantique', typographier(`Cantique${reference.slice(cantique[0].length)}`)]
  return ['psaume', typographier(reference)]
}

// Une clé inconnue garde un libellé lisible : « cantique_nouveau » → « Cantique nouveau ».
const libelleDeCle = (cle: string) => {
  const mots = cle.replace(/_/g, ' ')
  return mots.charAt(0).toUpperCase() + mots.slice(1)
}

interface Lecture {
  type: TypePartie
  libelle: string
  precision?: string
  titre?: string
  source?: string
}

// Ce que chaque clé de l'AELF devient à l'écran.
function lecture(cle: string, c: Champs, numeroter: boolean, titrePatristique?: string): Lecture {
  const antienne = /^antienne_(\d)$/.exec(cle)
  if (antienne)
    return { type: 'antienne', libelle: numeroter ? `Antienne ${antienne[1]}` : 'Antienne' }
  if (/^psaume_\d$/.test(cle)) {
    const [type, libelle] = libellePsaume(c.reference)
    return { type, libelle }
  }
  if (/^antienne_(zacharie|magnificat|symeon)$/.test(cle))
    return { type: 'antienne', libelle: 'Antienne' }
  if (/^cantique_(zacharie|mariale|symeon)$/.test(cle))
    return { type: 'cantique', libelle: c.titre ? typographier(c.titre) : 'Cantique' }
  switch (cle) {
    case 'introduction':
      return { type: 'introduction', libelle: 'Introduction' }
    case 'antienne_invitatoire':
      return { type: 'invitatoire', libelle: 'Invitatoire' }
    case 'psaume_invitatoire':
      return { type: 'psaume', libelle: libellePsaume(c.reference)[1] }
    case 'hymne': {
      const source = [c.auteur, c.editeur].filter(Boolean).join(' · ')
      return { type: 'hymne', libelle: 'Hymne', precision: c.titre, source: source || undefined }
    }
    case 'verset_psaume':
      return { type: 'verset', libelle: 'Verset' }
    case 'lecture':
      return { type: 'lecture', libelle: 'Lecture', precision: c.reference, titre: c.titre }
    case 'texte_patristique':
      return { type: 'lecture', libelle: 'Lecture patristique', titre: titrePatristique }
    case 'pericope':
      return { type: 'lecture', libelle: 'Lecture brève', precision: c.reference }
    case 'repons':
    case 'repons_lecture':
    case 'repons_patristique':
      return { type: 'repons', libelle: 'Répons' }
    case 'te_deum':
      return { type: 'te-deum', libelle: 'Te Deum' }
    case 'intercession':
      return { type: 'intercession', libelle: 'Intercession' }
    case 'notre_pere':
      return { type: 'notre-pere', libelle: 'Notre Père' }
    case 'oraison':
      return { type: 'oraison', libelle: 'Oraison' }
    case 'benediction':
      return { type: 'benediction', libelle: 'Bénédiction' }
    case 'hymne_mariale':
      return { type: 'antienne-mariale', libelle: 'Antienne mariale', titre: c.titre }
    default:
      return { type: 'autre', libelle: libelleDeCle(cle), precision: c.reference, titre: c.titre }
  }
}

export function lireOffice(nom: NomOffice, date: string, reponse: unknown): Office {
  if (!estObjet(reponse) || !estObjet(reponse[nom]))
    throw new Error(`Réponse AELF sans l’office « ${nom} »`)
  const brut = reponse[nom]
  const zone = estObjet(reponse.informations) ? chaine(reponse.informations.zone) : undefined
  // Les antiennes ne se numérotent que s'il y a plusieurs psaumes.
  const psaumes = Object.keys(brut).filter(
    (cle) => /^psaume_\d$/.test(cle) && champs(brut[cle]).texte,
  )
  const titrePatristique = chaine(brut.titre_patristique)

  const parties: Partie[] = []
  for (const [cle, valeur] of Object.entries(brut)) {
    if (cle === 'titre_patristique') continue
    const c = champs(valeur)
    if (!c.texte) continue
    const { type, libelle, precision, titre, source } = lecture(
      cle,
      c,
      psaumes.length > 1,
      titrePatristique,
    )
    const strophes = lireFragment(c.texte)
    // Le Notre Père de l'AELF n'est que son titre : inutile de le répéter.
    const seulTitre =
      strophes
        .flat(2)
        .map((s) => s.texte)
        .join('') === libelle
    parties.push({
      type,
      libelle,
      ...(precision && precision !== libelle && { precision: typographier(precision) }),
      ...(titre && titre !== libelle && { titre }),
      ...(source && { source }),
      strophes: seulTitre ? [] : strophes,
      ajoutee: false,
    })
  }
  return { nom, date, zone: zone ?? 'france', parties }
}

const COULEURS: readonly CouleurLiturgique[] = ['blanc', 'vert', 'violet', 'rouge', 'rose', 'noir']

const estCouleur = (valeur: unknown): valeur is CouleurLiturgique =>
  (COULEURS as readonly unknown[]).includes(valeur)

export function lireJour(informations: unknown): JourLiturgique {
  const i = estObjet(informations) ? informations : {}
  return {
    date: chaine(i.date) ?? '',
    zone: chaine(i.zone) ?? '',
    temps: chaine(i.temps_liturgique),
    semaine: chaine(i.semaine),
    fete: chaine(i.fete),
    rang: chaine(i.degre) ?? chaine(i.ligne3),
    couleurs: [i.couleur, i.couleur2, i.couleur3].filter(estCouleur),
  }
}
