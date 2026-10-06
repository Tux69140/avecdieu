import { describe, expect, it } from 'vitest'
import { astre, pointDuCadran, REPERES } from './cadran'

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
