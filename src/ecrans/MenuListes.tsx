import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router'
import { QuandPriere } from '../composants/QuandPriere'
import { ecrireHeure } from '../office/heure'
import { heuresDuJour } from '../office/heures'
import { PerleEtape } from '../office/FilDePerles'
import { cheminOffice, NOMS_OFFICES, OFFICES } from '../office/modele'
import { PRIERES_SEULES, type PriereSeuleId } from '../prieres/seules'

// Ce qu'une ligne ouvre : dans le menu, l'écran remplace le menu ; depuis une
// page du menu, il remplace le menu et sa page (`useQuitterLeMenu`).
type Ouvrir = (chemin: string) => void

interface LienProps {
  vers: string
  ouvrir?: Ouvrir
  children: ReactNode
  'aria-current'?: 'page'
}

function LienMenu({ vers, ouvrir, children, ...reste }: LienProps) {
  const toucher = ouvrir
    ? (e: MouseEvent) => {
        e.preventDefault()
        ouvrir(vers)
      }
    : undefined
  return (
    <Link className="avec-chevron" to={vers} replace onClick={toucher} {...reste}>
      {children}
    </Link>
  )
}

// Les sept offices du jour, à leur heure ; celui d'où l'on vient est marqué.
export function OfficesDuMenu({
  date,
  office,
  ouvrir,
}: {
  date: string
  office?: string
  ouvrir?: Ouvrir
}) {
  const heures = heuresDuJour(date)
  return (
    <ul className="menu-liste menu-prieres" aria-label="Offices du jour">
      {OFFICES.map((nom) => {
        const heure = heures[nom]
        const ouvert = nom === office
        return (
          <li key={nom}>
            <LienMenu
              vers={cheminOffice(nom, date)}
              ouvrir={ouvrir}
              aria-current={ouvert ? 'page' : undefined}
            >
              <span className="menu-priere">
                {ouvert && <PerleEtape etat="courante" />}
                {NOMS_OFFICES[nom]}
              </span>
              <QuandPriere
                priere={nom}
                heure={heure ? ecrireHeure(heure) : 'à toute heure'}
                discret
              />
            </LienMenu>
          </li>
        )
      })}
    </ul>
  )
}

// Une prière seule : sa page remplace le menu, comme les autres écrans.
export function LienPriere({ id, ouvrir }: { id: PriereSeuleId; ouvrir?: Ouvrir }) {
  return (
    <li>
      <LienMenu vers={`/priere/${id}`} ouvrir={ouvrir}>
        {PRIERES_SEULES[id].titre}
      </LienMenu>
    </li>
  )
}
