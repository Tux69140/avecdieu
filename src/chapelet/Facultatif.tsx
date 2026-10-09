import { useLayoutEffect, useRef } from 'react'
import { FACULTATIF } from './libelles'

// « Facultatif » sur une prière d'usage, que « L’essentiel seulement » retire
// (phase 18) : en petites capitales sépia, sous le compteur, aligné sur lui
// et jamais plus large que lui ; sans compteur, à sa place, dans la largeur
// d'un « 1 / 3 », le plus étroit des compteurs. La chasse des lettres change
// d'un téléphone à l'autre : la marque est réduite à la mesure, par une mise à
// l'échelle qui laisse la mise en page telle quelle (aucun titre ne passe à
// la ligne, l'écran ne s'allonge pas).
export function Facultatif({ sousCompteur }: { sousCompteur: boolean }) {
  const marque = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const element = marque.current
    let actif = true
    const ajuster = () => {
      const gabarit = element?.parentElement?.querySelector('[data-gabarit]')
      if (!actif || !element || !gabarit) return
      element.style.transform = ''
      const largeur = element.getBoundingClientRect().width
      const echelle = Math.min(1, gabarit.getBoundingClientRect().width / largeur)
      element.style.transform = `scale(${echelle})`
    }
    ajuster()
    // Les polices arrivées, les largeurs changent.
    void document.fonts.ready.then(ajuster)
    return () => {
      actif = false
    }
  }, [])
  return (
    <>
      {!sousCompteur && (
        <span className="compteur facultatif-gabarit" data-gabarit aria-hidden="true">
          1 / 3
        </span>
      )}
      <span
        ref={marque}
        className={sousCompteur ? 'facultatif facultatif-sous' : 'facultatif'}
        data-testid="facultatif"
      >
        {FACULTATIF}
      </span>
    </>
  )
}
