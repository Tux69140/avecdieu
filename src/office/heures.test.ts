import { describe, expect, it } from 'vitest'
import { ecrireHeure, heuresDesOffices } from './heures'

describe('heures des offices', () => {
  it('par défaut : les heures fixes du PRD, l’office des lectures sans heure', () => {
    expect(heuresDesOffices()).toEqual({
      lectures: undefined,
      laudes: { heures: 7, minutes: 0 },
      tierce: { heures: 9, minutes: 0 },
      sexte: { heures: 12, minutes: 0 },
      none: { heures: 15, minutes: 0 },
      vepres: { heures: 18, minutes: 30 },
      complies: { heures: 21, minutes: 30 },
    })
  })

  it('s’écrivent à la française', () => {
    expect(ecrireHeure({ heures: 7, minutes: 0 })).toBe('7 h')
    expect(ecrireHeure({ heures: 18, minutes: 30 })).toBe('18 h 30')
    expect(ecrireHeure({ heures: 21, minutes: 5 })).toBe('21 h 05')
  })
})
