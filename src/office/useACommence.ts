import { useEffect, useState } from 'react'

// Au-delà, le priant a commencé à lire.
const DEBUT_DE_LECTURE = 48

// Vrai dès que le priant a fait descendre la page : « Plus bas » ne sert
// qu'avant de commencer, dès qu'on lit il ne ferait qu'estomper la dernière
// ligne (choix du porteur du projet, 2026-10-07).
export function useACommence() {
  const [aCommence, setACommence] = useState(false)
  useEffect(() => {
    if (aCommence) return
    const lire = () => {
      if (scrollY > DEBUT_DE_LECTURE) setACommence(true)
    }
    addEventListener('scroll', lire, { passive: true })
    return () => removeEventListener('scroll', lire)
  }, [aCommence])
  return aCommence
}
