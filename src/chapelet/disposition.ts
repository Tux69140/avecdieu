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
}

// Place occupée le long du fil, en unités (un petit grain = 1).
const ENCOMBREMENT: Record<TypeGrain, number> = { croix: 2.6, gros: 1.7, petit: 1, noeud: 0.9 }
const RAYON: Record<TypeGrain, number> = { croix: 11, gros: 6.5, petit: 4, noeud: 3.5 }
const ECART_MEDAILLE = 1.4

const LARGEUR = 300
const MARGE = 10
const BOUCLE = { cx: LARGEUR / 2, cy: MARGE + 62, rx: LARGEUR / 2 - MARGE, ry: 62 }

// Le chapelet dessiné : une boucle elliptique fermée sur la médaille, et le
// pendentif qui descend jusqu'à la croix. Le pendentif porte les grains
// jusqu'au premier de la première dizaine, la boucle porte le reste.
export function disposer({ pas, grains }: Deroule): Plan {
  const debutBoucle = pas.find((p) => p.dizaine === 1)!.grain + 1
  const pendentif = grains.slice(0, debutBoucle)
  const boucle = grains.slice(debutBoucle)

  const unites = 2 * ECART_MEDAILLE + boucle.reduce((s, t) => s + ENCOMBREMENT[t], 0)
  const ellipse = echantillonnerEllipse()
  const echelle = ellipse.longueur / unites

  // La boucle part de la médaille (en bas) et tourne vers la droite.
  let curseur = ECART_MEDAILLE
  const pointsBoucle = boucle.map((type) => {
    const centre = curseur + ENCOMBREMENT[type] / 2
    curseur += ENCOMBREMENT[type]
    const { x, y } = ellipse.pointA(centre * echelle)
    return { type, x, y, r: RAYON[type] }
  })

  const medaille = { x: BOUCLE.cx, y: BOUCLE.cy + BOUCLE.ry }
  // Le pendentif descend de la médaille ; ses grains sont dans l'ordre inverse.
  curseur = ECART_MEDAILLE
  const pointsPendentif = [...pendentif].reverse().map((type) => {
    const centre = curseur + ENCOMBREMENT[type] / 2
    curseur += ENCOMBREMENT[type]
    return { type, x: medaille.x, y: medaille.y + centre * echelle, r: RAYON[type] }
  })
  pointsPendentif.reverse()

  const croix = pointsPendentif[0]
  return {
    largeur: LARGEUR,
    hauteur: Math.ceil(croix.y + croix.r + MARGE / 2),
    points: [...pointsPendentif, ...pointsBoucle],
    medaille,
    boucle: BOUCLE,
  }
}

// Ellipse paramétrée par la longueur d'arc, en partant du bas et en tournant
// dans le sens inverse des aiguilles d'une montre à l'écran.
function echantillonnerEllipse() {
  const n = 2000
  const pts: { x: number; y: number; l: number }[] = []
  let l = 0
  for (let i = 0; i <= n; i++) {
    const t = Math.PI / 2 - (i / n) * 2 * Math.PI
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
