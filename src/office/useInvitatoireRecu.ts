import { useEffect, useRef, type RefObject } from 'react'
import type { Office } from './modele'

// Le lien « Le dire ici » touché, l'invitatoire passe à cet office-ci (par
// `prendre`) et la lecture reprend sur lui, une fois l'office recomposé.
export function useInvitatoireRecu(
  texte: RefObject<HTMLElement | null>,
  office: Office | undefined,
  prendre: () => void,
) {
  const versInvitatoire = useRef(false)

  // Le lien disparaît une fois touché : la lecture reprend sur l'invitatoire.
  useEffect(() => {
    if (!versInvitatoire.current) return
    versInvitatoire.current = false
    const titre = texte.current?.querySelector<HTMLElement>('[data-type="invitatoire"] h2')
    if (!titre) return
    titre.tabIndex = -1
    titre.focus()
  }, [office, texte])

  return () => {
    prendre()
    versInvitatoire.current = true
  }
}
