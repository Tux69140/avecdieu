import { TEXTES_OFFICE } from '../recueil/office'
import { PRIERES } from '../recueil/prieres'
import type { LieuChoisi } from '../lieu/lieu'
import type { Heure } from '../office/heures'
import type { OfficeSolaire } from '../office/heuresSolaires'
import { NOMS_OFFICES } from '../office/modele'
import { NOMS_CLOCHES, PRIERES_RAPPELEES, type Priere, type Rappels, type Son } from './reglages'

// Libellés des rappels, validés par le porteur du projet (2026-10-07).

export const NOMS_PRIERES: Record<Priere, string> = { ...NOMS_OFFICES, chapelet: 'Chapelet' }

export const TITRES_NOTIFICATIONS: Record<Priere, string> = {
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

// « 7 h 00 », « 18 h 30 » : l'heure d'un rappel, comme sur une horloge.
export const ecrireHeureRappel = ({ heures, minutes }: Heure) =>
  `${heures} h ${String(minutes).padStart(2, '0')}`

export function nomDuSon(son: Son): string {
  if (son.sorte === 'cloche') return NOMS_CLOCHES[son.cloche]
  if (son.sorte === 'telephone') return 'Son du téléphone'
  return son.nom
}

// « Laudes, vêpres, complies » ou « Aucun rappel » : le résumé de la rubrique,
// précédé en mode solaire de « Heures solaires · ».
export function resumerRappels(rappels: Rappels, solaires = false): string {
  const actives = PRIERES_RAPPELEES.filter((priere) => rappels[priere].actif).map((priere, i) => {
    const nom = NOMS_PRIERES[priere]
    return i === 0 ? nom : nom.charAt(0).toLowerCase() + nom.slice(1)
  })
  const resume = actives.length > 0 ? actives.join(', ') : 'Aucun rappel'
  return solaires ? `Heures solaires · ${resume}` : resume
}

// Heures solaires (phase 12), libellés validés le 2026-10-07.

// Ce qui suit le nom de l'office sur sa ligne : « Laudes · lever ».
export const REPERES_SOLAIRES: Partial<Record<OfficeSolaire, string>> = {
  laudes: 'lever',
  sexte: 'midi solaire',
  vepres: 'coucher',
}

// Le sous-titre du volet de chaque office ; « e » se met en exposant.
export const SOUS_TITRES_SOLAIRES: Record<OfficeSolaire, [string, string?]> = {
  laudes: ['Au lever du soleil'],
  tierce: ['Fin de la 3', 'e heure du jour'],
  sexte: ['Au midi solaire'],
  none: ['Fin de la 9', 'e heure du jour'],
  vepres: ['Au coucher du soleil'],
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
