import type { TypeGrain } from './definition'
import type { Deroule } from './deroule'

export interface Point {
  type: TypeGrain
  x: number
  y: number
  r: number
}

export interface Plan {
  largeur: number
  hauteur: number
  points: Point[]
  medaille: { x: number; y: number }
  boucle: { cx: number; cy: number; rx: number; ry: number }
  // Le fil du pendentif, de la médaille au haut de la croix, en chemin SVG.
  pendentif: string
}

// Place occupée le long du fil, en unités (un petit grain = 1).
// La médaille ferme la boucle : elle ne prend aucune place sur le fil.
const ENCOMBREMENT: Record<TypeGrain, number> = {
  croix: 2.6,
  gros: 1.7,
  petit: 1,
  noeud: 0.9,
  medaille: 0,
}
const RAYON: Record<TypeGrain, number> = {
  croix: 9,
  gros: 5.2,
  petit: 3.2,
  noeud: 2.8,
  medaille: 5.2,
}
const ECART_MEDAILLE = 1.4

// À l'horizontale, pour gagner de la hauteur (demande du porteur du projet,
// 2026-10-07) : la boucle, couchée, à gauche ; la médaille à son bout droit ;
// le pendentif qui part de là vers la droite puis s'arrondit vers le bas, pour
// que la croix pende la tête en haut.
const LARGEUR = 300
const MARGE = 6
const PAS_PENDENTIF = 7.4
// Le pendentif : un trait droit, puis un quart de cercle, puis la verticale.
const DROIT = 26
const ARRONDI = 16
const LONGUEUR_PENDENTIF = DROIT + ARRONDI + 2 * RAYON.croix
// La croix (ChapeletDessine) : 11 au-dessus de son centre, 12,4 en dessous.
const HAUT_CROIX = 11
const BAS_CROIX = 12.4
const BOUCLE = {
  cx: MARGE + (LARGEUR - 2 * MARGE - LONGUEUR_PENDENTIF) / 2,
  cy: MARGE + RAYON.gros + 28,
  rx: (LARGEUR - 2 * MARGE - LONGUEUR_PENDENTIF) / 2 - RAYON.gros,
  ry: 28,
}

// Le chapelet dessiné : la boucle elliptique fermée sur la médaille, à droite,
// et le pendentif qui en part vers la droite, de la médaille à la croix. Le
// pendentif porte les grains jusqu'au premier de la première dizaine, la
// boucle le reste.
export function disposer({ pas, grains }: Deroule): Plan {
  const debutBoucle = pas.find((p) => p.dizaine === 1)!.grain + 1
  const pendentif = grains.slice(0, debutBoucle)
  const boucle = grains.slice(debutBoucle)

  const unites = 2 * ECART_MEDAILLE + boucle.reduce((s, t) => s + ENCOMBREMENT[t], 0)
  const ellipse = echantillonnerEllipse()
  const echelle = ellipse.longueur / unites

  const medaille = { x: BOUCLE.cx + BOUCLE.rx, y: BOUCLE.cy }
  // La boucle part de la médaille (à droite), passe par le haut et y revient.
  let curseur = ECART_MEDAILLE
  const pointsBoucle = boucle.map((type) => {
    if (type === 'medaille') return { type, ...medaille, r: RAYON[type] }
    const centre = curseur + ENCOMBREMENT[type] / 2
    curseur += ENCOMBREMENT[type]
    const { x, y } = ellipse.pointA(centre * echelle)
    return { type, x, y, r: RAYON[type] }
  })

  // Le pendentif part de la médaille ; ses grains sont dans l'ordre inverse.
  // La croix pend sous le dernier grain, droite, la tête en haut.
  const fil = filDuPendentif(medaille)
  curseur = ECART_MEDAILLE
  const pointsPendentif = [...pendentif].reverse().map((type) => {
    if (type === 'croix') {
      const attache = fil(curseur * PAS_PENDENTIF)
      return { type, x: attache.x, y: attache.y + HAUT_CROIX, r: RAYON[type] }
    }
    const centre = curseur + ENCOMBREMENT[type] / 2
    curseur += ENCOMBREMENT[type]
    return { type, ...fil(centre * PAS_PENDENTIF), r: RAYON[type] }
  })
  pointsPendentif.reverse()
  const croix = pointsPendentif[0]
  const coude = { x: medaille.x + DROIT, y: medaille.y }

  return {
    largeur: LARGEUR,
    hauteur: Math.ceil(Math.max(BOUCLE.cy + BOUCLE.ry + RAYON.gros, croix.y + BAS_CROIX) + MARGE),
    points: [...pointsPendentif, ...pointsBoucle],
    medaille,
    boucle: BOUCLE,
    pendentif:
      `M${medaille.x} ${medaille.y}H${coude.x}` +
      `A${ARRONDI} ${ARRONDI} 0 0 1 ${coude.x + ARRONDI} ${coude.y + ARRONDI}` +
      `V${croix.y - HAUT_CROIX}`,
  }
}

// Le point du fil du pendentif à une distance de la médaille : tout droit vers
// la droite, puis un quart de cercle vers le bas, puis la verticale.
function filDuPendentif(medaille: { x: number; y: number }) {
  const quart = (Math.PI / 2) * ARRONDI
  return (distance: number) => {
    if (distance <= DROIT) return { x: medaille.x + distance, y: medaille.y }
    if (distance <= DROIT + quart) {
      const angle = (distance - DROIT) / ARRONDI
      return {
        x: medaille.x + DROIT + ARRONDI * Math.sin(angle),
        y: medaille.y + ARRONDI * (1 - Math.cos(angle)),
      }
    }
    return { x: medaille.x + DROIT + ARRONDI, y: medaille.y + ARRONDI + distance - DROIT - quart }
  }
}

// Ellipse paramétrée par la longueur d'arc, en partant du bout droit et en
// passant d'abord par le haut (sens inverse des aiguilles d'une montre).
function echantillonnerEllipse() {
  const n = 2000
  const pts: { x: number; y: number; l: number }[] = []
  let l = 0
  for (let i = 0; i <= n; i++) {
    const t = -(i / n) * 2 * Math.PI
    const x = BOUCLE.cx + BOUCLE.rx * Math.cos(t)
    const y = BOUCLE.cy + BOUCLE.ry * Math.sin(t)
    if (i > 0) l += Math.hypot(x - pts[i - 1].x, y - pts[i - 1].y)
    pts.push({ x, y, l })
  }
  return {
    longueur: l,
    pointA(distance: number) {
      const i = pts.findIndex((p) => p.l >= distance)
      return pts[Math.max(i, 0)]
    },
  }
}
