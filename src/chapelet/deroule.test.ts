import { describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL } from './definition'
import { derouler, type Options } from './deroule'

const deroule = derouler(CHAPELET_MARIAL)
const prieres = deroule.pas.map((p) => p.priere)

const AVE = 'je-vous-salue-marie'
const OUVERTURE = ['signe-de-croix', 'credo', 'notre-pere', AVE, AVE, AVE, 'gloire-au-pere']
const dizaine = ['annonce', 'notre-pere', ...Array(10).fill(AVE), 'gloire-au-pere', 'o-mon-jesus']
const CLOTURE = ['salve-regina', 'litanies', 'oraison-rosaire', 'sous-l-abri', 'saint-joseph']

describe('déroulé du chapelet marial', () => {
  it('suit exactement le PRD : ouverture, 5 dizaines, clôture dans l’ordre validé', () => {
    expect(prieres).toEqual([
      ...OUVERTURE,
      ...dizaine,
      ...dizaine,
      ...dizaine,
      ...dizaine,
      ...dizaine,
      ...CLOTURE,
    ])
  })

  it('numérote les dizaines de 1 à 5 ; l’ouverture et la clôture n’en ont pas', () => {
    expect(deroule.pas.slice(0, 7).every((p) => p.dizaine === undefined)).toBe(true)
    for (let d = 1; d <= 5; d++) {
      const debut = 7 + (d - 1) * 14
      const pasDizaine = deroule.pas.slice(debut, debut + 14)
      expect(pasDizaine.every((p) => p.dizaine === d)).toBe(true)
    }
    expect(deroule.pas.slice(-5).every((p) => p.dizaine === undefined)).toBe(true)
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

  it('dessine 59 grains (53 petits, 6 gros), la croix, 6 nœuds et la médaille', () => {
    const compte = (type: string) => deroule.grains.filter((g) => g === type).length
    expect(compte('petit')).toBe(53)
    expect(compte('gros')).toBe(6)
    expect(compte('croix')).toBe(1)
    expect(compte('noeud')).toBe(6)
    expect(compte('medaille')).toBe(1)
    expect(
      deroule.pas
        .filter((p) => p.priere === 'gloire-au-pere')
        .every((p) => deroule.grains[p.grain] === 'noeud'),
    ).toBe(true)
  })

  it('dit le « Ô mon Jésus » sur le nœud du Gloire au Père, le Salve Regina sur la médaille', () => {
    for (const p of deroule.pas.filter((p) => p.priere === 'o-mon-jesus')) {
      const gloire = deroule.pas[deroule.pas.indexOf(p) - 1]
      expect(gloire.priere).toBe('gloire-au-pere')
      expect(p.grain).toBe(gloire.grain)
    }
    expect(deroule.grains[deroule.pas.at(-1)!.grain]).toBe('medaille')
  })

  it('annonce chaque mystère sur le gros grain de son Notre Père', () => {
    const annonces = deroule.pas.filter((p) => p.priere === 'annonce')
    expect(annonces.map((p) => p.dizaine)).toEqual([1, 2, 3, 4, 5])
    for (const annonce of annonces) {
      const notrePere = deroule.pas[deroule.pas.indexOf(annonce) + 1]
      expect(notrePere.priere).toBe('notre-pere')
      expect(notrePere.grain).toBe(annonce.grain)
      expect(deroule.grains[annonce.grain]).toBe('gros')
    }
  })

  it('avance d’un grain à la fois, sans en sauter', () => {
    for (let i = 1; i < deroule.pas.length; i++) {
      const ecart = deroule.pas[i].grain - deroule.pas[i - 1].grain
      expect(ecart === 0 || ecart === 1).toBe(true)
    }
    expect(deroule.pas.at(-1)!.grain).toBe(deroule.grains.length - 1)
  })
})

// Chaque combinaison des options des dizaines : l'option retirée disparaît,
// rien d'autre ne bouge.
describe('options du déroulé', () => {
  const combinaisons: Options[] = []
  for (const annonce of [true, false])
    for (const oMonJesus of [true, false])
      for (const salveRegina of [true, false])
        combinaisons.push({ annonce, oMonJesus, salveRegina })

  for (const options of combinaisons) {
    const nom = Object.entries(options)
      .map(([option, actif]) => `${option} ${actif ? 'oui' : 'non'}`)
      .join(', ')
    it(nom, () => {
      const choisi = derouler(CHAPELET_MARIAL, options)
      const attendu = prieres.filter(
        (p) =>
          (options.annonce || p !== 'annonce') &&
          (options.oMonJesus || p !== 'o-mon-jesus') &&
          (options.salveRegina || p !== 'salve-regina'),
      )
      expect(choisi.pas.map((p) => p.priere)).toEqual(attendu)
      // Les grains du chapelet restent les mêmes, médaille comprise.
      expect(choisi.grains).toEqual(deroule.grains)
      // Le Notre Père de chaque dizaine reste sur son gros grain.
      const grainDe = (d: number, liste: typeof deroule) =>
        liste.pas.find((p) => p.dizaine === d && p.priere === 'notre-pere')!.grain
      for (let d = 1; d <= 5; d++) expect(grainDe(d, choisi)).toBe(grainDe(d, deroule))
      expect(choisi.pas.at(-1)!.grain).toBe(choisi.grains.length - 1)
    })
  }
})

describe('intentions des trois premiers Je vous salue Marie', () => {
  it('la foi, l’espérance, la charité, chacune avant son Je vous salue Marie', () => {
    expect(deroule.pas.slice(3, 6).map((p) => p.intention)).toEqual([
      'Pour la foi.',
      'Pour l’espérance.',
      'Pour la charité.',
    ])
  })

  it('aucune ailleurs, ni sans le réglage', () => {
    expect(deroule.pas.filter((p) => p.intention !== undefined)).toHaveLength(3)
    const sans = derouler(CHAPELET_MARIAL, { intentions: false })
    expect(sans.pas.filter((p) => p.intention !== undefined)).toEqual([])
    // Les grains ne bougent pas : l'intention accompagne le grain du Je vous salue Marie.
    expect(sans.pas.map((p) => [p.priere, p.grain])).toEqual(
      deroule.pas.map((p) => [p.priere, p.grain]),
    )
  })
})

// Les cinq textes de la clôture, chacun dit ou non : 32 combinaisons.
describe('clôture du chapelet', () => {
  const OPTIONS = ['salveRegina', 'litanies', 'oraisonRosaire', 'sousLAbri', 'saintJoseph'] as const
  for (let masque = 0; masque < 32; masque++) {
    const options: Options = Object.fromEntries(
      OPTIONS.map((option, i) => [option, (masque & (1 << i)) !== 0]),
    )
    const dites = CLOTURE.filter((_, i) => (masque & (1 << i)) !== 0)
    const nom = dites.length > 0 ? dites.join(', ') : 'rien'
    it(nom, () => {
      const choisi = derouler(CHAPELET_MARIAL, options)
      const cloture = choisi.pas.slice(prieres.length - CLOTURE.length)
      // L'ordre validé, sans rien d'autre.
      expect(cloture.map((p) => p.priere)).toEqual(dites)
      // Toute la clôture se dit sur la médaille, qui n'existe que si l'on y prie.
      expect(cloture.every((p) => choisi.grains[p.grain] === 'medaille')).toBe(true)
      expect(new Set(cloture.map((p) => p.grain)).size).toBe(Math.min(dites.length, 1))
      expect(choisi.grains.filter((g) => g === 'medaille')).toHaveLength(Math.min(dites.length, 1))
      expect(choisi.pas.at(-1)!.grain).toBe(choisi.grains.length - 1)
      // Le verset, une seule fois : avant l'oraison si elle est dite, sinon à
      // la fin du Salve Regina, sinon nulle part.
      const versets = choisi.pas.filter((p) => p.verset !== undefined)
      if (dites.includes('oraison-rosaire'))
        expect(versets.map((p) => [p.priere, p.verset])).toEqual([['oraison-rosaire', 'avant']])
      else if (dites.includes('salve-regina'))
        expect(versets.map((p) => [p.priere, p.verset])).toEqual([['salve-regina', 'apres']])
      else expect(versets).toEqual([])
    })
  }
})
