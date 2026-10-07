import { useRef, type PointerEvent } from 'react'
import { jourVise } from './glissement'

// Les gestionnaires à poser sur le cadran : un glissement franc appelle
// « changer » avec le sens voulu. Parti d'une perle, il n'ouvre pas son
// office : le navigateur ne fait pas d'un doigt qui a glissé un toucher.
export function useGlisserLesJours(changer: (sens: -1 | 1) => void) {
  const debut = useRef<{ id: number; x: number; y: number } | null>(null)
  return {
    onPointerDown: (e: PointerEvent) => {
      if (e.isPrimary) debut.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
    },
    onPointerUp: (e: PointerEvent) => {
      const appui = debut.current
      debut.current = null
      if (!appui || appui.id !== e.pointerId) return
      const sens = jourVise({ dx: e.clientX - appui.x, dy: e.clientY - appui.y })
      if (sens !== 0) changer(sens)
    },
    onPointerCancel: () => {
      debut.current = null
    },
  }
}
