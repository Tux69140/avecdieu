import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ecrireHeure, enMinutes, type Heure } from '../office/heure'
import { NOMS_OFFICES, OFFICES, type NomOffice } from '../office/modele'
import {
  cheminDeLArc,
  ciblesDesPerles,
  ECHELLE_FIXE,
  echelleSolaire,
  etiquetteDuRepere,
  HAUT_DU_BANDEAU,
  HAUTEUR,
  INTERLIGNE,
  JOUR_SOLAIRE,
  LARGEUR,
  LUNE,
  MARGE_DU_BANDEAU,
  pointDeLaPart,
  pointDuCadran,
  RAYON_HALO_SOLEIL,
  RAYON_LUNE,
  RAYON_SOLEIL,
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

const enLargeur = (unites: number) => `${(unites / LARGEUR) * 100}%`
const pourcents = ({ x, y }: Point) => ({ left: enLargeur(x), top: `${(y / HAUTEUR) * 100}%` })

// Le bandeau se loge sous l'arc, à la place que lui laisse la géométrie : un
// padding en % suit la largeur, comme les unités du dessin.
const SOUS_L_ARC = {
  padding: `${enLargeur(HAUT_DU_BANDEAU)} ${enLargeur(MARGE_DU_BANDEAU)} 0`,
}

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
  const points = offices.map(({ heure }) => pointDuCadran(enMinutes(heure), 0, echelle))
  const cibles = ciblesDesPerles(points)
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
        {offices.map(({ nom, heure }, i) => (
          <Link
            key={nom}
            className="cadran-perle"
            to={`/office/${nom}/${date}`}
            // 48 px, ou l'écart à la perle voisine si elle est plus proche.
            style={{ ...pourcents(points[i]), width: `min(48px, ${enLargeur(cibles[i])})` }}
            aria-label={`${NOMS_OFFICES[nom]}, ${ecrireHeure(heure)}`}
            data-etat={journee?.etats[nom] ?? 'a-venir'}
            data-testid={`perle-${nom}`}
          >
            <span />
          </Link>
        ))}
      </div>
      <div className="cadran-centre" style={SOUS_L_ARC}>
        {children}
      </div>
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
      {REPERES.map(({ texte, minutes }) => (
        <Repere key={texte} lignes={[texte]} part={ECHELLE_FIXE(minutes)} />
      ))}
    </>
  )
}

// Heures solaires : l'arc doré du lever au coucher, les pointillés de la
// nuit aux deux bouts.
function ArcSolaire({ soleil }: { soleil: { lever: number; coucher: number } }) {
  const { debut, fin } = JOUR_SOLAIRE
  return (
    <>
      <path className="cadran-arc cadran-nuit" d={cheminDeLArc(0, debut)} />
      <path className="cadran-arc" d={cheminDeLArc(debut, fin)} />
      <path className="cadran-arc cadran-nuit" d={cheminDeLArc(fin, 1)} />
      {reperesSolaires(soleil).map(({ lignes, part }) => (
        <Repere key={lignes[0]} lignes={lignes} part={part} />
      ))}
    </>
  )
}

// Un trait sur l'arc et son étiquette, posée à l'écart des perles et du soleil.
function Repere({ lignes, part }: { lignes: string[]; part: number }) {
  const { x, y } = etiquetteDuRepere(lignes, part)
  return (
    <g>
      <Trait part={part} />
      <text x={x} y={y} textAnchor="middle">
        {lignes.map((ligne, i) => (
          <tspan key={ligne} x={x} dy={i === 0 ? 0 : INTERLIGNE}>
            {ligne}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function Soleil({ centre: { x, y } }: { centre: Point }) {
  return (
    <g className="cadran-soleil" data-testid="soleil">
      <circle className="cadran-halo" cx={x} cy={y} r={RAYON_HALO_SOLEIL} />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6
        return (
          <line
            key={i}
            x1={x + 10 * Math.cos(angle)}
            y1={y + 10 * Math.sin(angle)}
            x2={x + RAYON_SOLEIL * Math.cos(angle)}
            y2={y + RAYON_SOLEIL * Math.sin(angle)}
          />
        )
      })}
      <circle cx={x} cy={y} r={7.5} />
    </g>
  )
}

const R = RAYON_LUNE

// Un croissant tourné vers la droite : deux arcs de même hauteur.
function Lune({ centre: { x, y } }: { centre: Point }) {
  return (
    <path
      className="cadran-lune"
      data-testid="lune"
      d={`M${x} ${y - R} A${R} ${R} 0 1 0 ${x} ${y + R} A${R / 2} ${R} 0 1 1 ${x} ${y - R}Z`}
    />
  )
}
