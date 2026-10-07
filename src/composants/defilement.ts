import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType, type createBrowserRouter } from 'react-router'

// Chaque écran s'ouvre en haut ; revenir en arrière (le retour d'Android)
// retrouve la place qu'on avait quittée, par exemple au milieu d'un office
// après avoir ouvert le menu.

const positions = new Map<string, number>()

// Relevée juste avant de quitter un écran, quand il est encore affiché.
export function retenirDefilement(routeur: ReturnType<typeof createBrowserRouter>) {
  let quittee = routeur.state.location
  routeur.subscribe(({ location }) => {
    if (location.key === quittee.key) return
    positions.set(quittee.key, scrollY)
    quittee = location
  })
}

export const positionRetenue = (cle: string) => positions.get(cle)

// Un nouvel écran (pas un retour) commence en haut, avant d'être peint.
export function useHautDePage() {
  const { key, pathname } = useLocation()
  const sorte = useNavigationType()
  const chemin = useRef(pathname)
  useLayoutEffect(() => {
    if (pathname !== chemin.current && sorte !== 'POP') scrollTo(0, 0)
    chemin.current = pathname
  }, [key, pathname, sorte])
}
