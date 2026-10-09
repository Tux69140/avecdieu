import { describe, expect, it } from 'vitest'
import { clesDesParties } from './cles'
import type { Partie } from './modele'

const partie = (libelle: string): Partie => ({ type: 'autre', libelle, blocs: [], ajoutee: false })

describe('clesDesParties', () => {
  it('distingue les parties de même libellé par leur rang', () => {
    const parties = ['Antienne', 'Psaume 62', 'Antienne', 'Gloire au Père'].map(partie)
    expect(clesDesParties(parties)).toEqual([
      'Antienne·1',
      'Psaume 62·1',
      'Antienne·2',
      'Gloire au Père·1',
    ])
  })

  it('ne bouge pas quand l’invitatoire s’insère en tête', () => {
    const office = ['Hymne', 'Antienne', 'Psaume 62'].map(partie)
    const avant = clesDesParties(office)
    const apres = clesDesParties([partie('Invitatoire'), partie('Psaume 94'), ...office])
    expect(apres.slice(2)).toEqual(avant)
  })
})
