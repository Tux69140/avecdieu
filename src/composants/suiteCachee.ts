import { useEffect, useRef, useState } from 'react'

// Repère posé à la fin du contenu : tant qu'il n'est pas à l'écran, il reste
// quelque chose à voir plus bas.
export function useSuiteCachee() {
  const fin = useRef<HTMLDivElement>(null)
  const [cachee, setCachee] = useState(false)
  useEffect(() => {
    if (!fin.current || typeof IntersectionObserver === 'undefined') return
    // Plusieurs signaux peuvent arriver d'un coup (mise en page qui bouge deux
    // fois) : seul le dernier est à jour.
    const observateur = new IntersectionObserver((entrees) =>
      setCachee(!entrees[entrees.length - 1].isIntersecting),
    )
    observateur.observe(fin.current)
    return () => observateur.disconnect()
  }, [])
  return { fin, cachee }
}
