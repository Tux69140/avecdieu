import { describe, expect, it } from 'vitest'
import { REGLAGES_PAR_DEFAUT } from '../reglages/reglages'
import { CHAPELET_MARIAL, ROSAIRE } from './definition'
import { derouler, serieAtteinte } from './deroule'
import { optionsDuDeroule } from './options'

// Phase 17, critère de succès 9 : l'ouverture une fois, les vingt dizaines
// de la série joyeuse à la glorieuse, trois passages de série, la clôture une
// fois.

const AVE = 'je-vous-salue-marie'
const OUVERTURE = ['signe-de-croix', 'credo', 'notre-pere', AVE, AVE, AVE, 'gloire-au-pere']
const DIZAINE = ['annonce', 'notre-pere', ...Array(10).fill(AVE), 'gloire-au-pere', 'o-mon-jesus']
const SAINT_PERE = ['notre-pere', AVE, 'gloire-au-pere']
const CLOTURE = ['salve-regina', 'litanies', 'oraison-rosaire', 'sous-l-abri', 'saint-joseph']
const ORDRE = ['joyeux', 'lumineux', 'douloureux', 'glorieux']

const rosaire = derouler(ROSAIRE)
const chapelet = derouler(CHAPELET_MARIAL)

describe('déroulé du Rosaire', () => {
  it('une ouverture, vingt dizaines, une clôture', () => {
    expect(rosaire.pas.map((p) => p.priere)).toEqual([
      ...OUVERTURE,
      ...Array.from({ length: 20 }, () => DIZAINE).flat(),
      ...SAINT_PERE,
      ...CLOTURE,
    ])
  })

  it('les quatre séries dans l’ordre, cinq dizaines numérotées de 1 à 5 chacune', () => {
    const dizaines = rosaire.pas.filter((p) => p.priere === 'annonce')
    expect(dizaines.map((p) => `${p.serie} ${p.dizaine}`)).toEqual(
      ORDRE.flatMap((serie) => [1, 2, 3, 4, 5].map((d) => `${serie} ${d}`)),
    )
    // L'ouverture et la clôture n'appartiennent à aucune série.
    const horsDizaine = rosaire.pas.filter((p) => p.dizaine === undefined)
    expect(horsDizaine).toHaveLength(OUVERTURE.length + SAINT_PERE.length + CLOTURE.length)
    expect(horsDizaine.every((p) => p.serie === undefined)).toBe(true)
  })

  it('trois passages de série, sur le premier pas des séries 2, 3 et 4', () => {
    const passages = rosaire.pas.filter((p) => p.nouvelleSerie)
    expect(passages.map((p) => [p.serie, p.dizaine, p.priere])).toEqual([
      ['lumineux', 1, 'annonce'],
      ['douloureux', 1, 'annonce'],
      ['glorieux', 1, 'annonce'],
    ])
  })

  it('sans annonce, le passage de série tombe sur le Notre Père de la dizaine', () => {
    const sansAnnonce = derouler(ROSAIRE, { annonce: false })
    const passages = sansAnnonce.pas.filter((p) => p.nouvelleSerie)
    expect(passages.map((p) => [p.serie, p.dizaine, p.priere])).toEqual([
      ['lumineux', 1, 'notre-pere'],
      ['douloureux', 1, 'notre-pere'],
      ['glorieux', 1, 'notre-pere'],
    ])
  })

  it('le chapelet n’a ni série dans ses pas ni passage de série', () => {
    expect(chapelet.pas.some((p) => p.serie !== undefined || p.nouvelleSerie)).toBe(false)
  })

  it('une seule boucle, parcourue quatre fois : les grains sont ceux du chapelet', () => {
    expect(rosaire.grains).toEqual(chapelet.grains)
    const grainsDe = (serie: string) =>
      rosaire.pas.filter((p) => p.serie === serie).map((p) => p.grain)
    const premiere = grainsDe('joyeux')
    for (const serie of ORDRE) expect(grainsDe(serie)).toEqual(premiere)
    // La croix au début, la médaille à la fin pour la clôture.
    expect(rosaire.grains[rosaire.pas[0].grain]).toBe('croix')
    expect(rosaire.grains[rosaire.pas.at(-1)!.grain]).toBe('medaille')
  })

  it('options : l’annonce et le « Ô mon Jésus » se retirent de chaque dizaine', () => {
    const sans = derouler(ROSAIRE, { annonce: false, oMonJesus: false })
    expect(sans.pas.filter((p) => p.priere === 'annonce')).toEqual([])
    expect(sans.pas.filter((p) => p.priere === 'o-mon-jesus')).toEqual([])
    expect(sans.pas.filter((p) => p.priere === 'notre-pere')).toHaveLength(22)
    expect(sans.pas.filter((p) => p.priere === AVE)).toHaveLength(3 + 200 + 1)
  })

  it('les intentions à l’ouverture et aux intentions du Saint-Père, le verset une seule fois dans la clôture', () => {
    expect(rosaire.pas.filter((p) => p.intention).map((p) => p.intention)).toEqual([
      'Pour la foi.',
      'Pour l’espérance.',
      'Pour la charité.',
      'Aux intentions du Saint-Père.',
    ])
    expect(rosaire.pas.filter((p) => p.verset).map((p) => [p.priere, p.verset])).toEqual([
      ['oraison-rosaire', 'avant'],
    ])
  })

  it('en octobre, la clôture du Rosaire suit la même règle que celle du chapelet', () => {
    const cloture = (jour: Date) =>
      derouler(ROSAIRE, optionsDuDeroule(REGLAGES_PAR_DEFAUT, jour))
        .pas.filter((p) => p.dizaine === undefined)
        .slice(OUVERTURE.length)
        .map((p) => p.priere)
    expect(cloture(new Date(2026, 9, 1))).toEqual([
      ...SAINT_PERE,
      'salve-regina',
      'litanies',
      'oraison-rosaire',
      'saint-joseph',
    ])
    expect(cloture(new Date(2026, 10, 1))).toEqual([
      ...SAINT_PERE,
      'salve-regina',
      'oraison-rosaire',
    ])
  })
})

