import {
  useEffect,
  useLayoutEffect,
  useRef,
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
} from 'react'
import { glissement } from '../composants/defilement'
import { avancer, classerGeste, issueDuGeste, reculer, toucheDuClavier } from './navigation'
import { deciderToucher } from './toucher'

// Un toucher sur un bouton, un lien ou une fenêtre leur appartient : il
// n'avance pas le chapelet.
const estInteractif = (cible: EventTarget) =>
  cible instanceof Element && cible.closest('button, a, input, label, dialog') !== null

// Ce que l'écran montre au moment d'un toucher, pour décider s'il descend ou
// avance (chapelet/toucher.ts). Les bandes sous les barres d'Android et le
// signal « Plus bas » cachent le haut et le bas de la fenêtre.
function mesurerPage(depuisDefilement: number) {
  const haut = document.querySelector('.voile-barre-haut')?.getBoundingClientRect().bottom ?? 0
  const bas = document.querySelector('.voile-barre-bas')?.getBoundingClientRect().top
  const basVisible = bas ?? window.innerHeight
  const indice = document.querySelector('.indice-suite-flottant')?.getBoundingClientRect().top
  const texte = document.querySelector('[data-testid="priere"] .priere-texte')
  return {
    depuisDefilement,
    basContenu: texte?.getBoundingClientRect().bottom ?? -Infinity,
    hautVisible: haut,
    basVisible,
    recouvert: indice === undefined ? 0 : Math.max(basVisible - indice, 0),
    // Une ligne et l'écart qui la sépare de la suivante (TextePriere.css).
    ligne: parseFloat(getComputedStyle(texte ?? document.body).fontSize) * 1.75,
  }
}

interface Position {
  // L'index de la prière en cours ; égal à `nombre`, le chapelet est terminé.
  index: number
  nombre: number
  setIndex: Dispatch<SetStateAction<number>>
  // L'annonce ne s'avance que par la grosse perle.
  surAnnonce: boolean
  // L'aide aux gestes ouverte retient tous les gestes.
  aideOuverte: boolean
}

// Les gestes du chapelet : toucher pour avancer (ou faire défiler une prière
// plus haute que l'écran), glisser pour revenir, et les mêmes au clavier.
// Rend les gestionnaires du doigt à poser sur l'écran.
export function useGestesChapelet(position: Position) {
  const { nombre, setIndex, surAnnonce, aideOuverte } = position
  const dernierDefilement = useDefilement(position.index)
  useClavier(position)
  const debutGeste = useRef<{
    id: number
    x: number
    y: number
    surBouton: boolean
    depuisDefilement: number
  } | null>(null)

  const onPointerDown = (e: PointerEvent) => {
    // Un deuxième doigt : c'est un pincement (taille du texte), pas un toucher.
    if (!e.isPrimary) debutGeste.current = null
    if (aideOuverte || !e.isPrimary || e.button !== 0) return
    debutGeste.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      surBouton: estInteractif(e.target),
      depuisDefilement: performance.now() - dernierDefilement.current,
    }
  }
  // Un toucher sur une prière plus haute que l'écran la fait d'abord défiler.
  const toucherPriere = (depuisDefilement: number) => {
    const decision = deciderToucher(mesurerPage(depuisDefilement))
    if (decision.sorte === 'avancer') setIndex((i) => avancer(i, nombre))
    else if (decision.sorte === 'descendre')
      window.scrollBy({ top: decision.de, behavior: glissement() })
  }
  const onPointerUp = (e: PointerEvent) => {
    const debut = debutGeste.current
    debutGeste.current = null
    if (aideOuverte || !debut || debut.id !== e.pointerId) return
    const geste = classerGeste({ dx: e.clientX - debut.x, dy: e.clientY - debut.y })
    const issue = issueDuGeste(geste, { surBouton: debut.surBouton, surAnnonce })
    if (issue === 'toucher') toucherPriere(debut.depuisDefilement)
    else if (issue === 'reculer') setIndex(reculer)
  }
  const onPointerCancel = () => (debutGeste.current = null)

  return { onPointerDown, onPointerUp, onPointerCancel }
}

// L'instant du dernier défilement fait par le priant : un toucher qui arrête
// un défilement en cours ne compte pas (chapelet/toucher.ts).
function useDefilement(index: number) {
  // Le retour en haut de page que l'app fait elle-même à chaque prière ne
  // compte pas comme un défilement.
  const dernierDefilement = useRef(-Infinity)
  const remiseEnHaut = useRef(false)

  // Chaque prière s'ouvre en haut, comme tout écran : après une annonce qu'on
  // a fait défiler, la suivante ne s'ouvre pas à mi-hauteur.
  // (Entre accolades : les navigateurs récents rendent une promesse, que React
  // prendrait pour un nettoyage.)
  useLayoutEffect(() => {
    if (window.scrollY === 0) return
    remiseEnHaut.current = true
    window.scrollTo(0, 0)
  }, [index])

  useEffect(() => {
    const defiler = () => {
      if (remiseEnHaut.current) remiseEnHaut.current = false
      else dernierDefilement.current = performance.now()
    }
    window.addEventListener('scroll', defiler, { passive: true })
    return () => window.removeEventListener('scroll', defiler)
  }, [])

  return dernierDefilement
}

function useClavier({ nombre, setIndex, surAnnonce, aideOuverte }: Position) {
  useEffect(() => {
    const auClavier = (e: KeyboardEvent) => {
      if (aideOuverte || (e.target instanceof Element && estInteractif(e.target))) return
      const sens = toucheDuClavier(e.key)
      if (sens === null) return
      if (sens === 'reculer') setIndex(reculer)
      else if (!surAnnonce) setIndex((i) => avancer(i, nombre))
      e.preventDefault()
    }
    window.addEventListener('keydown', auClavier)
    return () => window.removeEventListener('keydown', auClavier)
  }, [nombre, surAnnonce, aideOuverte, setIndex])
}
