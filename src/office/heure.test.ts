import { describe, expect, it } from 'vitest'
import { arrondirALaMinute, ecrireHeure, enMinutes, lireHeure, minutesDe, versHeure } from './heure'

describe('heures et minutes', () => {
  it('passent des unes aux autres', () => {
    expect(enMinutes({ heures: 18, minutes: 30 })).toBe(1110)
    expect(versHeure(1110)).toEqual({ heures: 18, minutes: 30 })
    expect(versHeure(0)).toEqual({ heures: 0, minutes: 0 })
    expect(versHeure(enMinutes({ heures: 23, minutes: 59 }))).toEqual({ heures: 23, minutes: 59 })
  })

  it('lisent l’heure du téléphone, à la minute près', () => {
    expect(minutesDe(new Date(2026, 9, 9, 7, 52, 59))).toBe(472)
    expect(arrondirALaMinute(new Date(2026, 9, 9, 7, 52, 30))).toEqual(new Date(2026, 9, 9, 7, 53))
    expect(arrondirALaMinute(new Date(2026, 9, 9, 7, 52, 29))).toEqual(new Date(2026, 9, 9, 7, 52))
  })

  it('s’écrivent à la française', () => {
    expect(ecrireHeure({ heures: 7, minutes: 0 })).toBe('7 h')
    expect(ecrireHeure({ heures: 18, minutes: 30 })).toBe('18 h 30')
    expect(ecrireHeure({ heures: 21, minutes: 5 })).toBe('21 h 05')
  })
})

describe('lireHeure', () => {
  it('reprend une heure valide', () => {
    expect(lireHeure({ heures: 6, minutes: 30 })).toEqual({ heures: 6, minutes: 30 })
    expect(lireHeure({ heures: 0, minutes: 0, autre: 1 })).toEqual({ heures: 0, minutes: 0 })
  })

  it('ignore ce qui n’en est pas une', () => {
    for (const valeur of [
      undefined,
      null,
      '07:00',
      [7, 0],
      { heures: 24, minutes: 0 },
      { heures: 7, minutes: 60 },
      { heures: -1, minutes: 0 },
      { heures: 7.5, minutes: 0 },
      { heures: '7', minutes: 0 },
      { heures: 7 },
    ])
      expect(lireHeure(valeur)).toBeUndefined()
  })
})
