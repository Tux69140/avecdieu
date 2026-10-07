import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { etapeALaLigne, ligneDeLecture } from './reperage'

// L'écart laissé entre le bandeau et le titre d'une étape où l'on saute.
const RESPIRATION = 16

interface Reperes {
  // Le titre de l'office : le bandeau paraît quand il sort de l'écran.
  titre: RefObject<HTMLElement | null>
  // Le texte de l'office, où chaque étape commence par une ancre [data-etape].
  texte: RefObject<HTMLElement | null>
  bandeau: RefObject<HTMLElement | null>
}

export interface Reperage {
  bandeauVisible: boolean
  courante: number
  allerA: (etape: number) => void
}

// Suit le défilement : l'étape en cours, et s'il faut montrer le bandeau.
export function useReperage({ titre, texte, bandeau }: Reperes, nombre: number): Reperage {
  const [bandeauVisible, setBandeauVisible] = useState(false)
  const [courante, setCourante] = useState(0)
  // Après un saut par le sommaire, l'étape choisie reste « en cours » tant
  // que le priant ne fait pas défiler, même près de la fin où elle ne peut
  // monter jusqu'à la ligne de lecture.
  const epingle = useRef<{ etape: number; position: number } | null>(null)

  // Le haut de l'écran (sous la barre d'Android) et le bas du bandeau.
  const bords = useCallback(() => {
    const element = bandeau.current
    const haut = element ? parseFloat(getComputedStyle(element).top) || 0 : 0
    return { haut, bas: haut + (element?.offsetHeight ?? 0) }
  }, [bandeau])

  const ancres = useCallback(
    () => [...(texte.current?.querySelectorAll<HTMLElement>('[data-etape]') ?? [])],
    [texte],
  )

  const mesurer = useCallback(() => {
    const { haut, bas } = bords()
    const finTitre = titre.current?.getBoundingClientRect().bottom
    setBandeauVisible(finTitre !== undefined && finTitre < haut)
    const fixee = epingle.current
    if (fixee && Math.abs(scrollY - fixee.position) < 2) return setCourante(fixee.etape)
    epingle.current = null
    const reste = document.documentElement.scrollHeight - innerHeight - scrollY
    const debuts = ancres().map((a) => a.getBoundingClientRect().top)
    setCourante(etapeALaLigne(debuts, ligneDeLecture(bas, innerHeight, reste)))
  }, [bords, titre, ancres])

  useEffect(() => {
    let attente = 0
    const plusTard = () => {
      // Le priant a fait défiler depuis le saut : l'étape choisie se libère.
      const fixee = epingle.current
      if (fixee && Math.abs(scrollY - fixee.position) >= 2) epingle.current = null
      cancelAnimationFrame(attente)
      attente = requestAnimationFrame(mesurer)
    }
    plusTard()
    addEventListener('scroll', plusTard, { passive: true })
    addEventListener('resize', plusTard)
    return () => {
      cancelAnimationFrame(attente)
      removeEventListener('scroll', plusTard)
      removeEventListener('resize', plusTard)
    }
  }, [mesurer, nombre])

  const allerA = useCallback(
    (etape: number) => {
      const ancre = ancres()[etape]
      if (!ancre) return
      const { bas } = bords()
      const cible = ancre.getBoundingClientRect().top + scrollY - bas - RESPIRATION
      scrollTo({ top: cible, behavior: 'instant' })
      epingle.current = { etape, position: scrollY }
      mesurer()
      // Le lecteur d'écran reprend au titre de l'étape.
      const titreEtape = ancre.nextElementSibling?.querySelector<HTMLElement>('h2')
      if (!titreEtape) return
      titreEtape.tabIndex = -1
      titreEtape.focus({ preventScroll: true })
    },
    [ancres, bords, mesurer],
  )

  return { bandeauVisible, courante, allerA }
}
