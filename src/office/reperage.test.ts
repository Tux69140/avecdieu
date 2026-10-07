import { describe, expect, it } from 'vitest'
import { etapeALaLigne, etatDePerle, ligneDeLecture } from './reperage'

describe('la ligne de lecture', () => {
  it('au fil de l’office, un quart sous le bandeau', () => {
    // Bandeau jusqu'à 100 px, écran de 500 : un quart des 400 px lisibles.
    expect(ligneDeLecture(100, 500, 2000)).toBe(200)
  })

  it('elle descend en fin d’office, jusqu’au bas de l’écran', () => {
    expect(ligneDeLecture(100, 500, 300)).toBe(200)
    expect(ligneDeLecture(100, 500, 150)).toBe(350)
    expect(ligneDeLecture(100, 500, 0)).toBe(500)
  })
})

describe('l’étape à la ligne', () => {
  it('la dernière dont le début a passé la ligne', () => {
    expect(etapeALaLigne([-500, -10, 180, 400], 200)).toBe(2)
    expect(etapeALaLigne([-500, -10, 250, 400], 200)).toBe(1)
  })

  it('en haut de l’office, la première', () => {
    expect(etapeALaLigne([300, 600], 200)).toBe(0)
    expect(etapeALaLigne([], 200)).toBe(0)
  })
})

describe('l’état d’une perle', () => {
  it('dite, en cours ou à venir', () => {
    expect([0, 1, 2].map((i) => etatDePerle(i, 1))).toEqual(['dite', 'courante', 'a-venir'])
  })
})
