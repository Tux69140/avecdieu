import { describe, expect, it } from 'vitest'
import { ecrireHeure, heuresDesOffices, heuresDuJour } from './heures'
import { choisirLieu } from '../lieu/lieu'
import { modifierSolaire } from '../rappels/solaire'
import { modifierRappel } from '../rappels/reglages'

describe('heures des offices', () => {
  it('par défaut : les heures fixes du PRD, l’office des lectures sans heure', () => {
    expect(heuresDesOffices('2026-10-07')).toEqual({
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

describe('heures réglées avec les rappels', () => {
  it('une heure changée est celle de l’office partout, même rappel coupé', () => {
    localStorage.clear()
    modifierRappel('laudes', { heure: { heures: 6, minutes: 30 } })
    modifierRappel('lectures', { heure: { heures: 5, minutes: 45 } })
    expect(heuresDesOffices('2026-10-07')).toMatchObject({
      lectures: { heures: 5, minutes: 45 },
      laudes: { heures: 6, minutes: 30 },
      vepres: { heures: 18, minutes: 30 },
    })
    localStorage.clear()
  })
})

describe('heures solaires', () => {
  const LYON = { nom: 'Lyon', pres: false, latitude: 45.76, longitude: 4.84 }

  it('en mode solaire, laudes à vêpres suivent le soleil ; complies, lectures et chapelet restent fixes', () => {
    localStorage.clear()
    choisirLieu(LYON)
    modifierSolaire({ actives: true })
    const heures = heuresDuJour('2026-12-25')
    // À Lyon le 25 décembre : lever vers 8 h 20, coucher vers 17 h.
    expect(heures.laudes!.heures).toBe(8)
    expect(heures.vepres!.heures).toBe(17)
    expect(heures.complies).toEqual({ heures: 21, minutes: 30 })
    expect(heures.chapelet).toEqual({ heures: 20, minutes: 0 })
    expect(heures.lectures).toBeUndefined()
    // Les heures changent d'un jour à l'autre.
    expect(heuresDuJour('2026-06-25').vepres).toEqual({ heures: 19, minutes: 30 })
    localStorage.clear()
  })

  it('sans lieu connu, les heures restent fixes', () => {
    localStorage.clear()
    modifierSolaire({ actives: true })
    expect(heuresDuJour('2026-12-25').laudes).toEqual({ heures: 7, minutes: 0 })
    localStorage.clear()
  })

  it('repasser aux heures fixes retrouve les heures d’avant', () => {
    localStorage.clear()
    choisirLieu(LYON)
    modifierRappel('laudes', { heure: { heures: 6, minutes: 45 } })
    modifierSolaire({ actives: true })
    modifierSolaire({ actives: false })
    expect(heuresDuJour('2026-12-25').laudes).toEqual({ heures: 6, minutes: 45 })
    localStorage.clear()
  })
})
