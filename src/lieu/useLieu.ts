import { useEffect, useState } from 'react'
import { LIEU_CHANGE, lireLieu, type ReglagesLieu } from './lieu'

// Le lieu des heures solaires, relu chaque fois qu'il change : en voyage, il
// peut changer juste après l'ouverture, écran déjà affiché.
export function useLieu(): ReglagesLieu {
  const [reglages, setReglages] = useState(lireLieu)
  useEffect(() => {
    const relire = () => setReglages(lireLieu())
    window.addEventListener(LIEU_CHANGE, relire)
    return () => window.removeEventListener(LIEU_CHANGE, relire)
  }, [])
  return reglages
}
