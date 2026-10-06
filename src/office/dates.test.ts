import { describe, expect, it } from 'vitest'
import { dateDuJour, dateLisible, estDate, paques, sansAlleluia } from './dates'

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

describe('Pâques et l’Alléluia (R2)', () => {
  it('trouve le dimanche de Pâques', () => {
    expect(paques(2026)).toBe('2026-04-05')
    expect(paques(2027)).toBe('2027-03-28')
    expect(paques(2028)).toBe('2028-04-16')
    expect(paques(2038)).toBe('2038-04-25')
  })

  it('tait l’Alléluia du mercredi des Cendres au Samedi saint, solennités comprises', () => {
    expect(sansAlleluia('2027-02-09')).toBe(false)
    expect(sansAlleluia('2027-02-10')).toBe(true)
    expect(sansAlleluia('2027-03-19')).toBe(true)
    expect(sansAlleluia('2027-03-27')).toBe(true)
    expect(sansAlleluia('2027-03-28')).toBe(false)
    expect(sansAlleluia('2026-10-06')).toBe(false)
  })
})
