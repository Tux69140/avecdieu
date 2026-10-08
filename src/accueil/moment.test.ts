import { describe, expect, it } from 'vitest'
import { HEURES_PAR_DEFAUT } from '../office/heures'
import { situerOffices } from './moment'

const a = (heures: number, minutes = 0) => heures * 60 + minutes
// Les heures fixes par défaut, et le chapelet à 20 h comme son rappel par défaut.
const HEURES = { ...HEURES_PAR_DEFAUT, chapelet: { heures: 20, minutes: 0 } }
const situer = (maintenant: number) => situerOffices(HEURES, maintenant)

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
    // Le chapelet de 20 h est une prière du moment comme un office.
    [a(19, 45), 'chapelet'],
    [a(20, 0), 'chapelet'],
    [a(20, 59), 'chapelet'],
    [a(21, 0), 'complies'],
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
      chapelet: 'a-venir',
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
    const heures = { ...HEURES, tierce: { heures: 7, minutes: 30 } }
    expect(situerOffices(heures, a(7, 40)).moment).toBe('tierce')
    expect(situerOffices(heures, a(7, 40)).etats.laudes).toBe('passe')
  })

  it('le chapelet reste du moment une heure après son heure, puis devient passé', () => {
    expect(situer(a(20, 30)).etats.chapelet).toBe('moment')
    expect(situer(a(20, 30)).etats.complies).toBe('a-venir')
    expect(situer(a(21, 0)).etats.chapelet).toBe('passe')
    expect(situer(a(21, 0)).etats.complies).toBe('moment')
  })

  it('sans heure de chapelet, les offices seuls', () => {
    expect(situerOffices(HEURES_PAR_DEFAUT, a(20, 30)).moment).toBe('complies')
    expect(situerOffices(HEURES_PAR_DEFAUT, a(20, 30)).etats.chapelet).toBe('libre')
  })

  it('sans aucun texte des offices, aucune prière du moment', () => {
    const journee = situerOffices(HEURES, a(12, 15), [])
    expect(journee.moment).toBeUndefined()
    expect(journee.etats.sexte).toBe('passe')
    expect(journee.etats.none).toBe('a-venir')
  })
})
