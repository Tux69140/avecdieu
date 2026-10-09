import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { positionRetenue } from '../composants/defilement'
import type { Office } from './modele'

// Revenu du menu par le retour d'Android : la lecture reprend où on l'avait
// laissée, une fois le texte affiché.
export function useLectureRetrouvee(office: Office | undefined) {
  const { key } = useLocation()
  const revenu = useNavigationType() === 'POP'
  const aRetrouver = useRef(revenu ? positionRetenue(key) : undefined)
  useLayoutEffect(() => {
    if (!office || aRetrouver.current === undefined) return
    scrollTo(0, aRetrouver.current)
    aRetrouver.current = undefined
  }, [office])
}
