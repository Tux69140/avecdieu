import { describe, expect, it } from 'vitest'
import { serieDuJour } from './serieDuJour'

describe('serieDuJour', () => {
  // Semaine du lundi 5 au dimanche 11 octobre 2026.
  it.each([
    ['lundi', new Date(2026, 9, 5, 8), 'joyeux'],
    ['mardi', new Date(2026, 9, 6, 8), 'douloureux'],
    ['mercredi', new Date(2026, 9, 7, 8), 'glorieux'],
    ['jeudi', new Date(2026, 9, 8, 8), 'lumineux'],
    ['vendredi', new Date(2026, 9, 9, 8), 'douloureux'],
    ['samedi', new Date(2026, 9, 10, 8), 'joyeux'],
    ['dimanche', new Date(2026, 9, 11, 8), 'glorieux'],
  ])('le %s propose les mystères attendus', (_jour, date, serie) => {
    expect(serieDuJour(date)).toBe(serie)
  })

  it('suit le jour local, même juste avant minuit', () => {
    expect(serieDuJour(new Date(2026, 9, 8, 23, 59))).toBe('lumineux')
    expect(serieDuJour(new Date(2026, 9, 9, 0, 1))).toBe('douloureux')
  })
})
