import { describe, expect, it } from 'vitest'
import { priereMarialeDu } from './angelus'

// Du dimanche de Pâques au dimanche de la Pentecôte inclus, le Regina Caeli
// remplace l'Angélus (2026-10-20).
describe('priereMarialeDu', () => {
  it('Regina Caeli de Pâques à la Pentecôte, bornes comprises', () => {
    // 2026 : Pâques le 5 avril, Pentecôte le 24 mai.
    expect(priereMarialeDu('2026-04-04')).toBe('angelus')
    expect(priereMarialeDu('2026-04-05')).toBe('regina-caeli')
    expect(priereMarialeDu('2026-05-01')).toBe('regina-caeli')
    expect(priereMarialeDu('2026-05-24')).toBe('regina-caeli')
    expect(priereMarialeDu('2026-05-25')).toBe('angelus')
  })

  it('suit la date de Pâques d’une année à l’autre', () => {
    // 2027 : Pâques le 28 mars, Pentecôte le 16 mai.
    expect(priereMarialeDu('2027-03-27')).toBe('angelus')
    expect(priereMarialeDu('2027-03-28')).toBe('regina-caeli')
    expect(priereMarialeDu('2027-05-16')).toBe('regina-caeli')
    expect(priereMarialeDu('2027-05-17')).toBe('angelus')
    // 2038 : Pâques le 25 avril, Pentecôte le 13 juin.
    expect(priereMarialeDu('2038-06-13')).toBe('regina-caeli')
    expect(priereMarialeDu('2038-06-14')).toBe('angelus')
  })

  it('l’Angélus le reste de l’année', () => {
    for (const date of ['2026-01-01', '2026-03-25', '2026-08-15', '2026-12-25'])
      expect(priereMarialeDu(date)).toBe('angelus')
  })
})
