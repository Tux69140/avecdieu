import { describe, expect, it } from 'vitest'
import { HEURES_PAR_DEFAUT } from '../office/heures'
import { situerOffices } from './moment'

const a = (heures: number, minutes = 0) => heures * 60 + minutes
const situer = (maintenant: number) => situerOffices(HEURES_PAR_DEFAUT, maintenant)

describe('situerOffices', () => {
  it.each([
    [a(0, 30), 'laudes'],
    [a(6, 0), 'laudes'],
    [a(7, 30), 'laudes'],
    [a(7, 59), 'laudes'],
    [a(8, 10), 'tierce'],
    [a(12, 0), 'sexte'],
    [a(17, 50), 'vepres'],
    [a(18, 40), 'vepres'],
    [a(19, 45), 'complies'],
    [a(21, 30), 'complies'],
    [a(23, 50), 'complies'],
  ])('à %i min, la prière du moment est %s', (maintenant, office) => {
    expect(situer(maintenant).moment).toBe(office)
  })

  it('un office reste du moment une heure après son heure, puis devient passé', () => {
    expect(situer(a(7, 59)).etats.laudes).toBe('moment')
    expect(situer(a(8, 0)).etats.laudes).toBe('passe')
    expect(situer(a(8, 0)).etats.tierce).toBe('moment')
  })

  it('donne l’état de chaque office à 18 h 40', () => {
    expect(situer(a(18, 40)).etats).toEqual({
      lectures: 'libre',
      laudes: 'passe',
      tierce: 'passe',
      sexte: 'passe',
      none: 'passe',
      vepres: 'moment',
      complies: 'a-venir',
    })
  })

  it('de minuit aux laudes, tout est à venir', () => {
    const { etats } = situer(a(0, 30))
    expect(etats.complies).toBe('a-venir')
    expect(etats.laudes).toBe('moment')
  })

  it('l’office des lectures, sans heure, n’est jamais du moment', () => {
    for (let m = 0; m < a(24); m += 15) expect(situer(m).etats.lectures).toBe('libre')
  })

  it('prend l’office le plus récent quand deux heures se suivent de près', () => {
    const heures = { ...HEURES_PAR_DEFAUT, tierce: { heures: 7, minutes: 30 } }
    expect(situerOffices(heures, a(7, 40)).moment).toBe('tierce')
    expect(situerOffices(heures, a(7, 40)).etats.laudes).toBe('passe')
  })
})
