import { useEffect, useState } from 'react'

// L'heure qu'il est, rafraîchie chaque demi-minute : le soleil glisse sur
// l'arc et la prière du moment change sans rouvrir l'app. Android endort les
// minuteries d'une app en arrière-plan : on relit l'heure à son retour.
export function useMaintenant(): Date {
  const [maintenant, setMaintenant] = useState(() => new Date())
  useEffect(() => {
    const relire = () => setMaintenant(new Date())
    const minuterie = setInterval(relire, 30_000)
    document.addEventListener('visibilitychange', relire)
    return () => {
      clearInterval(minuterie)
      document.removeEventListener('visibilitychange', relire)
    }
  }, [])
  return maintenant
}

// Minutes écoulées depuis minuit, à l'heure du téléphone.
export const minutesDe = (date: Date) => date.getHours() * 60 + date.getMinutes()
