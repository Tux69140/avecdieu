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

// Depuis une page du menu (Offices du jour, Prières), ouverte par-dessus lui :
// l'écran choisi remplace le menu et sa page, si bien que son retour ramène là
// d'où le menu a été ouvert, comme depuis le menu lui-même.
export function useQuitterLeMenu(): (chemin: string) => void {
  const naviguer = useNavigate()
  const { state } = useLocation()
  return (chemin) => {
    if ((state as DepuisParente | null)?.parente !== '/menu') {
      void naviguer(chemin, { replace: true })
      return
    }
    window.addEventListener('popstate', () => void naviguer(chemin, { replace: true }), {
      once: true,
    })
    void naviguer(-1)
  }
}

// Ce qu'une page des réglages reçoit de la page qui l'ouvre (`LignePage`).
export interface DepuisParente {
  parente?: string
  // Ouverte d'un autre écran que sa parente (le seuil du chapelet) : la croix
  // y revient, comme le retour d'Android.
  revenir?: boolean
  // Ouverte du seuil du Rosaire : « Prières du Rosaire » (phase 17).
  rosaire?: boolean
  // Une page du menu : le jour de ses offices, et l'office d'où le menu a été
  // ouvert.
  depuis?: string
  office?: string
}

// L'adresse d'une page des réglages dit sa place : sa page parente est
// l'adresse sans son dernier morceau (« /reglages/rappels/laudes » →
// « /reglages/rappels »).
export const pageParente = (chemin: string) => chemin.slice(0, chemin.lastIndexOf('/')) || '/'

// Ce qu'emporte une page des réglages ouverte d'ici : sa croix y remonte.
export function useDepuisIci(): DepuisParente {
  return { parente: useLocation().pathname }
}

// La croix d'une page des réglages remonte d'un niveau, comme le retour
// d'Android : ouverte depuis sa page parente, l'historique y revient ;
// ouverte directement, la page parente la remplace.
export function useRemonter(): () => void {
  const naviguer = useNavigate()
  const { pathname, state } = useLocation()
  const parente = pageParente(pathname)
  return () => {
    const depuis = state as DepuisParente | null
    if (depuis?.parente === parente || depuis?.revenir) naviguer(-1)
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
