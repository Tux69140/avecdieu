import { describe, expect, it } from 'vitest'
import { avancer, classerGeste, reculer } from './navigation'

describe('navigation dans le chapelet', () => {
  it('avance d’une prière, jusqu’à l’écran de fin (index = nombre de prières)', () => {
    expect(avancer(0, 67)).toBe(1)
    expect(avancer(66, 67)).toBe(67)
    expect(avancer(67, 67)).toBe(67)
  })

  it('recule d’une prière, sans passer avant la première', () => {
    expect(reculer(67)).toBe(66)
    expect(reculer(1)).toBe(0)
    expect(reculer(0)).toBe(0)
  })
})

describe('classerGeste', () => {
  it('un toucher bref et immobile avance', () => {
    expect(classerGeste({ dx: 3, dy: -4 })).toBe('avancer')
  })

  it('un glissement horizontal, dans un sens ou dans l’autre, recule', () => {
    expect(classerGeste({ dx: 80, dy: 10 })).toBe('reculer')
    expect(classerGeste({ dx: -80, dy: 10 })).toBe('reculer')
  })

  it('un glissement vertical (défilement du texte) ne fait rien', () => {
    expect(classerGeste({ dx: 10, dy: 120 })).toBe('rien')
  })

  it('un geste hésitant, entre toucher et glissement, ne fait rien', () => {
    expect(classerGeste({ dx: 25, dy: 0 })).toBe('rien')
  })
})
