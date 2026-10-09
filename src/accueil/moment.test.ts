import { describe, expect, it } from 'vitest'
import type { Heure } from '../office/heure'
import { OFFICES, type NomOffice } from '../office/modele'
import { RAPPELS_PAR_DEFAUT } from '../rappels/reglages'
import { situerOffices } from './moment'

const a = (heures: number, minutes = 0) => heures * 60 + minutes
// Les heures fixes par défaut des offices (PRD, « Rappels ») ; l'office des
// lectures n'en a pas.
const HEURES_PAR_DEFAUT = Object.fromEntries(
  OFFICES.map((nom) => [nom, RAPPELS_PAR_DEFAUT[nom].heure]),
) as Record<NomOffice, Heure | undefined>
// Les heures fixes par défaut, et le chapelet à 20 h comme son rappel par défaut.
const HEURES = { ...HEURES_PAR_DEFAUT, chapelet: { heures: 20, minutes: 0 } }
const situer = (maintenant: number) => situerOffices(HEURES, maintenant)

describe('situerOffices', () => {
  // Du moment de 30 min avant son heure à une heure après (choix du porteur du
  // projet, 2026-10-06 et 2026-10-08) ; hors de ces créneaux, aucune.
  it.each([
    [a(0, 30), undefined],
    [a(6, 29), undefined],
    [a(6, 30), 'laudes'],
    [a(7, 30), 'laudes'],
    [a(7, 59), 'laudes'],
    [a(8, 0), undefined],
    [a(8, 30), 'tierce'],
    [a(11, 30), 'sexte'],
    [a(12, 0), 'sexte'],
    [a(17, 50), undefined],
    [a(18, 0), 'vepres'],
    [a(18, 40), 'vepres'],
    [a(19, 29), 'vepres'],
    // Le chapelet de 20 h est une prière du moment comme un office.
    [a(19, 45), 'chapelet'],
    [a(20, 0), 'chapelet'],
    [a(20, 59), 'chapelet'],
    [a(21, 0), 'complies'],
    [a(21, 30), 'complies'],
    [a(22, 29), 'complies'],
    [a(22, 30), undefined],
    [a(23, 50), undefined],
  ])('à %i min, la prière du moment est %s', (maintenant, office) => {
    expect(situer(maintenant).moment).toBe(office)
  })

  it('un office reste du moment une heure après son heure, puis devient passé', () => {
    expect(situer(a(7, 59)).etats.laudes).toBe('moment')
    expect(situer(a(8, 0)).etats.laudes).toBe('passe')
    expect(situer(a(8, 0)).etats.tierce).toBe('a-venir')
  })

  it('quand deux créneaux se chevauchent, l’office le plus proche de son heure', () => {
    // Vêpres à 18 h 30, chapelet à 19 h : à 18 h 40, les vêpres (10 min contre
    // 20) ; à 18 h 50, le chapelet (10 min contre 20).
    const heures = { ...HEURES, chapelet: { heures: 19, minutes: 0 } }
    expect(situerOffices(heures, a(18, 40)).moment).toBe('vepres')
    expect(situerOffices(heures, a(18, 50)).moment).toBe('chapelet')
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

  it('de minuit aux laudes, tout est à venir, sans prière du moment', () => {
    const { etats, moment } = situer(a(0, 30))
    expect(etats.complies).toBe('a-venir')
    expect(etats.laudes).toBe('a-venir')
    expect(moment).toBeUndefined()
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
    expect(situerOffices(HEURES_PAR_DEFAUT, a(20, 30)).moment).toBeUndefined()
    expect(situerOffices(HEURES_PAR_DEFAUT, a(20, 30)).etats.chapelet).toBe('libre')
  })

  it('sans aucun texte des offices, aucune prière du moment', () => {
    const journee = situerOffices(HEURES, a(12, 15), [])
    expect(journee.moment).toBeUndefined()
    expect(journee.etats.sexte).toBe('passe')
    expect(journee.etats.none).toBe('a-venir')
  })
})
