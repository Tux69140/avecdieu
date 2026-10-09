import { beforeEach, describe, expect, it } from 'vitest'
import { HEURES_SOLAIRES_PAR_DEFAUT } from '../office/heuresSolaires'
import { RAPPELS_CHANGES } from './reglages'
import { decaler, lireSolaire, modifierSolaire } from './solaire'

beforeEach(() => localStorage.clear())

describe('réglages des heures solaires', () => {
  it('d’origine : heures fixes, décalages nuls, laudes pas avant 7 h, vêpres pas après 19 h 30', () => {
    expect(lireSolaire()).toEqual(HEURES_SOLAIRES_PAR_DEFAUT)
    expect(lireSolaire().actives).toBe(false)
  })

  it('retient le choix et le signale à la page', () => {
    let signale = false
    window.addEventListener(RAPPELS_CHANGES, () => (signale = true), { once: true })
    modifierSolaire({ actives: true })
    expect(signale).toBe(true)
    expect(lireSolaire().actives).toBe(true)
  })

  it('borne le décalage à une heure de part et d’autre', () => {
    const { decalages } = HEURES_SOLAIRES_PAR_DEFAUT
    expect(decaler(decalages, 'laudes', 65).laudes).toBe(60)
    expect(decaler(decalages, 'vepres', -70).vepres).toBe(-60)
    expect(decaler(decaler(decalages, 'laudes', 65), 'tierce', 15)).toEqual({
      laudes: 60,
      tierce: 15,
      sexte: 0,
      none: 0,
      vepres: 0,
    })
  })

  it('ignore les valeurs illisibles', () => {
    localStorage.setItem(
      'avec-dieu.heures-solaires',
      JSON.stringify({
        actives: 'oui',
        decalages: { laudes: 7, tierce: 'x', sexte: 90 },
        pasAvant: { active: false, heure: { heures: 25, minutes: 0 } },
      }),
    )
    expect(lireSolaire()).toEqual({
      ...HEURES_SOLAIRES_PAR_DEFAUT,
      pasAvant: { active: false, heure: { heures: 7, minutes: 0 } },
    })
  })
})
