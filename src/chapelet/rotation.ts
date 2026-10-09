import type { Deroule, Pas } from './deroule'

// Chaque mystère a plusieurs passages, qui tournent : le même passage revient
// six lectures de suite, pour laisser le temps de le méditer (choix du porteur
// du projet, 2026-10-06), puis cède la place au suivant.
export const LECTURES_PAR_PASSAGE = 6

// Rang (à partir de 0) du passage à lire, d'après le nombre de lectures déjà faites.
export function rangDuPassage(lectures: number, nombreDePassages: number): number {
  return Math.floor(lectures / LECTURES_PAR_PASSAGE) % nombreDePassages
}

// Une lecture compte quand on passe la première étape d'une dizaine pour la
// commencer : l'annonce, ou en mode compact le Notre Père qui la porte. Rend
// le premier pas de la dizaine, qui dit sa série au Rosaire.
export function dizaineCommencee(
  deroule: Deroule,
  avant: number,
  apres: number,
): (Pas & { dizaine: number }) | null {
  if (apres !== avant + 1) return null
  const pas = deroule.pas[avant]
  if (pas?.dizaine === undefined) return null
  const precedent = deroule.pas[avant - 1]
  return precedent && memePartie(precedent, pas) ? null : { ...pas, dizaine: pas.dizaine }
}

// Deux pas de la même dizaine : même rang et, au Rosaire, même série.
export const memePartie = (a: Pas, b: Pas) => a.dizaine === b.dizaine && a.serie === b.serie
