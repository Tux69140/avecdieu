import { beforeEach, describe, expect, it } from 'vitest'
import { changerActualisation, choisirLieu, lireLieu } from './lieu'
import type { Ville } from './villes'
import { lieuDeLaPosition, verifierLeVoyage } from './voyage'

const LYON = { nom: 'Lyon', pres: false, latitude: 45.76, longitude: 4.84 }
const VILLES: Ville[] = [
  { nom: 'Lyon', region: '', pays: 'FR', latitude: 45.76, longitude: 4.84, population: 520 },
  { nom: 'Marseille', region: '', pays: 'FR', latitude: 43.3, longitude: 5.38, population: 870 },
  { nom: 'Aubagne', region: '', pays: 'FR', latitude: 43.29, longitude: 5.57, population: 47 },
]
const trouvee = (latitude: number, longitude: number) => async () =>
  ({ sorte: 'trouvee', position: { latitude, longitude } }) as const
const charger = async () => VILLES

beforeEach(() => localStorage.clear())

describe('lieu trouvé par le GPS', () => {
  it('garde la position exacte, nommée d’après la ville la plus proche', () => {
    expect(lieuDeLaPosition({ latitude: 43.28, longitude: 5.5 }, VILLES)).toEqual({
      nom: 'Aubagne',
      pres: true,
      latitude: 43.28,
      longitude: 5.5,
    })
  })
})

describe('voyage', () => {
  it('au-delà de 50 km, avec l’option, le lieu change sans rien demander', async () => {
    choisirLieu(LYON)
    changerActualisation(true)
    await verifierLeVoyage(trouvee(43.31, 5.37), charger)
    expect(lireLieu().lieu).toEqual({
      nom: 'Marseille',
      pres: true,
      latitude: 43.31,
      longitude: 5.37,
    })
  })

  it('en deçà de 50 km, rien ne change', async () => {
    choisirLieu(LYON)
    changerActualisation(true)
    await verifierLeVoyage(trouvee(45.77, 4.88), charger)
    expect(lireLieu().lieu).toEqual(LYON)
  })

  it('sans l’option, la position n’est même pas demandée', async () => {
    choisirLieu(LYON)
    let demandee = false
    await verifierLeVoyage(async () => {
      demandee = true
      return { sorte: 'trouvee', position: { latitude: 43.3, longitude: 5.37 } }
    }, charger)
    expect(demandee).toBe(false)
    expect(lireLieu().lieu).toEqual(LYON)
  })

  it('une position refusée ou introuvable laisse le lieu tel quel', async () => {
    choisirLieu(LYON)
    changerActualisation(true)
    await verifierLeVoyage(async () => ({ sorte: 'refusee' }), charger)
    await verifierLeVoyage(async () => ({ sorte: 'introuvable' }), charger)
    expect(lireLieu().lieu).toEqual(LYON)
  })
})
