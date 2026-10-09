import { arrondirALaMinute, enMinutes, minutesDe, versHeure, type Heure } from './heure'
import { leverEtCoucher, type Lieu } from './soleil'

// Les heures temporaires (PRD, « Mode solaire ») : le jour, du lever au
// coucher, se divise en douze heures égales. Laudes au lever, tierce à la fin
// de la 3e heure, sexte au midi solaire, none à la fin de la 9e, vêpres au
// coucher ; complies, office des lectures et chapelet gardent leur heure fixe.

export type OfficeSolaire = 'laudes' | 'tierce' | 'sexte' | 'none' | 'vepres'

export const OFFICES_SOLAIRES: readonly OfficeSolaire[] = [
  'laudes',
  'tierce',
  'sexte',
  'none',
  'vepres',
]

export const estOfficeSolaire = (priere: string): priere is OfficeSolaire =>
  (OFFICES_SOLAIRES as readonly string[]).includes(priere)

// La part du jour écoulée à l'heure de chaque office.
const PART_DU_JOUR: Record<OfficeSolaire, number> = {
  laudes: 0,
  tierce: 3 / 12,
  sexte: 6 / 12,
  none: 9 / 12,
  vepres: 1,
}

export interface Limite {
  active: boolean
  heure: Heure
}

export interface ReglagesSolaires {
  // Le commutateur « Fixes | Solaires » de la page Réglages › Rappels.
  actives: boolean
  // En minutes, de −60 à +60, par 5.
  decalages: Record<OfficeSolaire, number>
  // Laudes « pas avant », vêpres « pas après » : la limite règle l'été sans
  // décaler l'hiver (décision du porteur du projet, 2026-10-07).
  pasAvant: Limite
  pasApres: Limite
}

export const DECALAGE_MAX = 60
export const PAS_DU_DECALAGE = 5

export const HEURES_SOLAIRES_PAR_DEFAUT: ReglagesSolaires = {
  actives: false,
  decalages: { laudes: 0, tierce: 0, sexte: 0, none: 0, vepres: 0 },
  pasAvant: { active: true, heure: { heures: 7, minutes: 0 } },
  pasApres: { active: true, heure: { heures: 19, minutes: 30 } },
}

const MINUTE = 60_000

// L'heure de chaque office solaire ce jour-là, en ce lieu. Rien là où le
// soleil ne se lève ou ne se couche pas (cercles polaires) : l'app garde alors
// les heures fixes.
export function heuresSolaires(
  jour: Date,
  lieu: Lieu,
  reglages: ReglagesSolaires,
): Record<OfficeSolaire, Heure> | undefined {
  const { lever, coucher } = leverEtCoucher(jour, lieu)
  if (Number.isNaN(lever.getTime()) || Number.isNaN(coucher.getTime())) return undefined
  const duree = coucher.getTime() - lever.getTime()
  const heures = {} as Record<OfficeSolaire, Heure>
  for (const office of OFFICES_SOLAIRES) {
    const instant = lever.getTime() + PART_DU_JOUR[office] * duree
    const decale = new Date(instant + reglages.decalages[office] * MINUTE)
    let minutes = minutesDe(arrondirALaMinute(decale))
    if (office === 'laudes' && reglages.pasAvant.active)
      minutes = Math.max(minutes, enMinutes(reglages.pasAvant.heure))
    if (office === 'vepres' && reglages.pasApres.active)
      minutes = Math.min(minutes, enMinutes(reglages.pasApres.heure))
    heures[office] = versHeure(minutes)
  }
  return heures
}
