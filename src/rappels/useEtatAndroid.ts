import { useCallback, useEffect, useState } from 'react'
import { accordNotifications, minuteExacte } from '../telephone/notifications'
import { blocages, fabricant } from '../telephone/sonnerie'
import { rappelsBloques, type EtatAndroid } from './blocage'
import { lireRappels } from './reglages'

// Ce qu'Android accorde, relu à l'ouverture et à chaque retour au premier
// plan : le priant revient des Paramètres du téléphone, ou rouvre l'app après
// en avoir changé un réglage.
export function useEtatAndroid(): [EtatAndroid | undefined, () => void] {
  const [etat, setEtat] = useState<EtatAndroid>()
  const relire = useCallback(() => {
    Promise.all([accordNotifications(), minuteExacte(), fabricant(), blocages()]).then(
      ([accord, exacte, marque, bloque]) => setEtat({ accord, exacte, marque, bloque }),
    )
  }, [])
  useEffect(() => {
    relire()
    const auRetour = () => document.visibilityState === 'visible' && relire()
    document.addEventListener('visibilitychange', auRetour)
    return () => document.removeEventListener('visibilitychange', auRetour)
  }, [relire])
  return [etat, relire]
}

// Pour l'accueil : les rappels ne changent que dans les réglages, qu'on
// quitte pour y revenir ; seul Android se relit en restant sur l'écran.
export function useRappelsBloques(): boolean {
  const [android] = useEtatAndroid()
  const [rappels] = useState(lireRappels)
  return rappelsBloques(rappels, android)
}
