import { describe, expect, it } from 'vitest'
import { DESCENTE, REMONTEE, suivreBarre, type Barre } from './barre'

const hors = { horsTitre: true, enFin: false }
// Fait défiler de position en position, comme une suite d'événements.
const defiler = (depart: Barre, positions: number[], contexte = hors) =>
  positions.reduce((barre, position) => suivreBarre(barre, position, contexte), depart)

const cachee: Barre = { visible: false, ancre: 1000 }
const montree: Barre = { visible: true, ancre: 1000 }

describe('barre de l’office qui s’efface', () => {
  it('reste cachée tant que l’en-tête de l’office est à l’écran', () => {
    expect(suivreBarre(montree, 900, { horsTitre: false, enFin: false })).toEqual({
      visible: false,
      ancre: 900,
    })
  })

  it('reste cachée quand on lit en descendant', () => {
    expect(defiler(cachee, [1100, 1400, 2000])).toEqual({ visible: false, ancre: 2000 })
  })

  it(`revient après ${REMONTEE} px de remontée, pas avant`, () => {
    const lue = defiler(cachee, [1500])
    expect(defiler(lue, [1500 - REMONTEE + 1]).visible).toBe(false)
    expect(defiler(lue, [1500 - REMONTEE]).visible).toBe(true)
  })

  it('ne clignote pas au tremblement du doigt', () => {
    const lue = defiler(cachee, [1500, 1490, 1500, 1492, 1501])
    expect(lue.visible).toBe(false)
  })

  it(`repart après ${DESCENTE} px de descente depuis le plus haut atteint`, () => {
    const revenue = defiler(cachee, [1500, 1400])
    expect(revenue.visible).toBe(true)
    expect(defiler(revenue, [1350, 1350 + DESCENTE - 1]).visible).toBe(true)
    expect(defiler(revenue, [1350, 1350 + DESCENTE]).visible).toBe(false)
  })

  it('revient en fin d’office, où l’on veut partir', () => {
    expect(suivreBarre(cachee, 9000, { horsTitre: true, enFin: true })).toEqual({
      visible: true,
      ancre: 9000,
    })
  })
})
