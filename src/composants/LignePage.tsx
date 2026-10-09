import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useDepuisIci } from './retour'
import './LignePage.css'

interface Props {
  vers: string
  nom: string
  // Sous le nom, en petit : la valeur retenue ou ce que la page contient.
  resume?: ReactNode
  // Un résumé que le lecteur d'écran n'a pas à lire (il lit la page une fois
  // ouverte) ; une valeur retenue, elle, se lit.
  resumeCache?: boolean
  // La page ouverte prend la place de celle-ci dans l'historique (une autre
  // série de mystères, au seuil du chapelet).
  remplacer?: boolean
}

// Une ligne qui ouvre une autre page, comme une ligne du menu : 48 px au
// moins, le nom en graisse normale, le chevron › à droite (› veut toujours
// dire « ouvre un autre écran »). La page ouverte sait d'où elle vient : sa
// croix y remonte (`useRemonter`).
export function LignePage({ vers, nom, resume, resumeCache, remplacer }: Props) {
  const depuis = useDepuisIci()
  return (
    <Link className="ligne-page" to={vers} replace={remplacer} state={depuis}>
      <span className="ligne-page-nom">{nom}</span>
      {resume && (
        <span className="ligne-page-resume" aria-hidden={resumeCache || undefined}>
          {resume}
        </span>
      )}
    </Link>
  )
}
