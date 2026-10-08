import { describe, expect, it } from 'vitest'
import { etiquetteDuChapelet } from './libelles'

const JEUDI = new Date(2026, 9, 8, 10, 0)

describe('etiquetteDuChapelet', () => {
  it('dit la série du jour et la date', () => {
    expect(etiquetteDuChapelet(true, JEUDI).replaceAll(' ', ' ')).toBe(
      'Chapelet du jour · jeudi 8 octobre',
    )
  })

  it('une autre série : « Chapelet » seul', () => {
    expect(etiquetteDuChapelet(false, JEUDI).replaceAll(' ', ' ')).toBe(
      'Chapelet · jeudi 8 octobre',
    )
  })

  // À côté de la croix, la ligne se coupe en deux : le point reste en fin de
  // première ligne, la date entière sur la seconde.
  it('ne se coupe qu’après le point', () => {
    expect(etiquetteDuChapelet(true, JEUDI).split(' ')).toEqual([
      'Chapelet du jour ·',
      'jeudi 8 octobre',
    ])
  })
})
