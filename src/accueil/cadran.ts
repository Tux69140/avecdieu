import { ecrireHeure } from '../office/heures'

// La géométrie du cadran de l'accueil : un arc elliptique ouvert vers le bas
// (docs/DESIGN.md, maquette du porteur du projet). Coordonnées dans une boîte
// de 360 × 180. En heures fixes, les heures se répartissent également de 6 h
// (gauche) à 22 h (droite) ; en heures solaires, l'arc doré va du lever au
// coucher, prolongé aux deux bouts par des pointillés pour les offices de la
// nuit (décision du porteur du projet, 2026-10-07).

export const LARGEUR = 360
export const HAUTEUR = 180

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

// Où tombe une heure (minutes depuis minuit) sur l'arc, de 0 (bout gauche) à
// 1 (bout droit).
export type Echelle = (minutes: number) => number

const borner = (part: number) => Math.min(1, Math.max(0, part))

const DEBUT_FIXE = 6 * 60
const FIN_FIXE = 22 * 60
export const ECHELLE_FIXE: Echelle = (minutes) =>
  borner((minutes - DEBUT_FIXE) / (FIN_FIXE - DEBUT_FIXE))

// La part de l'arc qu'occupe le jour, du lever au coucher.
export const JOUR_SOLAIRE = { debut: 0.1, fin: 0.9 }

// Le jour s'étend sur l'arc doré ; avant le lever, la nuit va du premier
// office au lever, après le coucher, du coucher au dernier office (les
// complies, au bout).
export function echelleSolaire(
  { lever, coucher }: { lever: number; coucher: number },
  heures: number[],
): Echelle {
  const premier = Math.min(...heures.filter((m) => m < lever))
  const dernier = Math.max(...heures.filter((m) => m > coucher))
  const { debut, fin } = JOUR_SOLAIRE
  return (minutes) => {
    if (minutes < lever)
      return Number.isFinite(premier)
        ? (debut * Math.max(0, minutes - premier)) / (lever - premier)
        : debut
    if (minutes > coucher)
      return Number.isFinite(dernier)
        ? borner(fin + ((1 - fin) * (minutes - coucher)) / (dernier - coucher))
        : fin
    return debut + ((fin - debut) * (minutes - lever)) / (coucher - lever)
  }
}

// Le point de l'arc pour une part, écarté de « ecart » vers l'extérieur
// (positif) ou l'intérieur (négatif).
export function pointDeLaPart(part: number, ecart = 0): Point {
  const angle = ((ANGLE_DEBUT - borner(part) * (ANGLE_DEBUT - ANGLE_FIN)) * Math.PI) / 180
  return { x: CX + (RX + ecart) * Math.cos(angle), y: CY - (RY + ecart) * Math.sin(angle) }
}

// Le point de l'arc pour une heure (minutes depuis minuit).
export const pointDuCadran = (minutes: number, ecart = 0, echelle = ECHELLE_FIXE): Point =>
  pointDeLaPart(echelle(minutes), ecart)

// Un morceau de l'arc, en chemin SVG ; l'arc entier par défaut.
export function cheminDeLArc(debut = 0, fin = 1): string {
  const a = pointDeLaPart(debut)
  const b = pointDeLaPart(fin)
  return `M${a.x} ${a.y} A${RX} ${RY} 0 0 1 ${b.x} ${b.y}`
}

export const REPERES = [
  { texte: '6 h', minutes: 6 * 60 },
  { texte: 'midi', minutes: 12 * 60 },
  { texte: '18 h', minutes: 18 * 60 },
  { texte: '21 h', minutes: 21 * 60 },
]

export interface RepereSolaire {
  lignes: string[]
  part: number
}

const enHeure = (minutes: number) => ({
  heures: Math.floor(minutes / 60),
  minutes: Math.round(minutes % 60),
})

// « LEVER 7 H 52 · MIDI · COUCHER 18 H 40 » (petites capitales du cadran).
export function reperesSolaires(soleil: { lever: number; coucher: number }): RepereSolaire[] {
  return [
    { lignes: ['lever', ecrireHeure(enHeure(soleil.lever))], part: JOUR_SOLAIRE.debut },
    { lignes: ['midi'], part: 0.5 },
    { lignes: ['coucher', ecrireHeure(enHeure(soleil.coucher))], part: JOUR_SOLAIRE.fin },
  ]
}

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
