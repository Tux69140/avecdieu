import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router'
import { PRIERES_SEULES, type PriereSeuleId } from '../prieres/seules'

// Ce qu'une ligne ouvre : dans le menu, l'écran remplace le menu ; depuis une
// page du menu, il remplace le menu et sa page (`useQuitterLeMenu`).
type Ouvrir = (chemin: string) => void

interface LienProps {
  vers: string
  ouvrir?: Ouvrir
  children: ReactNode
}

function LienMenu({ vers, ouvrir, children }: LienProps) {
  const toucher = ouvrir
    ? (e: MouseEvent) => {
        e.preventDefault()
        ouvrir(vers)
      }
    : undefined
  return (
    <Link className="avec-chevron" to={vers} replace onClick={toucher}>
      {children}
    </Link>
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
