// La position dans le chapelet est l'index de la prière en cours ;
// index = nombre de prières signifie que le chapelet est terminé.

export function avancer(index: number, nombreDePrieres: number): number {
  return Math.min(index + 1, nombreDePrieres)
}

export function reculer(index: number): number {
  return Math.max(index - 1, 0)
}

const TOUCHER_MAX = 12
const GLISSER_MIN = 50

type Geste = 'avancer' | 'reculer' | 'rien'

// Classe un geste d'après le déplacement du doigt entre l'appui et le relâchement.
export function classerGeste({ dx, dy }: { dx: number; dy: number }): Geste {
  if (Math.hypot(dx, dy) <= TOUCHER_MAX) return 'avancer'
  if (Math.abs(dx) >= GLISSER_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) return 'reculer'
  return 'rien'
}
