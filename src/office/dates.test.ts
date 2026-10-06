import { describe, expect, it } from 'vitest'
import {
  dateCourte,
  dateDuJour,
  dateLisible,
  decaler,
  enDate,
  estDate,
  paques,
  sansAlleluia,
} from './dates'

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

  it('écrit la date en bref, pour aller d’un jour à l’autre', () => {
    expect(dateCourte('2026-10-04')).toBe('dim. 4')
    expect(dateCourte('2026-11-01')).toBe('dim. 1er')
  })

  it('passe au jour d’avant ou d’après, même d’un mois ou d’une année à l’autre', () => {
    expect(decaler('2026-10-31', 1)).toBe('2026-11-01')
    expect(decaler('2027-01-01', -1)).toBe('2026-12-31')
    expect(decaler('2027-03-28', 1)).toBe('2027-03-29')
  })

  it('donne le jour civil à minuit, heure du téléphone', () => {
    expect(enDate('2026-10-06')).toEqual(new Date(2026, 9, 6))
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
