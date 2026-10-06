// La géométrie du cadran de l'accueil : un arc elliptique ouvert vers le bas,
// où les heures se répartissent également de 6 h (gauche) à 22 h (droite)
// (docs/DESIGN.md, maquette du porteur du projet). Coordonnées dans une boîte
// de 360 × 180.

export const LARGEUR = 360
export const HAUTEUR = 180

const DEBUT = 6 * 60
const FIN = 22 * 60
const ANGLE_DEBUT = 165
const ANGLE_FIN = 15
const CX = 180
const CY = 160
const RX = 158
const RY = 124

export interface Point {
  x: number
  y: number
}

// Le point de l'arc pour une heure (minutes depuis minuit), écarté de
// « ecart » vers l'extérieur (positif) ou l'intérieur (négatif).
export function pointDuCadran(minutes: number, ecart = 0): Point {
  const borne = Math.min(FIN, Math.max(DEBUT, minutes))
  const part = (borne - DEBUT) / (FIN - DEBUT)
  const angle = ((ANGLE_DEBUT - part * (ANGLE_DEBUT - ANGLE_FIN)) * Math.PI) / 180
  return { x: CX + (RX + ecart) * Math.cos(angle), y: CY - (RY + ecart) * Math.sin(angle) }
}

// L'arc entier, en chemin SVG.
export function cheminDeLArc(): string {
  const debut = pointDuCadran(DEBUT)
  const fin = pointDuCadran(FIN)
  return `M${debut.x} ${debut.y} A${RX} ${RY} 0 0 1 ${fin.x} ${fin.y}`
}

export const REPERES = [
  { texte: '6 h', minutes: 6 * 60 },
  { texte: 'midi', minutes: 12 * 60 },
  { texte: '18 h', minutes: 18 * 60 },
  { texte: '21 h', minutes: 21 * 60 },
]

// Le soleil entre son lever et son coucher, à l'heure qu'il est ; le croissant
// de lune hors de là.
export interface Astre {
  sorte: 'soleil' | 'lune'
  minutes: number
}

export function astre(minutes: number, soleil: { lever: number; coucher: number }): Astre {
  const jour = minutes >= soleil.lever && minutes < soleil.coucher
  return { sorte: jour ? 'soleil' : 'lune', minutes }
}
