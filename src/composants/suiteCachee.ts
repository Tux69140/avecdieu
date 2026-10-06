import { useEffect, useRef, useState } from 'react'

// Repère posé à la fin du contenu : tant qu'il n'est pas à l'écran, il reste
// quelque chose à voir plus bas.
export function useSuiteCachee() {
  const fin = useRef<HTMLDivElement>(null)
  const [cachee, setCachee] = useState(false)
  useEffect(() => {
    if (!fin.current || typeof IntersectionObserver === 'undefined') return
    const observateur = new IntersectionObserver(([e]) => setCachee(!e.isIntersecting))
    observateur.observe(fin.current)
    return () => observateur.disconnect()
  }, [])
  return { fin, cachee }
}
