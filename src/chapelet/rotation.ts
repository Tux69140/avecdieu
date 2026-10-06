import type { Deroule } from './deroule'

// Chaque mystère a plusieurs passages, qui tournent : le même passage revient
// six lectures de suite, pour laisser le temps de le méditer (choix du porteur
// du projet, 2026-10-06), puis cède la place au suivant.
export const LECTURES_PAR_PASSAGE = 6

// Rang (à partir de 0) du passage à lire, d'après le nombre de lectures déjà faites.
export function rangDuPassage(lectures: number, nombreDePassages: number): number {
  return Math.floor(lectures / LECTURES_PAR_PASSAGE) % nombreDePassages
}

// Une lecture compte quand on passe la première étape d'une dizaine pour la
// commencer : l'annonce, ou en mode compact le Notre Père qui la porte.
export function dizaineCommencee(deroule: Deroule, avant: number, apres: number): number | null {
  if (apres !== avant + 1) return null
  const pas = deroule.pas[avant]
  if (pas?.dizaine === undefined) return null
  const precedent = deroule.pas[avant - 1]
  return precedent?.dizaine === pas.dizaine ? null : pas.dizaine
}
