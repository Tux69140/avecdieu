import { describe, expect, it } from 'vitest'
import { dateDuJour, dateLisible, estDate } from './dates'

describe('dates des offices', () => {
  it('donne la date du jour à l’heure du téléphone, même tard le soir', () => {
    expect(dateDuJour(new Date(2026, 9, 6, 23, 59))).toBe('2026-10-06')
    expect(dateDuJour(new Date(2026, 0, 1, 0, 1))).toBe('2026-01-01')
  })

  it('reconnaît une date de route valide', () => {
    expect(estDate('2026-10-06')).toBe(true)
    expect(estDate('2026-02-30')).toBe(false)
    expect(estDate('06-10-2026')).toBe(false)
    expect(estDate(undefined)).toBe(false)
  })

  it('écrit la date en toutes lettres', () => {
    expect(dateLisible('2026-10-06')).toBe('mardi 6 octobre')
    expect(dateLisible('2026-11-01')).toBe('dimanche 1er novembre')
  })
})
