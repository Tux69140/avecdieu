import { beforeEach, describe, expect, it } from 'vitest'
import { CENTRE_FRANCE } from '../office/soleil'
import {
  choisirLieu,
  deplacementNotable,
  distanceEnKm,
  lieuDuSoleil,
  lireLieu,
  nommerLieu,
  LIEU_CHANGE,
  changerActualisation,
} from './lieu'

const LYON = { latitude: 45.76, longitude: 4.84 }
const VILLEURBANNE = { latitude: 45.77, longitude: 4.88 }
const MARSEILLE = { latitude: 43.3, longitude: 5.37 }

beforeEach(() => localStorage.clear())

describe('lieu des heures solaires', () => {
  it('aucun lieu d’origine, sans actualisation ; le soleil se calcule au centre de la France', () => {
    expect(lireLieu()).toEqual({ actualiser: false })
    expect(lieuDuSoleil()).toEqual(CENTRE_FRANCE)
  })

  it('retient le lieu choisi et le signale à la page', () => {
    let signale = false
    window.addEventListener(LIEU_CHANGE, () => (signale = true), { once: true })
    choisirLieu({ nom: 'Lyon', pres: false, ...LYON })
    expect(signale).toBe(true)
    expect(lireLieu().lieu).toEqual({ nom: 'Lyon', pres: false, ...LYON })
    expect(lieuDuSoleil()).toEqual(LYON)
  })

  it('arrondit la position enregistrée à 0,01° près, environ un kilomètre', () => {
    choisirLieu({ nom: 'Lyon', pres: true, latitude: 45.818436, longitude: -4.885494 })
    expect(localStorage.getItem('avec-dieu.lieu')).not.toContain('818436')
    expect(lireLieu().lieu).toMatchObject({ latitude: 45.82, longitude: -4.89 })
  })

  it('retient l’actualisation à l’ouverture', () => {
    changerActualisation(true)
    expect(lireLieu().actualiser).toBe(true)
  })

  it('ignore un lieu enregistré illisible', () => {
    localStorage.setItem('avec-dieu.lieu', JSON.stringify({ lieu: { nom: 'Lyon', latitude: 'x' } }))
    expect(lireLieu().lieu).toBeUndefined()
  })

  it('nomme « Près de » le lieu trouvé par le GPS', () => {
    expect(nommerLieu({ nom: 'Lyon', pres: false, ...LYON })).toBe('Lyon')
    expect(nommerLieu({ nom: 'Lyon', pres: true, ...LYON })).toBe('Près de Lyon')
  })
})

describe('déplacements', () => {
  it('mesure la distance sur la Terre', () => {
    expect(distanceEnKm(LYON, MARSEILLE)).toBeGreaterThan(270)
    expect(distanceEnKm(LYON, MARSEILLE)).toBeLessThan(285)
  })

  it('ne recalcule qu’au-delà de 50 km', () => {
    expect(deplacementNotable(LYON, VILLEURBANNE)).toBe(false)
    expect(deplacementNotable(LYON, MARSEILLE)).toBe(true)
    expect(deplacementNotable(LYON, { latitude: 45.76, longitude: 5.45 })).toBe(false) // 47 km
    expect(deplacementNotable(LYON, { latitude: 45.76, longitude: 5.5 })).toBe(true) // 51 km
  })
})
