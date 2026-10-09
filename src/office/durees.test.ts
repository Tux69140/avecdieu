import { describe, expect, it } from 'vitest'
import { DUREES, direDuree, ecrireDuree, nombreEnLettres } from './durees'

describe('durées affichées (PRD, 2026-10-08)', () => {
  it('donne la durée fixe de chaque prière', () => {
    expect(DUREES).toEqual({
      chapelet: { minutes: 20, environ: false },
      rosaire: { minutes: 105, environ: true },
      lectures: { minutes: 20, environ: true },
      laudes: { minutes: 20, environ: true },
      tierce: { minutes: 10, environ: true },
      sexte: { minutes: 10, environ: true },
      none: { minutes: 10, environ: true },
      vepres: { minutes: 20, environ: true },
      complies: { minutes: 15, environ: true },
    })
  })

  it('s’écrit comme au PRD : « 20 min », « ~20 min », « ~1 h 45 »', () => {
    expect(ecrireDuree('chapelet')).toBe('20 min')
    expect(ecrireDuree('rosaire')).toBe('~1 h 45')
    expect(ecrireDuree('lectures')).toBe('~20 min')
    expect(ecrireDuree('laudes')).toBe('~20 min')
    expect(ecrireDuree('vepres')).toBe('~20 min')
    expect(ecrireDuree('tierce')).toBe('~10 min')
    expect(ecrireDuree('sexte')).toBe('~10 min')
    expect(ecrireDuree('none')).toBe('~10 min')
    expect(ecrireDuree('complies')).toBe('~15 min')
  })

  it('se dit en toutes lettres au lecteur d’écran', () => {
    expect(direDuree('chapelet')).toBe('vingt minutes')
    expect(direDuree('rosaire')).toBe('environ une heure quarante-cinq')
    expect(direDuree('laudes')).toBe('environ vingt minutes')
    expect(direDuree('tierce')).toBe('environ dix minutes')
    expect(direDuree('complies')).toBe('environ quinze minutes')
  })
})

describe('nombres en lettres', () => {
  it.each([
    [1, 'un'],
    [7, 'sept'],
    [11, 'onze'],
    [16, 'seize'],
    [17, 'dix-sept'],
    [21, 'vingt et un'],
    [30, 'trente'],
    [45, 'quarante-cinq'],
    [51, 'cinquante et un'],
    [59, 'cinquante-neuf'],
  ])('%i se dit « %s »', (n, mots) => {
    expect(nombreEnLettres(n)).toBe(mots)
  })
})

// Phase 18 : avec « L’essentiel seulement », le chapelet et le Rosaire se
// prient plus vite (décision du porteur du projet, 2026-10-09).
describe('durées avec l’essentiel seulement', () => {
  it('Chapelet ~15 min, Rosaire ~1 h 15', () => {
    expect(ecrireDuree('chapelet', true)).toBe('~15 min')
    expect(ecrireDuree('rosaire', true)).toBe('~1 h 15')
    expect(direDuree('chapelet', true)).toBe('environ quinze minutes')
    expect(direDuree('rosaire', true)).toBe('environ une heure quinze')
  })

  it('les offices ne changent pas', () => {
    expect(ecrireDuree('laudes', true)).toBe('~20 min')
    expect(direDuree('complies', true)).toBe('environ quinze minutes')
  })

  it('sans lui, les durées du PRD', () => {
    expect(ecrireDuree('chapelet', false)).toBe('20 min')
    expect(ecrireDuree('rosaire', false)).toBe('~1 h 45')
  })
})
