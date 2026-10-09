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

export type Geste = 'avancer' | 'reculer' | 'rien'

// Classe un geste d'après le déplacement du doigt entre l'appui et le relâchement.
export function classerGeste({ dx, dy }: { dx: number; dy: number }): Geste {
  if (Math.hypot(dx, dy) <= TOUCHER_MAX) return 'avancer'
  if (Math.abs(dx) >= GLISSER_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) return 'reculer'
  return 'rien'
}

const TOUCHES_AVANCER = new Set([' ', 'Enter', 'ArrowRight', 'ArrowDown', 'PageDown'])
const TOUCHES_RECULER = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'])

// Au clavier (ou à la télécommande d'un lecteur d'écran), le sens d'une touche ;
// les autres touches gardent leur rôle ordinaire.
export function toucheDuClavier(touche: string): 'avancer' | 'reculer' | null {
  if (TOUCHES_AVANCER.has(touche)) return 'avancer'
  if (TOUCHES_RECULER.has(touche)) return 'reculer'
  return null
}

// Ce que devient un geste relâché sur le chapelet. Un toucher sur un bouton
// appartient au bouton, et l'annonce ne s'avance que par la grosse perle ;
// ailleurs, il touche la prière, qui défile ou passe à la suivante
// (chapelet/toucher.ts). Un glissement, lui, recule partout.
export function issueDuGeste(
  geste: Geste,
  { surBouton, surAnnonce }: { surBouton: boolean; surAnnonce: boolean },
): 'toucher' | 'reculer' | 'rien' {
  if (geste === 'avancer') return surBouton || surAnnonce ? 'rien' : 'toucher'
  return geste
}