describe('série atteinte', () => {
  it('celle de la dizaine ; la première à l’ouverture, la dernière à la clôture et à la fin', () => {
    const debut = (serie: string) => rosaire.pas.findIndex((p) => p.serie === serie)
    expect(serieAtteinte(rosaire, 0, 'lumineux')).toBe('joyeux')
    expect(serieAtteinte(rosaire, debut('lumineux'), 'lumineux')).toBe('lumineux')
    expect(serieAtteinte(rosaire, debut('douloureux') - 1, 'lumineux')).toBe('lumineux')
    expect(serieAtteinte(rosaire, rosaire.pas.length - 1, 'lumineux')).toBe('glorieux')
    expect(serieAtteinte(rosaire, rosaire.pas.length, 'lumineux')).toBe('glorieux')
  })

  it('au chapelet, la série choisie au seuil', () => {
    expect(serieAtteinte(chapelet, 0, 'douloureux')).toBe('douloureux')
    expect(serieAtteinte(chapelet, 30, 'douloureux')).toBe('douloureux')
  })
})

describe('le Rosaire, phase 18', () => {
  it('la prière aux intentions du Saint-Père suit la vingtième dizaine', () => {
    const fin = rosaire.pas.filter((p) => p.fin)
    expect(fin.map((p) => p.priere)).toEqual([...SAINT_PERE, ...CLOTURE])
    const debut = rosaire.pas.indexOf(fin[0])
    expect(rosaire.pas[debut - 1]).toMatchObject({
      priere: 'o-mon-jesus',
      dizaine: 5,
      serie: 'glorieux',
    })
    expect(fin[0].intentionDuMois).toBe(true)
  })

  it('l’essentiel seulement : le signe de croix, puis les vingt dizaines', () => {
    const essentiel = derouler(ROSAIRE, { essentiel: true })
    const coeur = ['annonce', 'notre-pere', ...Array(10).fill(AVE), 'gloire-au-pere']
    expect(essentiel.pas.map((p) => p.priere)).toEqual([
      'signe-de-croix',
      ...Array.from({ length: 20 }, () => coeur).flat(),
    ])
    expect(essentiel.pas.filter((p) => p.nouvelleSerie)).toHaveLength(3)
  })
})
