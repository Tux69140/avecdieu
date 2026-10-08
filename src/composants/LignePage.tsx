import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import type { DepuisParente } from './retour'
import './LignePage.css'

interface Props {
  vers: string
  nom: string
  // Sous le nom, en petit : la valeur retenue ou ce que la page contient.
  resume?: ReactNode
  // Un résumé que le lecteur d'écran n'a pas à lire (il lit la page une fois
  // ouverte) ; une valeur retenue, elle, se lit.
  resumeCache?: boolean
}

// Une ligne qui ouvre une autre page des réglages, comme une ligne du menu :
// 48 px au moins, le nom en graisse normale, le chevron › à droite (› veut
// toujours dire « ouvre un autre écran »). La page ouverte sait d'où elle
// vient : sa croix y remonte (`useRemonter`).
export function LignePage({ vers, nom, resume, resumeCache }: Props) {
  const { pathname } = useLocation()
  return (
    <Link className="ligne-page" to={vers} state={{ parente: pathname } satisfies DepuisParente}>
      <span className="ligne-page-nom">{nom}</span>
      {resume && (
        <span className="ligne-page-resume" aria-hidden={resumeCache || undefined}>
          {resume}
        </span>
      )}
    </Link>
  )
}
