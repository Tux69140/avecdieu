import { describe, expect, it } from 'vitest'
import { jourVise } from './glissement'

describe('jourVise', () => {
  it('glisser vers la gauche tourne la page : jour suivant', () => {
    expect(jourVise({ dx: -120, dy: 10 })).toBe(1)
  })

  it('glisser vers la droite revient au jour précédent', () => {
    expect(jourVise({ dx: 120, dy: -10 })).toBe(-1)
  })

  it('un toucher, un geste trop court ou trop vertical ne change pas de jour', () => {
    expect(jourVise({ dx: 3, dy: 2 })).toBe(0)
    expect(jourVise({ dx: -40, dy: 0 })).toBe(0)
    expect(jourVise({ dx: -80, dy: 70 })).toBe(0)
    expect(jourVise({ dx: 0, dy: -200 })).toBe(0)
  })
})
