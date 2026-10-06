import { useNavigate } from 'react-router'

// Revenir d'où l'on vient, comme le bouton retour d'Android ; un écran ouvert
// directement (sans page avant lui) mène au chapelet.
export function useRetour(): () => void {
  const naviguer = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) naviguer(-1)
    else naviguer('/chapelet', { replace: true })
  }
}
