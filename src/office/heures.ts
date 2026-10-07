import { lireRappels, RAPPELS_PAR_DEFAUT } from '../rappels/reglages'
import { OFFICES, type NomOffice } from './modele'

export interface Heure {
  heures: number
  minutes: number
}

const heuresDe = (rappels: typeof RAPPELS_PAR_DEFAUT) =>
  Object.fromEntries(OFFICES.map((nom) => [nom, rappels[nom].heure])) as Record<
    NomOffice,
    Heure | undefined
  >

// Heures fixes par défaut (PRD, « Rappels ») ; l'office des lectures n'a pas
// d'heure tant que le priant n'en a pas choisi une.
export const HEURES_PAR_DEFAUT = heuresDe(RAPPELS_PAR_DEFAUT)

// L'heure de chaque office, telle que les écrans l'affichent : celle réglée
// avec les rappels, même rappel coupé (une seule heure partout, décision du
// porteur du projet, 2026-10-07). Les heures solaires (phase 12) viendront
// s'y substituer.
export function heuresDesOffices(): Record<NomOffice, Heure | undefined> {
  return heuresDe(lireRappels())
}

// « 7 h », « 18 h 30 ».
export function ecrireHeure({ heures, minutes }: Heure): string {
  return minutes === 0 ? `${heures} h` : `${heures} h ${String(minutes).padStart(2, '0')}`
}
