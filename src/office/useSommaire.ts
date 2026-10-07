import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'

export interface Sommaire {
  ouvert: boolean
  ouvrir: () => void
  fermer: () => void
  choisir: (etape: number) => void
}

// Le sommaire ouvert est une page de l'historique, sur la même adresse : le
// bouton retour d'Android le referme sans quitter l'office. `allerA` conduit
// à l'étape choisie, une fois le volet refermé.
export function useSommaire(allerA: (etape: number) => void): Sommaire {
  const lieu = useLocation()
  const naviguer = useNavigate()
  const ouvert = (lieu.state as { sommaire?: boolean } | null)?.sommaire === true
  const cible = useRef<number | null>(null)
  // Ce qui avait le focus à l'ouverture, pour l'y rendre à la fermeture.
  const ouvreur = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (ouvert) return
    const etape = cible.current
    cible.current = null
    // Après le retour dans l'historique, que le navigateur ne replace pas la
    // page là où elle était à l'ouverture du volet.
    const attente = requestAnimationFrame(() => {
      if (etape === null) return ouvreur.current?.focus({ preventScroll: true })
      allerA(etape)
    })
    return () => cancelAnimationFrame(attente)
  }, [ouvert, allerA])

  return {
    ouvert,
    ouvrir: () => {
      ouvreur.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      naviguer(lieu.pathname, { state: { sommaire: true } })
    },
    fermer: () => naviguer(-1),
    choisir: (etape) => {
      cible.current = etape
      naviguer(-1)
    },
  }
}
