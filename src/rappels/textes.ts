import { TEXTES_OFFICE } from '../recueil/office'
import { PRIERES } from '../recueil/prieres'
import type { Heure } from '../office/heures'
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

// « Laudes, vêpres, complies » ou « Aucun rappel » : le résumé de la rubrique.
export function resumerRappels(rappels: Rappels): string {
  const actives = PRIERES_RAPPELEES.filter((priere) => rappels[priere].actif).map((priere, i) => {
    const nom = NOMS_PRIERES[priere]
    return i === 0 ? nom : nom.charAt(0).toLowerCase() + nom.slice(1)
  })
  return actives.length > 0 ? actives.join(', ') : 'Aucun rappel'
}
