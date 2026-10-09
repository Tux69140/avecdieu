import { useEffect, type RefObject } from 'react'

interface Options {
  // Ce qui prend le focus à l'ouverture (« J’ai compris », l'étape en cours).
  focus?: RefObject<HTMLElement | null>
  // La page, dessous, ne défile pas avec le doigt qui parcourt la fenêtre.
  fixerLaPage?: boolean
  // Refermée quand elle change de contenu ou disparaît, puis rouverte.
  cle?: unknown
}

// Une fenêtre modale (<dialog>) montée seulement quand elle est ouverte :
// elle s'ouvre au montage, par-dessus l'écran assombri.
export function useFenetreModale(
  fenetre: RefObject<HTMLDialogElement | null>,
  { focus, fixerLaPage = false, cle }: Options = {},
) {
  useEffect(() => {
    const dialogue = fenetre.current
    if (dialogue && !dialogue.open) dialogue.showModal?.()
    focus?.current?.focus()
    if (fixerLaPage) document.documentElement.classList.add('sans-defilement')
    return () => {
      if (fixerLaPage) document.documentElement.classList.remove('sans-defilement')
      if (cle !== undefined) dialogue?.close()
    }
    // Les refs et l'option restent les mêmes d'un rendu à l'autre : seule la
    // clé rouvre la fenêtre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle])
}
