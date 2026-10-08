import { useNavigate } from 'react-router'

// Revenir d'où l'on vient, comme le bouton retour d'Android ; un écran ouvert
// directement (sans page avant lui) mène à l'accueil.
export function useRetour(): () => void {
  const naviguer = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) naviguer(-1)
    else naviguer('/', { replace: true })
  }
}

// « Revenir à l’accueil », en fin d'office : l'historique remonte jusqu'à sa
// première page, pour ne pas empiler un second accueil (le retour d'Android
// ne ferait alors rien de visible). Si l'app s'était ouverte ailleurs (une
// notification), cette première page devient l'accueil.
export function useRetourAccueil(): () => void {
  const naviguer = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx === 0) {
      naviguer('/', { replace: true })
      return
    }
    const arrive = () => {
      if (window.location.pathname !== '/') naviguer('/', { replace: true })
    }
    window.addEventListener('popstate', arrive, { once: true })
    naviguer(-idx)
  }
}
