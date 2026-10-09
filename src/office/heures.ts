import { lireLieu } from '../lieu/lieu'
import { lireRappels, PRIERES_RAPPELEES, type Priere, type Rappels } from '../rappels/reglages'
import { lireSolaire } from '../rappels/solaire'
import { enDate } from './dates'
import type { Heure } from './heure'
import { heuresSolaires, type ReglagesSolaires } from './heuresSolaires'
import { OFFICES, type NomOffice } from './modele'
import type { Lieu } from './soleil'

// Les heures fixes, réglées avec les rappels : les mêmes chaque jour.
export const heuresReglees = (rappels: Rappels) =>
  Object.fromEntries(PRIERES_RAPPELEES.map((priere) => [priere, rappels[priere].heure])) as Record<
    Priere,
    Heure | undefined
  >

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
  const heures = heuresReglees(rappels)
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
