import { describe, expect, it } from 'vitest'
import { PRIERES } from '../recueil/prieres'
import { ditEnsemble, strophes } from './versets'

describe('prières dites ensemble, à plusieurs', () => {
  it('le signe de croix, le Credo, le « Ô mon Jésus », le Salve Regina, Sous l’abri et saint Joseph', () => {
    const ensemble = Object.values(PRIERES)
      .filter((p) => ditEnsemble(p, true))
      .map((p) => p.titre)
    expect(ensemble).toEqual([
      'Signe de croix',
      'Je crois en Dieu',
      'Ô mon Jésus',
      'Salve Regina',
      'Sous l’abri de votre miséricorde',
      'Prière à saint Joseph',
    ])
  })

  it('seul, aucune', () => {
    expect(Object.values(PRIERES).filter((p) => ditEnsemble(p, false))).toEqual([])
  })
})

const marques = (s: ReturnType<typeof strophes>) =>
  s.flat().flatMap((v) => (v.marque ? [`${v.marque} ${v.texte}`] : []))

describe('strophes d’une prière', () => {
  it('seul : les strophes du recueil, sans marque', () => {
    const ave = strophes(PRIERES['je-vous-salue-marie'], false)
    expect(ave.map((s) => s.length)).toEqual([3, 2, 3, 1])
    expect(marques(ave)).toEqual([])
  })

  it('à plusieurs : V/ au début, R/ sur la réponse du Je vous salue Marie', () => {
    expect(marques(strophes(PRIERES['je-vous-salue-marie'], true))).toEqual([
      'V Je vous salue, Marie,',
      'R Sainte Marie, Mère de Dieu,',
    ])
  })

  it('à plusieurs : la réponse du Gloire au Père ouvre une nouvelle strophe', () => {
    const gloire = strophes(PRIERES['gloire-au-pere'], true)
    expect(gloire.map((s) => s[0].texte)).toEqual([
      'Gloire au Père, et au Fils, et au Saint-Esprit,',
      'comme il était au commencement,',
      'Amen.',
    ])
    expect(gloire[1][0].marque).toBe('R')
  })

  it('à plusieurs, une prière dite ensemble reste sans marque', () => {
    expect(marques(strophes(PRIERES.credo, true))).toEqual([])
  })

  it('le verset du Salve Regina est toujours marqué, seul ou à plusieurs', () => {
    for (const plusieurs of [false, true])
      expect(marques(strophes(PRIERES['salve-regina'], plusieurs))).toEqual([
        'V Priez pour nous, sainte Mère de Dieu.',
        'R Afin que nous soyons rendus dignes des promesses du Christ.',
      ])
  })
})
