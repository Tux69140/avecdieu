import { describe, expect, it } from 'vitest'
import { routeDuRaccourci } from './raccourcis'

// Les raccourcis de l'icône de l'app (appui long), 2026-10-09.
describe('routeDuRaccourci', () => {
  const MARDI = (h: number, m = 0) => new Date(2026, 9, 6, h, m)

  it('le Chapelet et le Rosaire ouvrent leur seuil', () => {
    expect(routeDuRaccourci('avecdieu://chapelet', MARDI(10))).toBe('/chapelet')
    expect(routeDuRaccourci('avecdieu://rosaire', MARDI(10))).toBe('/rosaire')
  })

  it('la prière du moment ouvre l’office ou le chapelet de l’heure', () => {
    expect(routeDuRaccourci('avecdieu://moment', MARDI(7, 10))).toBe('/office/laudes/2026-10-06')
    expect(routeDuRaccourci('avecdieu://moment', MARDI(20, 5))).toBe('/chapelet')
  })

  it('sans prière du moment, l’accueil', () => {
    expect(routeDuRaccourci('avecdieu://moment', MARDI(10, 30))).toBe('/')
  })

  it('une adresse inconnue ou d’un autre schéma : rien', () => {
    expect(routeDuRaccourci('avecdieu://messe', MARDI(10))).toBeUndefined()
    expect(routeDuRaccourci('https://exemple.fr/chapelet', MARDI(10))).toBeUndefined()
  })
})
