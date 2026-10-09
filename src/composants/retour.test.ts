import { describe, expect, it } from 'vitest'
import { pageParente } from './retour'

describe('pageParente', () => {
  it('l’adresse sans son dernier morceau', () => {
    expect(pageParente('/reglages/rappels/laudes')).toBe('/reglages/rappels')
    expect(pageParente('/reglages/chapelet/prieres')).toBe('/reglages/chapelet')
    expect(pageParente('/reglages/reinitialiser')).toBe('/reglages')
  })

  it('au-dessus des réglages, l’accueil', () => {
    expect(pageParente('/reglages')).toBe('/')
  })
})
