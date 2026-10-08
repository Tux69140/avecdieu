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
