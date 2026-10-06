import { describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL } from './definition'
import { derouler } from './deroule'

const deroule = derouler(CHAPELET_MARIAL)
const prieres = deroule.pas.map((p) => p.priere)

const AVE = 'je-vous-salue-marie'
const dizaine = ['notre-pere', ...Array(10).fill(AVE), 'gloire-au-pere']

describe('déroulé du chapelet marial', () => {
  it('suit exactement le PRD : ouverture puis 5 dizaines', () => {
    expect(prieres).toEqual([
      'signe-de-croix',
      'credo',
      'notre-pere',
      AVE,
      AVE,
      AVE,
      'gloire-au-pere',
      ...dizaine,
      ...dizaine,
      ...dizaine,
      ...dizaine,
      ...dizaine,
    ])
  })

  it('numérote les dizaines de 1 à 5, et l’ouverture n’en a pas', () => {
    expect(deroule.pas.slice(0, 7).every((p) => p.dizaine === undefined)).toBe(true)
    for (let d = 1; d <= 5; d++) {
      const debut = 7 + (d - 1) * 12
      const pasDizaine = deroule.pas.slice(debut, debut + 12)
      expect(pasDizaine.every((p) => p.dizaine === d)).toBe(true)
    }
  })

  it('compte les répétitions : 1 à 3 à l’ouverture, 1 à 10 dans la dizaine', () => {
    expect(deroule.pas.slice(3, 6).map((p) => `${p.rang}/${p.total}`)).toEqual([
      '1/3',
      '2/3',
      '3/3',
    ])
    const aves = deroule.pas.filter((p) => p.dizaine === 2 && p.priere === AVE)
    expect(aves.map((p) => p.rang)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(aves.every((p) => p.total === 10)).toBe(true)
  })

  it('place chaque prière sur un grain, le signe de croix et le Credo sur la croix', () => {
    expect(deroule.grains[deroule.pas[0].grain]).toBe('croix')
    expect(deroule.pas[1].grain).toBe(deroule.pas[0].grain)
    expect(deroule.grains[deroule.pas[2].grain]).toBe('gros')
    expect(deroule.grains[deroule.pas[3].grain]).toBe('petit')
  })

  it('dessine 59 grains (53 petits, 6 gros), la croix, et 6 nœuds pour les Gloire au Père', () => {
    const compte = (type: string) => deroule.grains.filter((g) => g === type).length
    expect(compte('petit')).toBe(53)
    expect(compte('gros')).toBe(6)
    expect(compte('croix')).toBe(1)
    expect(compte('noeud')).toBe(6)
    expect(
      deroule.pas
        .filter((p) => p.priere === 'gloire-au-pere')
        .every((p) => deroule.grains[p.grain] === 'noeud'),
    ).toBe(true)
  })

  it('avance d’un grain à la fois, sans en sauter', () => {
    for (let i = 1; i < deroule.pas.length; i++) {
      const ecart = deroule.pas[i].grain - deroule.pas[i - 1].grain
      expect(ecart === 0 || ecart === 1).toBe(true)
    }
    expect(deroule.pas.at(-1)!.grain).toBe(deroule.grains.length - 1)
  })
})
