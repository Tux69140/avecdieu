import { describe, expect, it } from 'vitest'
import {
  estOfficeSolaire,
  HEURES_SOLAIRES_PAR_DEFAUT,
  heuresSolaires,
  type ReglagesSolaires,
} from './heuresSolaires'
import { leverEtCoucher } from './soleil'

const LYON = { latitude: 45.76, longitude: 4.84 }
const SANS_LIMITE: ReglagesSolaires = {
  ...HEURES_SOLAIRES_PAR_DEFAUT,
  pasAvant: { ...HEURES_SOLAIRES_PAR_DEFAUT.pasAvant, active: false },
  pasApres: { ...HEURES_SOLAIRES_PAR_DEFAUT.pasApres, active: false },
}

const minutes = ({ heures, minutes }: { heures: number; minutes: number }) => heures * 60 + minutes
const minutesDe = (date: Date) => date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60

describe('heures solaires', () => {
  const octobre = new Date(2026, 9, 7)
  const { lever, coucher } = leverEtCoucher(octobre, LYON)
  const debut = minutesDe(lever)
  const duree = minutesDe(coucher) - debut

  it('laudes au lever, vêpres au coucher', () => {
    const heures = heuresSolaires(octobre, LYON, SANS_LIMITE)!
    expect(Math.abs(minutes(heures.laudes) - debut)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(minutes(heures.vepres) - (debut + duree))).toBeLessThanOrEqual(0.5)
  })

  it('tierce, sexte et none au quart, à la moitié et aux trois quarts du jour', () => {
    const heures = heuresSolaires(octobre, LYON, SANS_LIMITE)!
    expect(Math.abs(minutes(heures.tierce) - (debut + duree / 4))).toBeLessThanOrEqual(0.5)
    expect(Math.abs(minutes(heures.sexte) - (debut + duree / 2))).toBeLessThanOrEqual(0.5)
    expect(Math.abs(minutes(heures.none) - (debut + (3 * duree) / 4))).toBeLessThanOrEqual(0.5)
  })

  it('ajoute le décalage de chaque office', () => {
    const sans = heuresSolaires(octobre, LYON, SANS_LIMITE)!
    const avec = heuresSolaires(octobre, LYON, {
      ...SANS_LIMITE,
      decalages: { laudes: 30, tierce: -15, sexte: 0, none: 60, vepres: -60 },
    })!
    expect(minutes(avec.laudes) - minutes(sans.laudes)).toBe(30)
    expect(minutes(avec.tierce) - minutes(sans.tierce)).toBe(-15)
    expect(minutes(avec.sexte)).toBe(minutes(sans.sexte))
    expect(minutes(avec.none) - minutes(sans.none)).toBe(60)
    expect(minutes(avec.vepres) - minutes(sans.vepres)).toBe(-60)
  })

  it('d’origine, laudes pas avant 7 h et vêpres pas après 19 h 30', () => {
    // Fin juin à Lyon : lever vers 5 h 55, coucher vers 21 h 30.
    const juin = heuresSolaires(new Date(2026, 5, 25), LYON, HEURES_SOLAIRES_PAR_DEFAUT)!
    expect(juin.laudes).toEqual({ heures: 7, minutes: 0 })
    expect(juin.vepres).toEqual({ heures: 19, minutes: 30 })
    // Fin décembre : lever vers 8 h 20, coucher vers 17 h ; les limites n'agissent pas.
    const decembre = heuresSolaires(new Date(2026, 11, 25), LYON, HEURES_SOLAIRES_PAR_DEFAUT)!
    expect(minutes(decembre.laudes)).toBeGreaterThan(8 * 60)
    expect(minutes(decembre.vepres)).toBeLessThan(17 * 60 + 30)
  })

  it('applique la limite après le décalage', () => {
    const heures = heuresSolaires(new Date(2026, 11, 25), LYON, {
      ...HEURES_SOLAIRES_PAR_DEFAUT,
      decalages: { ...HEURES_SOLAIRES_PAR_DEFAUT.decalages, laudes: -60 },
      pasAvant: { active: true, heure: { heures: 7, minutes: 45 } },
    })!
    expect(heures.laudes).toEqual({ heures: 7, minutes: 45 })
  })

  it('suit l’heure d’été : le midi solaire de Lyon passe de 12 h 50 à 13 h 45 environ', () => {
    const hiver = heuresSolaires(new Date(2026, 0, 15), LYON, SANS_LIMITE)!
    const ete = heuresSolaires(new Date(2026, 6, 15), LYON, SANS_LIMITE)!
    expect(minutes(hiver.sexte)).toBeGreaterThan(12 * 60 + 20)
    expect(minutes(hiver.sexte)).toBeLessThan(13 * 60)
    expect(minutes(ete.sexte)).toBeGreaterThan(13 * 60 + 20)
    expect(minutes(ete.sexte)).toBeLessThan(14 * 60)
  })

  it('renonce là où le soleil ne se lève pas (nuit polaire)', () => {
    expect(
      heuresSolaires(new Date(2026, 11, 21), { latitude: 78, longitude: 15 }, SANS_LIMITE),
    ).toBeUndefined()
  })
})

describe('estOfficeSolaire', () => {
  it('laudes, tierce, sexte, none et vêpres suivent le soleil ; les autres prières non', () => {
    for (const office of ['laudes', 'tierce', 'sexte', 'none', 'vepres'])
      expect(estOfficeSolaire(office)).toBe(true)
    for (const autre of ['lectures', 'complies', 'chapelet', 'toString'])
      expect(estOfficeSolaire(autre)).toBe(false)
  })
})
