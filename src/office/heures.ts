import { lireLieu } from '../lieu/lieu'
import {
  lireRappels,
  PRIERES_RAPPELEES,
  RAPPELS_PAR_DEFAUT,
  type Priere,
  type Rappels,
} from '../rappels/reglages'
import { lireSolaire } from '../rappels/solaire'
import { enDate } from './dates'
import { heuresSolaires, type ReglagesSolaires } from './heuresSolaires'
import { OFFICES, type NomOffice } from './modele'
import type { Lieu } from './soleil'

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

// L'heure de chaque prière un jour donné : celle réglée avec les rappels, même
// rappel coupé (une seule heure partout, décision du porteur du projet,
// 2026-10-07), ou en mode solaire celle du soleil pour laudes, tierce, sexte,
// none et vêpres. Sans lieu connu, les heures restent fixes.
export function calculerHeures(
  date: string,
  rappels: Rappels,
  solaire: ReglagesSolaires,
  lieu: Lieu | undefined,
): Record<Priere, Heure | undefined> {
  const heures = Object.fromEntries(
    PRIERES_RAPPELEES.map((priere) => [priere, rappels[priere].heure]),
  ) as Record<Priere, Heure | undefined>
  if (!solaire.actives || !lieu) return heures
  return { ...heures, ...heuresSolaires(enDate(date), lieu, solaire) }
}

// Le mode solaire ne vaut qu'avec un lieu : sans lui, les heures restent fixes.
export const heuresSolairesEnService = () => lireSolaire().actives && !!lireLieu().lieu

// Les mêmes, lues sur le téléphone.
export function heuresDuJour(date: string): Record<Priere, Heure | undefined> {
  return calculerHeures(date, lireRappels(), lireSolaire(), lireLieu().lieu)
}

// L'heure de chaque office, telle que les écrans l'affichent.
export function heuresDesOffices(date: string): Record<NomOffice, Heure | undefined> {
  const heures = heuresDuJour(date)
  return Object.fromEntries(OFFICES.map((nom) => [nom, heures[nom]])) as Record<
    NomOffice,
    Heure | undefined
  >
}

// « 7 h », « 18 h 30 ».
export function ecrireHeure({ heures, minutes }: Heure): string {
  return minutes === 0 ? `${heures} h` : `${heures} h ${String(minutes).padStart(2, '0')}`
}
