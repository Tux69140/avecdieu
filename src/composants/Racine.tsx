import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { signalerPremierAffichage } from '../telephone/demarrage'
import { useHautDePage } from './defilement'

// Ce que partagent tous les écrans : ils s'ouvrent en haut de la page, et le
// premier rendu congédie l'écran de démarrage d'Android.
export function Racine() {
  useHautDePage()
  useEffect(signalerPremierAffichage, [])
  return <Outlet />
}
