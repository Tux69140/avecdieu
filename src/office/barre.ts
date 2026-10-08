// La barre de l'office (choix du porteur du projet, 2026-10-07) : elle ne
// prend aucune place pendant la lecture. Cachée quand on lit en descendant,
// elle revient dès qu'on remonte un peu, et en fin d'office. Calcul pur, à
// partir de la position de défilement relevée par useReperage.

// Ce qu'il faut de défilement pour la cacher ou la montrer : un doigt qui
// tremble ne la fait pas clignoter.
export const DESCENTE = 48
export const REMONTEE = 32

export interface Barre {
  visible: boolean
  // Visible : le plus haut atteint depuis qu'elle est là ; cachée : le plus bas.
  ancre: number
}

export interface Contexte {
  // L'en-tête de l'office (croix, date, ☰) est sorti de l'écran.
  horsTitre: boolean
  // Il ne reste presque plus rien à faire défiler.
  enFin: boolean
}

export function suivreBarre(barre: Barre, position: number, contexte: Contexte): Barre {
  if (!contexte.horsTitre) return { visible: false, ancre: position }
  if (contexte.enFin) return { visible: true, ancre: position }
  if (barre.visible) {
    if (position - barre.ancre >= DESCENTE) return { visible: false, ancre: position }
    return { visible: true, ancre: Math.min(barre.ancre, position) }
  }
  if (barre.ancre - position >= REMONTEE) return { visible: true, ancre: position }
  return { visible: false, ancre: Math.max(barre.ancre, position) }
}
