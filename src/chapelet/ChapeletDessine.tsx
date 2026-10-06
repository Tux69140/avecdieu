import type { Plan, Point } from './disposition'
import './ChapeletDessine.css'

interface Props {
  plan: Plan
  // Index du grain en cours ; plan.points.length quand le chapelet est terminé.
  grainCourant: number
}

// Le chapelet dessiné : grains passés en or, grain en cours en soleil avec
// halo, grains à venir en nacre cerclée d'or, tous en relief. Les nœuds du fil
// ne sont pas des perles : seul leur halo se voit, lorsqu'on y est.
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
      <defs>
        <Relief id="perle-or" reflet="--or-reflet" teinte="--or" ombre="--or-fonce" />
        <Relief id="perle-nacre" reflet="--nacre-reflet" teinte="--nacre" ombre="--nacre-ombre" />
        <Relief
          id="perle-soleil"
          reflet="--soleil-reflet"
          teinte="--soleil"
          ombre="--soleil-ombre"
        />
      </defs>
      <ellipse className="fil" cx={boucle.cx} cy={boucle.cy} rx={boucle.rx} ry={boucle.ry} />
      <line className="fil" x1={medaille.x} y1={medaille.y} x2={croix.x} y2={croix.y} />
      {/* Quand le Salve Regina s'y dit, la médaille est un grain du déroulé. */}
      {points.at(-1)?.type !== 'medaille' && (
        <ellipse className="medaille" cx={medaille.x} cy={medaille.y} rx={5} ry={6.5} />
      )}
      {points.map((point, i) => (
        <Grain
          key={i}
          point={point}
          etat={i < grainCourant ? 'passe' : i === grainCourant ? 'courant' : 'a-venir'}
        />
      ))}
    </svg>
  )
}

// Une perle bombée : lumière en haut à gauche, ombre sur le bord opposé.
// Un seul chapelet par écran, donc des identifiants fixes.
function Relief({
  id,
  reflet,
  teinte,
  ombre,
}: Record<'id' | 'reflet' | 'teinte' | 'ombre', string>) {
  return (
    <radialGradient id={id} cx="35%" cy="30%" r="75%">
      <stop offset="0" style={{ stopColor: `var(${reflet})` }} />
      <stop offset="0.5" style={{ stopColor: `var(${teinte})` }} />
      <stop offset="1" style={{ stopColor: `var(${ombre})` }} />
    </radialGradient>
  )
}

function Grain({ point, etat }: { point: Point; etat: 'passe' | 'courant' | 'a-venir' }) {
  const { type, x, y, r } = point
  // Le Gloire au Père se dit les doigts sur le fil : aucune perle, seule une
  // lumière sur le fil pendant qu'on le dit.
  if (type === 'noeud')
    return etat === 'courant' ? <circle className="halo halo-fil" cx={x} cy={y} r={r + 3} /> : null
  const classe = `grain grain-${etat}`
  return (
    <g>
      {etat === 'courant' && <circle className="halo" cx={x} cy={y} r={r + 5} />}
      {type === 'medaille' ? (
        // Une médaille reste en or, sauf pendant qu'on y prie.
        <ellipse
          className={etat === 'courant' ? classe : 'grain medaille'}
          cx={x}
          cy={y}
          rx={5}
          ry={6.5}
        />
      ) : type === 'croix' ? (
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
