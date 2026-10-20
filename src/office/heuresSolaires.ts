import { ANGELUS, type Angelus } from '../rappels/reglages'
import { arrondirALaMinute, enMinutes, minutesDe, versHeure, type Heure } from './heure'
import { leverEtCoucher, type Lieu } from './soleil'

// Les heures temporaires (PRD, « Mode solaire ») : le jour, du lever au
// coucher, se divise en douze heures égales. Laudes au lever, tierce à la fin
// de la 3e heure, sexte au midi solaire, none à la fin de la 9e, vêpres au
// coucher ; complies, office des lectures et chapelet gardent leur heure fixe.
// L'Angélus suit aussi le soleil : au lever, au midi solaire et au coucher,
// avec son décalage et ses limites à lui (décision du porteur du projet,
// 2026-10-20).

export type OfficeSolaire = 'laudes' | 'tierce' | 'sexte' | 'none' | 'vepres'
export type PriereSolaire = OfficeSolaire | Angelus

export const OFFICES_SOLAIRES: readonly OfficeSolaire[] = [
  'laudes',
  'tierce',
  'sexte',
  'none',
  'vepres',
]

export const PRIERES_SOLAIRES: readonly PriereSolaire[] = [...OFFICES_SOLAIRES, ...ANGELUS]

export const estPriereSolaire = (priere: string): priere is PriereSolaire =>
  (PRIERES_SOLAIRES as readonly string[]).includes(priere)

// La part du jour écoulée à l'heure de chaque prière.
const PART_DU_JOUR: Record<PriereSolaire, number> = {
  laudes: 0,
  tierce: 3 / 12,
  sexte: 6 / 12,
  none: 9 / 12,
  vepres: 1,
  'angelus-matin': 0,
  'angelus-midi': 6 / 12,
  'angelus-soir': 1,
}

export interface Limite {
  active: boolean
  heure: Heure
}

export interface ReglagesSolaires {
  // Le commutateur « Fixes | Solaires » de la page Réglages › Rappels.
  actives: boolean
  // En minutes, de −60 à +60, par 5.
  decalages: Record<PriereSolaire, number>
  // Laudes « pas avant », vêpres « pas après » : la limite règle l'été sans
  // décaler l'hiver (décision du porteur du projet, 2026-10-07).
  pasAvant: Limite
  pasApres: Limite
  // Les mêmes pour l'Angélus du matin et du soir, réglées à part (2026-10-20).
  angelusPasAvant: Limite
  angelusPasApres: Limite
}

export type CleLimite = 'pasAvant' | 'pasApres' | 'angelusPasAvant' | 'angelusPasApres'

// La limite de chaque prière qui en a une.
export const LIMITES: Partial<Record<PriereSolaire, CleLimite>> = {
  laudes: 'pasAvant',
  vepres: 'pasApres',
  'angelus-matin': 'angelusPasAvant',
  'angelus-soir': 'angelusPasApres',
}

export const estPasAvant = (cle: CleLimite) => cle === 'pasAvant' || cle === 'angelusPasAvant'

export const DECALAGE_MAX = 60
export const PAS_DU_DECALAGE = 5

const SEPT_HEURES: Limite = { active: true, heure: { heures: 7, minutes: 0 } }
const DIX_NEUF_HEURES_TRENTE: Limite = { active: true, heure: { heures: 19, minutes: 30 } }

export const HEURES_SOLAIRES_PAR_DEFAUT: ReglagesSolaires = {
  actives: false,
  decalages: Object.fromEntries(PRIERES_SOLAIRES.map((priere) => [priere, 0])) as Record<
    PriereSolaire,
    number
  >,
  pasAvant: SEPT_HEURES,
  pasApres: DIX_NEUF_HEURES_TRENTE,
  angelusPasAvant: SEPT_HEURES,
  angelusPasApres: DIX_NEUF_HEURES_TRENTE,
}

const MINUTE = 60_000

// L'heure de chaque prière solaire ce jour-là, en ce lieu. Rien là où le
// soleil ne se lève ou ne se couche pas (cercles polaires) : l'app garde alors
// les heures fixes.
export function heuresSolaires(
  jour: Date,
  lieu: Lieu,
  reglages: ReglagesSolaires,
): Record<PriereSolaire, Heure> | undefined {
  const { lever, coucher } = leverEtCoucher(jour, lieu)
  if (Number.isNaN(lever.getTime()) || Number.isNaN(coucher.getTime())) return undefined
  const duree = coucher.getTime() - lever.getTime()
  const heures = {} as Record<PriereSolaire, Heure>
  for (const priere of PRIERES_SOLAIRES) {
    const instant = lever.getTime() + PART_DU_JOUR[priere] * duree
    const decale = new Date(instant + reglages.decalages[priere] * MINUTE)
    let minutes = minutesDe(arrondirALaMinute(decale))
    const cle = LIMITES[priere]
    const limite = cle && reglages[cle]
    if (cle && limite?.active)
      minutes = (estPasAvant(cle) ? Math.max : Math.min)(minutes, enMinutes(limite.heure))
    heures[priere] = versHeure(minutes)
  }
  return heures
}
