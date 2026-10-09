import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { REGLAGES_CHANGES } from '../reglages/reglages'
import { suivreBarre, type Barre } from './barre'
import { etapeALaLigne, ligneDeLecture } from './reperage'

// L'écart laissé entre le bandeau et le titre d'une étape où l'on saute.
const RESPIRATION = 16
// Après un changement de taille du texte (pincement), la page se remet en
// place : ce défilement-là n'est pas celui du priant.
const GEL_APRES_TAILLE = 400
// En deçà, on est au bout de l'office.
const FIN = 8

interface Reperes {
  // Le titre de l'office : le bandeau ne paraît qu'une fois sorti de l'écran.
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

// Suit le défilement : l'étape en cours, et s'il faut montrer le bandeau
// (src/office/barre.ts : caché en lisant, de retour quand on remonte).
export function useReperage({ titre, texte, bandeau }: Reperes, nombre: number): Reperage {
  const [bandeauVisible, setBandeauVisible] = useState(false)
  const [courante, setCourante] = useState(0)
  // Après un saut par le sommaire, l'étape choisie reste « en cours » tant
  // que le priant ne fait pas défiler, même près de la fin où elle ne peut
  // monter jusqu'à la ligne de lecture.
  const epingle = useRef<{ etape: number; position: number } | null>(null)
  const barre = useRef<Barre>({ visible: false, ancre: 0 })
  const gelJusqua = useRef(0)

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
    const reste = document.documentElement.scrollHeight - innerHeight - scrollY
    if (performance.now() < gelJusqua.current) barre.current.ancre = scrollY
    else
      barre.current = suivreBarre(barre.current, scrollY, {
        horsTitre: finTitre !== undefined && finTitre < haut,
        enFin: reste < FIN,
      })
    setBandeauVisible(barre.current.visible)
    const fixee = epingle.current
    if (fixee && Math.abs(scrollY - fixee.position) < 2) return setCourante(fixee.etape)
    epingle.current = null
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
    const geler = () => {
      gelJusqua.current = performance.now() + GEL_APRES_TAILLE
      plusTard()
    }
    plusTard()
    addEventListener('scroll', plusTard, { passive: true })
    addEventListener('resize', geler)
    addEventListener(REGLAGES_CHANGES, geler)
    return () => {
      cancelAnimationFrame(attente)
      removeEventListener('scroll', plusTard)
      removeEventListener('resize', geler)
      removeEventListener(REGLAGES_CHANGES, geler)
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
      // Après un saut, la barre reste là jusqu'à ce qu'on reprenne la lecture.
      barre.current = { visible: true, ancre: scrollY }
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
