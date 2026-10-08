import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSuiteCachee } from './suiteCachee'

type Rappel = (entrees: Partial<IntersectionObserverEntry>[]) => void
let rappel: Rappel = () => {}

class ObservateurFactice {
  constructor(r: Rappel) {
    rappel = r
  }
  observe() {}
  disconnect() {}
}

function Ecran() {
  const { fin, cachee } = useSuiteCachee()
  return <div ref={fin} data-cachee={cachee ? 'oui' : 'non'} />
}

describe('useSuiteCachee', () => {
  afterEach(() => vi.unstubAllGlobals())

  // Deux changements de mise en page rapprochés (le réglage Vibrations qui
  // s'ajoute au seuil après coup) arrivent ensemble : seul le dernier dit
  // où est la fin de l'écran.
  it('suit le dernier signal quand plusieurs arrivent ensemble', () => {
    vi.stubGlobal('IntersectionObserver', ObservateurFactice)
    const { container } = render(<Ecran />)
    act(() => rappel([{ isIntersecting: true }, { isIntersecting: false }]))
    expect(container.firstElementChild).toHaveAttribute('data-cachee', 'oui')
    act(() => rappel([{ isIntersecting: false }, { isIntersecting: true }]))
    expect(container.firstElementChild).toHaveAttribute('data-cachee', 'non')
  })
})
