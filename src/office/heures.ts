import type { NomOffice } from './modele'

export interface Heure {
  heures: number
  minutes: number
}

// Heures fixes par défaut (PRD, « Rappels ») ; l'office des lectures n'a pas
// d'heure tant que le priant n'en a pas choisi une.
export const HEURES_PAR_DEFAUT: Record<NomOffice, Heure | undefined> = {
  lectures: undefined,
  laudes: { heures: 7, minutes: 0 },
  tierce: { heures: 9, minutes: 0 },
  sexte: { heures: 12, minutes: 0 },
  none: { heures: 15, minutes: 0 },
  vepres: { heures: 18, minutes: 30 },
  complies: { heures: 21, minutes: 30 },
}

// L'heure de chaque office, telle que les écrans l'affichent. Seul point
// d'entrée : les heures réglées avec les rappels (phase 11) puis les heures
// solaires (phase 12) viendront s'y substituer aux heures par défaut.
export function heuresDesOffices(): Record<NomOffice, Heure | undefined> {
  return { ...HEURES_PAR_DEFAUT }
}

// « 7 h », « 18 h 30 ».
export function ecrireHeure({ heures, minutes }: Heure): string {
  return minutes === 0 ? `${heures} h` : `${heures} h ${String(minutes).padStart(2, '0')}`
}
