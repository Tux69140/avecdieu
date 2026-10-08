import type { ReactNode } from 'react'
import './Bascule.css'

interface Props<T extends string> {
  choix: readonly (readonly [T, ReactNode])[]
  valeur: T
  onChoisir: (valeur: T) => void
  // Identifiant du titre qui nomme le choix, ou son nom quand aucun titre ne
  // se voit (le commutateur Chapelet / Rosaire).
  titre?: string
  nom?: string
  className?: string
}

// Un choix entre quelques valeurs côte à côte, l'une toujours retenue.
export function Bascule<T extends string>({
  choix,
  valeur,
  onChoisir,
  titre,
  nom,
  className,
}: Props<T>) {
  return (
    <div
      className={className ? `bascule ${className}` : 'bascule'}
      role="radiogroup"
      aria-labelledby={titre}
      aria-label={nom}
    >
      {choix.map(([v, libelle]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={valeur === v}
          onClick={() => onChoisir(v)}
        >
          {libelle}
        </button>
      ))}
    </div>
  )
}
