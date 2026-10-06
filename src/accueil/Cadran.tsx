import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ecrireHeure, type Heure } from '../office/heures'
import { NOMS_OFFICES, OFFICES, type NomOffice } from '../office/modele'
import {
  cheminDeLArc,
  HAUTEUR,
  LARGEUR,
  pointDuCadran,
  REPERES,
  type Astre,
  type Point,
} from './cadran'
import type { Journee } from './moment'
import './Cadran.css'

interface Props {
  date: string
  heures: Record<NomOffice, Heure | undefined>
  // Aujourd'hui seulement : l'état de chaque office et l'astre à l'heure qu'il
  // est. Un autre jour, les perles ont toutes le même aspect, sans astre.
  journee?: Journee
  astre?: Astre
  // Le bandeau du jour, sous l'arc.
  children: ReactNode
}

// La nuit, le croissant se tient au ciel, sous le sommet de l'arc : posé à
// l'heure qu'il est, il se cacherait derrière la perle des complies.
const LUNE = { x: LARGEUR / 2, y: 64 }

const enMinutes = ({ heures, minutes }: Heure) => heures * 60 + minutes
const pourcents = ({ x, y }: Point) => ({
  left: `${(x / LARGEUR) * 100}%`,
  top: `${(y / HAUTEUR) * 100}%`,
})

// Le cadran de l'accueil : l'arc du jour, ses repères, le soleil ou la lune, et
// chaque office comme une perle qui l'ouvre d'un toucher (passé compris).
export function Cadran({ date, heures, journee, astre, children }: Props) {
  const offices = OFFICES.flatMap((nom) => {
    const heure = heures[nom]
    return heure ? [{ nom, heure }] : []
  })
  return (
    <div className="cadran">
      <div className="cadran-zone">
        <svg viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} aria-hidden="true">
          <path className="cadran-arc" d={cheminDeLArc()} />
          {REPERES.map(({ texte, minutes }) => {
            const a = pointDuCadran(minutes, -5)
            const b = pointDuCadran(minutes, 5)
            const etiquette = pointDuCadran(minutes, 19)
            return (
              <g key={texte}>
                <line className="cadran-trait" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <text x={etiquette.x} y={etiquette.y + 5} textAnchor="middle">
                  {texte}
                </text>
              </g>
            )
          })}
          {astre?.sorte === 'soleil' && <Soleil centre={pointDuCadran(astre.minutes)} />}
          {astre?.sorte === 'lune' && <Lune centre={LUNE} />}
        </svg>
        {offices.map(({ nom, heure }) => (
          <Link
            key={nom}
            className="cadran-perle"
            to={`/office/${nom}/${date}`}
            style={pourcents(pointDuCadran(enMinutes(heure)))}
            aria-label={`${NOMS_OFFICES[nom]}, ${ecrireHeure(heure)}`}
            data-etat={journee?.etats[nom] ?? 'a-venir'}
            data-testid={`perle-${nom}`}
          >
            <span />
          </Link>
        ))}
      </div>
      <div className="cadran-centre">{children}</div>
    </div>
  )
}

function Soleil({ centre: { x, y } }: { centre: Point }) {
  return (
    <g className="cadran-soleil" data-testid="soleil">
      <circle className="cadran-halo" cx={x} cy={y} r={18} />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6
        return (
          <line
            key={i}
            x1={x + 10 * Math.cos(angle)}
            y1={y + 10 * Math.sin(angle)}
            x2={x + 15 * Math.cos(angle)}
            y2={y + 15 * Math.sin(angle)}
          />
        )
      })}
      <circle cx={x} cy={y} r={7.5} />
    </g>
  )
}

// Un croissant tourné vers la droite : deux arcs de même hauteur.
function Lune({ centre: { x, y } }: { centre: Point }) {
  return (
    <path
      className="cadran-lune"
      data-testid="lune"
      d={`M${x} ${y - 10} A10 10 0 1 0 ${x} ${y + 10} A5 10 0 1 1 ${x} ${y - 10}Z`}
    />
  )
}
