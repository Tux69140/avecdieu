import { useLocation, useNavigate } from 'react-router'

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

// Ce qu'une page des réglages reçoit de la page qui l'ouvre (`LignePage`).
export interface DepuisParente {
  parente?: string
}

// La croix d'une page des réglages remonte d'un niveau, comme le retour
// d'Android : ouverte depuis sa page parente, l'historique y revient ;
// ouverte directement, la page parente la remplace.
export function useRemonter(parente: string): () => void {
  const naviguer = useNavigate()
  const { state } = useLocation()
  return () => {
    if ((state as DepuisParente | null)?.parente === parente) naviguer(-1)
    else naviguer(parente, { replace: true })
  }
}

// Ouvre une page profonde d'un autre écran en empilant ses pages parentes
// (« /reglages », puis « /reglages/rappels ») : le retour d'Android remonte
// alors d'un niveau, comme la croix, avant de revenir là d'où l'on vient.
export function useOuvrirEnProfondeur(): (chemin: string) => Promise<void> {
  const naviguer = useNavigate()
  return async (chemin) => {
    const morceaux = chemin.split('/').filter(Boolean)
    let parente: string | undefined
    for (let i = 1; i <= morceaux.length; i++) {
      const page = `/${morceaux.slice(0, i).join('/')}`
      await naviguer(page, parente ? { state: { parente } satisfies DepuisParente } : undefined)
      parente = page
    }
  }
}
