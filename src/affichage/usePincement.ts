import { useEffect, useRef } from 'react'
import { lireReglages, modifierReglages, TAILLES } from '../chapelet/reglages'
import { creerPincement } from './pincement'

// Dans un office ou au chapelet, pincer ou écarter deux doigts règle la taille
// du texte à prier, retenue dans les réglages. Par les événements tactiles :
// seuls ceux-là laissent empêcher le défilement pendant le geste, quelle que
// soit la direction des doigts.
export function usePincement<T extends HTMLElement>() {
  const zone = useRef<T>(null)
  useEffect(() => {
    const element = zone.current
    if (!element) return
    const pincement = creerPincement((sens) => {
      const rang = TAILLES.indexOf(lireReglages().tailleTexte) + sens
      if (rang >= 0 && rang < TAILLES.length) modifierReglages({ tailleTexte: TAILLES[rang] })
    })
    const points = (e: TouchEvent) => [...e.touches].map((t) => ({ x: t.clientX, y: t.clientY }))
    const poser = (e: TouchEvent) => pincement.poser(points(e))
    const bouger = (e: TouchEvent) => {
      if (e.touches.length !== 2) return
      e.preventDefault()
      pincement.bouger(points(e))
    }
    const lever = () => pincement.lever()
    element.addEventListener('touchstart', poser, { passive: true })
    element.addEventListener('touchmove', bouger, { passive: false })
    element.addEventListener('touchend', lever)
    element.addEventListener('touchcancel', lever)
    return () => {
      element.removeEventListener('touchstart', poser)
      element.removeEventListener('touchmove', bouger)
      element.removeEventListener('touchend', lever)
      element.removeEventListener('touchcancel', lever)
    }
  }, [])
  return zone
}
