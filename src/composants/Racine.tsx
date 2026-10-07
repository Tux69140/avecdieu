import { Outlet } from 'react-router'
import { useHautDePage } from './defilement'

// Ce que partagent tous les écrans : ils s'ouvrent en haut de la page.
export function Racine() {
  useHautDePage()
  return <Outlet />
}
