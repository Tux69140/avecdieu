import type { Plan, Point } from './disposition'
import './ChapeletDessine.css'

interface Props {
  plan: Plan
  // Index du grain en cours ; plan.points.length quand le chapelet est terminé.
  grainCourant: number
}

// Le chapelet dessiné : grains passés en or plein, grain en cours en soleil
// avec halo, grains à venir en cercle or. Les nœuds du fil ne se voient que
// lorsqu'on y est.
export function ChapeletDessine({ plan, grainCourant }: Props) {
  const { boucle, medaille, points, largeur, hauteur } = plan
  const croix = points[0]
  return (
    <svg
      className="chapelet-dessine"
      data-testid="chapelet-dessine"
      data-grain-courant={grainCourant}
      viewBox={`0 0 ${largeur} ${hauteur}`}
      role="img"
      aria-label="Chapelet"
    >
      <ellipse className="fil" cx={boucle.cx} cy={boucle.cy} rx={boucle.rx} ry={boucle.ry} />
      <line className="fil" x1={medaille.x} y1={medaille.y} x2={croix.x} y2={croix.y} />
      <ellipse className="medaille" cx={medaille.x} cy={medaille.y} rx={5} ry={6.5} />
      {points.map((point, i) => (
        <Grain key={i} point={point} etat={i < grainCourant ? 'passe' : i === grainCourant ? 'courant' : 'a-venir'} />
      ))}
    </svg>
  )
}

function Grain({ point, etat }: { point: Point; etat: 'passe' | 'courant' | 'a-venir' }) {
  const { type, x, y, r } = point
  if (type === 'noeud' && etat !== 'courant') return null
  const classe = `grain grain-${etat}`
  return (
    <g>
      {etat === 'courant' && <circle className="halo" cx={x} cy={y} r={r + 5} />}
      {type === 'croix' ? (
        <path
          className={classe}
          d={`M${x - 1.8} ${y - 11}h3.6v6h5v3.6h-5v12.4h-3.6v-12.4h-5v-3.6h5z`}
        />
      ) : (
        <circle className={classe} cx={x} cy={y} r={r} />
      )}
    </g>
  )
}
