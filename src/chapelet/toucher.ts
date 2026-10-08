// Un toucher sur une prière plus haute que l'écran (Litanies, Salve Regina,
// saint Joseph…), décision du porteur du projet (2026-10-08) : tant que le bas
// n'est pas affiché, il fait descendre la page d'un écran ; le bas affiché, il
// passe à la prière suivante. Sur un écran où tout tient, rien ne change. Le
// bas qui compte est celui de la prière : en compact, un passage du mystère
// déplié sous elle ne retient pas le toucher.

// Un défilement vu il y a moins que cela (en ms) est encore en mouvement : le
// doigt qui se pose l'arrête, et ce toucher-là ne compte pas.
export const DEFILEMENT_RECENT = 100

// Lignes de la page précédente gardées en haut, pour ne pas perdre le fil.
const LIGNES_GARDEES = 2

// Ce qu'on sait de la page au moment du toucher, en pixels, dans le repère de
// la fenêtre.
export interface EtatPage {
  // Temps écoulé depuis le dernier défilement, quand le doigt s'est posé (ms).
  depuisDefilement: number
  // Le bas du texte de la prière ; -Infinity sans texte affiché (mode compact).
  basContenu: number
  // La zone visible, entre les barres d'Android.
  hautVisible: number
  basVisible: number
  // Ce que le signal « Plus bas » recouvre au bas de la zone visible.
  recouvert: number
  // La hauteur d'une ligne de la prière.
  ligne: number
}

export type Toucher =
  { sorte: 'ignorer' } | { sorte: 'avancer' } | { sorte: 'descendre'; de: number }

export function deciderToucher(page: EtatPage): Toucher {
  if (page.depuisDefilement < DEFILEMENT_RECENT) return { sorte: 'ignorer' }
  // Moins d'un pixel caché (arrondis du navigateur) : le bas est affiché,
  // au-dessus du signal « Plus bas ».
  const reste = page.basContenu - (page.basVisible - page.recouvert)
  if (reste < 1) return { sorte: 'avancer' }
  const ecran = page.basVisible - page.recouvert - page.hautVisible - LIGNES_GARDEES * page.ligne
  return { sorte: 'descendre', de: Math.min(reste, Math.max(ecran, page.ligne)) }
}
