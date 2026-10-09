import { describe, expect, it } from 'vitest'
import { estSerie, joursDeLaSerie, serieDuJour } from './serieDuJour'

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

describe('joursDeLaSerie', () => {
  it('dit les jours habituels de chaque série, en commençant par le lundi', () => {
    expect(joursDeLaSerie('joyeux')).toBe('Le lundi et le samedi')
    expect(joursDeLaSerie('douloureux')).toBe('Le mardi et le vendredi')
    expect(joursDeLaSerie('glorieux')).toBe('Le mercredi et le dimanche')
    expect(joursDeLaSerie('lumineux')).toBe('Le jeudi')
  })
})

// Une adresse comme /chapelet/toString ne doit pas passer pour une série :
// toString est une propriété héritée de tout objet.
describe('estSerie', () => {
  it('reconnaît les quatre séries, et elles seules', () => {
    for (const serie of ['joyeux', 'lumineux', 'douloureux', 'glorieux'])
      expect(estSerie(serie)).toBe(true)
    for (const autre of ['toString', 'constructor', '__proto__', 'hasOwnProperty', 'inconnue'])
      expect(estSerie(autre)).toBe(false)
  })
})
