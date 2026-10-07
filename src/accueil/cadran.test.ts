import { describe, expect, it } from 'vitest'
import {
  astre,
  echelleSolaire,
  JOUR_SOLAIRE,
  pointDuCadran,
  REPERES,
  reperesSolaires,
} from './cadran'

const a = (heures: number, minutes = 0) => heures * 60 + minutes

describe('pointDuCadran', () => {
  it('va de 6 h à gauche à 22 h à droite, symétriquement', () => {
    const matin = pointDuCadran(a(6))
    const soir = pointDuCadran(a(22))
    expect(matin.x).toBeLessThan(soir.x)
    expect(matin.y).toBeCloseTo(soir.y)
    expect(matin.x + soir.x).toBeCloseTo(360)
  })

  it('place midi un peu à gauche du sommet, 14 h au sommet', () => {
    expect(pointDuCadran(a(12)).x).toBeLessThan(180)
    expect(pointDuCadran(a(14)).x).toBeCloseTo(180)
    expect(pointDuCadran(a(14)).y).toBeLessThan(pointDuCadran(a(12)).y)
  })

  it('reste sur l’arc avant 6 h et après 22 h', () => {
    expect(pointDuCadran(a(3))).toEqual(pointDuCadran(a(6)))
    expect(pointDuCadran(a(23, 30))).toEqual(pointDuCadran(a(22)))
  })

  it('écarte un point vers l’extérieur de l’arc', () => {
    expect(pointDuCadran(a(14), 10).y).toBeLessThan(pointDuCadran(a(14)).y)
  })

  it('donne les repères « 6 h · midi · 18 h · 21 h »', () => {
    expect(REPERES.map((r) => r.texte)).toEqual(['6 h', 'midi', '18 h', '21 h'])
  })
})

describe('astre', () => {
  const soleil = { lever: a(7, 58), coucher: a(19, 21) }

  it('le soleil entre le lever et le coucher, à l’heure qu’il est', () => {
    expect(astre(a(12), soleil)).toEqual({ sorte: 'soleil', minutes: a(12) })
  })

  it('la lune avant le lever et après le coucher', () => {
    expect(astre(a(7), soleil).sorte).toBe('lune')
    expect(astre(a(19, 30), soleil)).toEqual({ sorte: 'lune', minutes: a(19, 30) })
    expect(astre(a(23), soleil).sorte).toBe('lune')
  })
})

describe('cadran solaire', () => {
  // Lyon fin décembre : lever 8 h 20, coucher 17 h 05.
  const soleil = { lever: a(8, 20), coucher: a(17, 5) }
  const nuit = [a(6, 30), a(21, 30), a(20)]
  const echelle = echelleSolaire(soleil, nuit)

  it('l’arc doré va du lever au coucher, midi solaire au sommet', () => {
    expect(echelle(soleil.lever)).toBeCloseTo(JOUR_SOLAIRE.debut)
    expect(echelle(soleil.coucher)).toBeCloseTo(JOUR_SOLAIRE.fin)
    expect(echelle((soleil.lever + soleil.coucher) / 2)).toBeCloseTo(0.5)
    expect(pointDuCadran((soleil.lever + soleil.coucher) / 2, 0, echelle).x).toBeCloseTo(180)
  })

  it('les offices de la nuit vont sur les pointillés, les complies au bout', () => {
    expect(echelle(a(6, 30))).toBeCloseTo(0)
    expect(echelle(a(21, 30))).toBeCloseTo(1)
    expect(echelle(a(20))).toBeGreaterThan(JOUR_SOLAIRE.fin)
    expect(echelle(a(20))).toBeLessThan(1)
  })

  it('sans office avant le lever, rien ne passe avant l’arc doré', () => {
    const sansMatin = echelleSolaire(soleil, [a(21, 30)])
    expect(sansMatin(a(5))).toBeCloseTo(JOUR_SOLAIRE.debut)
  })

  it('repères : lever et coucher avec leur heure, midi au sommet', () => {
    expect(reperesSolaires(soleil)).toEqual([
      { lignes: ['lever', '8 h 20'], part: JOUR_SOLAIRE.debut },
      { lignes: ['midi'], part: 0.5 },
      { lignes: ['coucher', '17 h 05'], part: JOUR_SOLAIRE.fin },
    ])
  })
})
