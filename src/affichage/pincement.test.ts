import { describe, expect, it } from 'vitest'
import { creerPincement } from './pincement'

// Deux doigts posés à 100 px l'un de l'autre, puis écartés ou rapprochés.
const doigts = (ecart: number) => [
  { x: 0, y: 0 },
  { x: ecart, y: 0 },
]

describe('le pincement', () => {
  it('écarter les doigts agrandit d’un cran, puis d’un autre si l’on continue', () => {
    const crans: number[] = []
    const pincement = creerPincement((sens) => crans.push(sens))
    pincement.poser(doigts(100))
    pincement.bouger(doigts(110))
    expect(crans).toEqual([])
    pincement.bouger(doigts(130))
    expect(crans).toEqual([1])
    pincement.bouger(doigts(170))
    expect(crans).toEqual([1, 1])
  })

  it('rapprocher les doigts réduit', () => {
    const crans: number[] = []
    const pincement = creerPincement((sens) => crans.push(sens))
    pincement.poser(doigts(200))
    pincement.bouger(doigts(150))
    expect(crans).toEqual([-1])
  })

  it('un seul doigt ne pince pas', () => {
    const crans: number[] = []
    const pincement = creerPincement((sens) => crans.push(sens))
    pincement.poser([{ x: 0, y: 0 }])
    pincement.bouger([{ x: 300, y: 0 }])
    expect(crans).toEqual([])
  })

  it('un doigt levé termine le geste', () => {
    const crans: number[] = []
    const pincement = creerPincement((sens) => crans.push(sens))
    pincement.poser(doigts(100))
    pincement.lever()
    pincement.bouger(doigts(200))
    expect(crans).toEqual([])
  })
})
