import { PRIERES_MARIALES, type PriereMariale } from '../recueil/angelus'
import { TEXTES_OFFICE } from '../recueil/office'
import { PRIERES } from '../recueil/prieres'
import type { LieuChoisi } from '../lieu/lieu'
import type { Heure } from '../office/heure'
import type { PriereSolaire } from '../office/heuresSolaires'
import type { Fabricant } from '../telephone/sonnerie'
import { NOMS_OFFICES } from '../office/modele'
import {
  NOMS_CLOCHES,
  PRIERES_RAPPELEES,
  type Angelus,
  type Priere,
  type Rappels,
  type Son,
} from './reglages'

// Libellés des rappels, validés par le porteur du projet (2026-10-07).

export const NOMS_PRIERES: Record<Priere, string> = {
  ...NOMS_OFFICES,
  chapelet: 'Chapelet',
  // Validés le 2026-10-20.
  'angelus-matin': 'Angélus du matin',
  'angelus-midi': 'Angélus de midi',
  'angelus-soir': 'Angélus du soir',
}

export const TITRES_NOTIFICATIONS: Record<Exclude<Priere, Angelus>, string> = {
  lectures: 'C’est l’heure de l’office des lectures',
  laudes: 'C’est l’heure des laudes',
  tierce: 'C’est l’heure de tierce',
  sexte: 'C’est l’heure de sexte',
  none: 'C’est l’heure de none',
  vepres: 'C’est l’heure des vêpres',
  complies: 'C’est l’heure des complies',
  chapelet: 'C’est l’heure du chapelet',
}

// Les premiers mots de la prière, tirés du recueil validé : les vers sans la
// marque « V/ », le dernier privé de sa ponctuation et clos par un point.
const premiersMots = (...vers: string[]) =>
  vers
    .map((v) => v.replace(/^V\/\s*/, ''))
    .join(' ')
    .replace(/\s*[,;:]$/, '.')

// « Seigneur, ouvre mes lèvres. » : l'office qui ouvre la journée (R1).
export const OUVERTURE_DU_JOUR = premiersMots(TEXTES_OFFICE['introduction-invitatoire'][0])
// « Dieu, viens à mon aide. » : tous les autres offices.
export const OUVERTURE_DES_HEURES = premiersMots(TEXTES_OFFICE.introduction[0])
// « Je vous salue, Marie, pleine de grâce. »
export const OUVERTURE_DU_CHAPELET = premiersMots(
  ...PRIERES['je-vous-salue-marie'].lignes.slice(0, 2),
)

// La première ligne de l'Angélus ou du Regina Caeli.
const premiereLigne = (priere: PriereMariale) => {
  const [morceau] = PRIERES_MARIALES[priere].morceaux
  return 'lignes' in morceau ? premiersMots(morceau.lignes[0]) : ''
}

// L'Angélus, ou de Pâques à la Pentecôte le Regina Caeli (validés le 2026-10-20).
export const NOTIFICATIONS_MARIALES: Record<PriereMariale, { titre: string; texte: string }> = {
  // « L’ange du Seigneur apporta l’annonce à Marie. »
  angelus: { titre: 'C’est l’heure de l’Angélus', texte: premiereLigne('angelus') },
  // « Reine du ciel, réjouissez-vous, alléluia. »
  'regina-caeli': { titre: 'C’est l’heure du Regina Caeli', texte: premiereLigne('regina-caeli') },
}

// « 7 h 00 », « 18 h 30 » : l'heure d'un rappel, comme sur une horloge.
export const ecrireHeureRappel = ({ heures, minutes }: Heure) =>
  `${heures} h ${String(minutes).padStart(2, '0')}`

export function nomDuSon(son: Son): string {
  if (son.sorte === 'cloche') return NOMS_CLOCHES[son.cloche]
  if (son.sorte === 'telephone') return 'Son du téléphone'
  return son.nom
}

// « Laudes, vêpres, complies » ou « Aucun rappel » : le résumé de la ligne
// Rappels des réglages, précédé en mode solaire de « Heures solaires · ».
export function resumerRappels(rappels: Rappels, solaires = false): string {
  const actives = PRIERES_RAPPELEES.filter((priere) => rappels[priere].actif).map((priere, i) => {
    const nom = NOMS_PRIERES[priere]
    return i === 0 ? nom : nom.charAt(0).toLowerCase() + nom.slice(1)
  })
  const resume = actives.length > 0 ? actives.join(', ') : 'Aucun rappel'
  return solaires ? `Heures solaires · ${resume}` : resume
}

// Le téléphone empêchera les rappels d'arriver : le résumé de la ligne Rappels
// et la ligne de l'accueil le disent, précédés de ⚠ (validé le 2026-10-08).
export const RAPPELS_BLOQUES = 'Rappels bloqués par le téléphone'

// Heures solaires (phase 12), libellés validés le 2026-10-07.

// Ce qui suit le nom de l'office sur sa ligne : « Laudes · lever ».
export const REPERES_SOLAIRES: Partial<Record<PriereSolaire, string>> = {
  laudes: 'lever',
  sexte: 'midi solaire',
  vepres: 'coucher',
  'angelus-matin': 'lever',
  'angelus-midi': 'midi solaire',
  'angelus-soir': 'coucher',
}

// Le sous-titre de chaque prière solaire, sur sa page ; « e » se met en exposant.
export const SOUS_TITRES_SOLAIRES: Record<PriereSolaire, [string, string?]> = {
  laudes: ['Au lever du soleil'],
  tierce: ['Fin de la 3', 'e heure du jour'],
  sexte: ['Au midi solaire'],
  none: ['Fin de la 9', 'e heure du jour'],
  vepres: ['Au coucher du soleil'],
  'angelus-matin': ['Au lever du soleil'],
  'angelus-midi': ['Au midi solaire'],
  'angelus-soir': ['Au coucher du soleil'],
}

// « 0 min », « +5 min », « −10 min », « +1 h » (le vrai signe moins).
export function ecrireDecalage(minutes: number): string {
  if (minutes === 0) return '0 min'
  const signe = minutes > 0 ? '+' : '−'
  const absolu = Math.abs(minutes)
  return `${signe}${absolu === 60 ? '1 h' : `${absolu} min`}`
}

// « à Lyon », « près de Lyon » : le lieu dans une phrase.
export const dansLeLieu = ({ nom, pres }: LieuChoisi) => (pres ? `près de ${nom}` : `à ${nom}`)

// Le guide de batterie, en fenêtre au premier rappel activé ou en page
// (Rappels › Régler la batterie). Textes validés par le porteur du projet
// (2026-10-07 ; démarrage automatique à part, sa page n'étant pas dans la
// fiche de l'app sous HyperOS).
const GUIDES: Record<'xiaomi' | 'samsung', { titre: string; texte: string; reglages: string[] }> = {
  xiaomi: {
    titre: 'Sur un Xiaomi',
    texte: 'L’économiseur de batterie peut bloquer les rappels. Dans la page qui va s’ouvrir :',
    reglages: ['Economiseur de batterie : Aucune restriction'],
  },
  samsung: {
    titre: 'Sur un Samsung',
    texte: 'La mise en veille des applis peut bloquer les rappels. Dans la page qui va s’ouvrir :',
    reglages: ['Batterie : Non restreinte'],
  },
}

// Le guide de batterie du téléphone : celui de Samsung, sinon celui de Xiaomi.
export const guideBatterie = (marque: Fabricant) =>
  GUIDES[marque === 'samsung' ? 'samsung' : 'xiaomi']
