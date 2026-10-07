import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ecrireHeure, type Heure } from '../office/heures'
import { NOMS_OFFICES, OFFICES, type NomOffice } from '../office/modele'
import {
  cheminDeLArc,
  ECHELLE_FIXE,
  echelleSolaire,
  HAUTEUR,
  JOUR_SOLAIRE,
  LARGEUR,
  pointDeLaPart,
  pointDuCadran,
  REPERES,
  reperesSolaires,
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
  // En heures solaires : le lever et le coucher du jour affiché (minutes).
  soleil?: { lever: number; coucher: number }
  // Le bandeau du jour, sous l'arc.
  children: ReactNode
}

// La nuit, le croissant se tient au ciel, sous le sommet de l'arc : posé à
// l'heure qu'il est, il se cacherait derrière la perle des complies.
const LUNE = { x: LARGEUR / 2, y: 66 }

const enMinutes = ({ heures, minutes }: Heure) => heures * 60 + minutes
const pourcents = ({ x, y }: Point) => ({
  left: `${(x / LARGEUR) * 100}%`,
  top: `${(y / HAUTEUR) * 100}%`,
})

// Le cadran de l'accueil : l'arc du jour, ses repères, le soleil ou la lune, et
// chaque office comme une perle qui l'ouvre d'un toucher (passé compris).
export function Cadran({ date, heures, journee, astre, soleil, children }: Props) {
  const offices = OFFICES.flatMap((nom) => {
    const heure = heures[nom]
    return heure ? [{ nom, heure }] : []
  })
  const echelle = soleil
    ? echelleSolaire(
        soleil,
        offices.map(({ heure }) => enMinutes(heure)),
      )
    : ECHELLE_FIXE
  return (
    <div className="cadran">
      <div className="cadran-zone">
        <svg viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} aria-hidden="true">
          {soleil ? <ArcSolaire soleil={soleil} /> : <ArcFixe />}
          {astre?.sorte === 'soleil' && (
            <Soleil centre={pointDuCadran(astre.minutes, 0, echelle)} />
          )}
          {astre?.sorte === 'lune' && <Lune centre={LUNE} />}
        </svg>
        {offices.map(({ nom, heure }) => (
          <Link
            key={nom}
            className="cadran-perle"
            to={`/office/${nom}/${date}`}
            style={pourcents(pointDuCadran(enMinutes(heure), 0, echelle))}
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

function Trait({ part }: { part: number }) {
  const a = pointDeLaPart(part, -5)
  const b = pointDeLaPart(part, 5)
  return <line className="cadran-trait" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
}

// Heures fixes : l'arc entier, de 6 h à 22 h, et ses repères d'heure.
function ArcFixe() {
  return (
    <>
      <path className="cadran-arc" d={cheminDeLArc()} />
      {REPERES.map(({ texte, minutes }) => {
        const part = ECHELLE_FIXE(minutes)
        const etiquette = pointDeLaPart(part, 19)
        return (
          <g key={texte}>
            <Trait part={part} />
            <text x={etiquette.x} y={etiquette.y + 5} textAnchor="middle">
              {texte}
            </text>
          </g>
        )
      })}
    </>
  )
}

// Heures solaires : l'arc doré du lever au coucher, les pointillés de la
// nuit aux deux bouts. Les repères du lever et du coucher se logent au-dessus
// des bouts de l'arc, alignés sur les bords, pour ne pas couvrir les perles.
function ArcSolaire({ soleil }: { soleil: { lever: number; coucher: number } }) {
  const { debut, fin } = JOUR_SOLAIRE
  return (
    <>
      <path className="cadran-arc cadran-nuit" d={cheminDeLArc(0, debut)} />
      <path className="cadran-arc" d={cheminDeLArc(debut, fin)} />
      <path className="cadran-arc cadran-nuit" d={cheminDeLArc(fin, 1)} />
      {reperesSolaires(soleil).map(({ lignes, part }) => {
        const bord = part < 0.5 ? 'gauche' : part > 0.5 ? 'droite' : 'sommet'
        const point = pointDeLaPart(part, 19)
        const x = bord === 'gauche' ? MARGE : bord === 'droite' ? LARGEUR - MARGE : point.x
        const y = bord === 'sommet' ? point.y + 5 : point.y - 30
        const ancre = bord === 'gauche' ? 'start' : bord === 'droite' ? 'end' : 'middle'
        return (
          <g key={lignes[0]}>
            <Trait part={part} />
            <text x={x} y={y} textAnchor={ancre}>
              {lignes.map((ligne, i) => (
                <tspan key={ligne} x={x} dy={i === 0 ? 0 : 16}>
                  {ligne}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </>
  )
}

const MARGE = 2

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
