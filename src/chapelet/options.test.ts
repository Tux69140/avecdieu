import { describe, expect, it } from 'vitest'
import { REGLAGES_PAR_DEFAUT } from '../reglages/reglages'
import { optionsDuDeroule } from './options'

const LUNDI_5_OCTOBRE = new Date(2026, 9, 5, 20, 0)

describe('options du déroulé selon les réglages', () => {
  it('l’annonce n’a d’écran à part qu’en texte complet', () => {
    expect(optionsDuDeroule(REGLAGES_PAR_DEFAUT, LUNDI_5_OCTOBRE)).toEqual({
      annonce: true,
      oMonJesus: true,
      intentions: true,
      saintPere: true,
      salveRegina: true,
      litanies: true,
      oraisonRosaire: true,
      sousLAbri: false,
      saintJoseph: true,
      essentiel: false,
    })
    const options = (r: Partial<typeof REGLAGES_PAR_DEFAUT>) =>
      optionsDuDeroule({ ...REGLAGES_PAR_DEFAUT, ...r }, LUNDI_5_OCTOBRE)
    expect(options({ affichage: 'compact' }).annonce).toBe(false)
    expect(options({ annonce: false }).annonce).toBe(false)
  })

  it('le « Ô mon Jésus », les intentions et les textes de la clôture suivent leurs réglages', () => {
    expect(
      optionsDuDeroule(
        {
          ...REGLAGES_PAR_DEFAUT,
          oMonJesus: false,
          intentions: false,
          salveRegina: false,
          oraisonRosaire: false,
          sousLAbri: true,
        },
        LUNDI_5_OCTOBRE,
      ),
    ).toMatchObject({
      oMonJesus: false,
      intentions: false,
      salveRegina: false,
      oraisonRosaire: false,
      sousLAbri: true,
    })
  })

  // Critère de succès 10 : avec les réglages de départ, Litanies et saint
  // Joseph du 1er au 31 octobre, absents le reste de l'année.
  const JOURS: [string, Date, boolean][] = [
    ['30 septembre', new Date(2026, 8, 30, 23, 59), false],
    ['1er octobre', new Date(2026, 9, 1, 0, 0), true],
    ['31 octobre', new Date(2026, 9, 31, 23, 59), true],
    ['1er novembre', new Date(2026, 10, 1, 0, 0), false],
    ['15 mars', new Date(2027, 2, 15, 12, 0), false],
  ]
  for (const [nom, date, dits] of JOURS) {
    it(`« En octobre », le ${nom} : ${dits ? 'dits' : 'absents'}`, () => {
      expect(optionsDuDeroule(REGLAGES_PAR_DEFAUT, date)).toMatchObject({
        litanies: dits,
        saintJoseph: dits,
      })
    })
    it(`« Toujours » et « Jamais » l’emportent sur le mois, le ${nom}`, () => {
      const reglages = {
        ...REGLAGES_PAR_DEFAUT,
        litanies: 'toujours',
        saintJoseph: 'jamais',
      } as const
      expect(optionsDuDeroule(reglages, date)).toMatchObject({ litanies: true, saintJoseph: false })
      const inverses = {
        ...REGLAGES_PAR_DEFAUT,
        litanies: 'jamais',
        saintJoseph: 'toujours',
      } as const
      expect(optionsDuDeroule(inverses, date)).toMatchObject({ litanies: false, saintJoseph: true })
    })
  }
})

// Phase 18 : « L’essentiel seulement » l'emporte sur les réglages fins.
describe('options du chapelet simplifié (phase 18)', () => {
  it('les options du déroulé portent l’essentiel et la prière aux intentions du Saint-Père', () => {
    const options = (r: Partial<typeof REGLAGES_PAR_DEFAUT>) =>
      optionsDuDeroule({ ...REGLAGES_PAR_DEFAUT, ...r }, LUNDI_5_OCTOBRE)
    expect(options({ saintPere: false }).saintPere).toBe(false)
    expect(options({ essentiel: true })).toMatchObject({ essentiel: true, annonce: true })
  })
})
