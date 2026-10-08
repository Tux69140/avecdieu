import { describe, expect, it } from 'vitest'
import { PRIERES, VERSET_MARIAL } from '../recueil/prieres'
import { priereDuPas } from './texteDuPas'
import { strophes } from './versets'

const SALVE = PRIERES['salve-regina']
const ORAISON = PRIERES['oraison-rosaire']

const marques = (s: ReturnType<typeof strophes>) =>
  s.flat().flatMap((v) => (v.marque ? [`${v.marque} ${v.texte}`] : []))

describe('la prière telle qu’elle se dit au chapelet', () => {
  it('le Salve Regina qui porte le verset est celui du recueil', () => {
    expect(priereDuPas({ priere: 'salve-regina', verset: 'apres' })).toEqual(SALVE)
  })

  it('le verset passé à l’oraison, le Salve Regina finit sur « ô douce Vierge Marie »', () => {
    const salve = priereDuPas({ priere: 'salve-regina' })
    expect(salve.titre).toBe('Salve Regina')
    expect(salve.lignes).toEqual(SALVE.lignes.slice(0, -3))
    expect(salve.lignes.at(-1)).toBe('ô douce Vierge Marie.')
  })

  it('l’oraison du Rosaire s’ouvre sur le verset, puis « Prions »', () => {
    const oraison = priereDuPas({ priere: 'oraison-rosaire', verset: 'avant' })
    expect(oraison.lignes).toEqual([...VERSET_MARIAL, '', ...ORAISON.lignes])
    expect(oraison.reponse).toBe('Amen.')
  })

  it('les autres prières restent celles du recueil', () => {
    for (const id of ['credo', 'sous-l-abri', 'saint-joseph', 'je-vous-salue-marie'] as const)
      expect(priereDuPas({ priere: id })).toEqual(PRIERES[id])
  })

  it('à plusieurs : ℣ ℟ pour le verset, ℣ pour l’oraison de celui qui mène, ℟ pour l’Amen de tous', () => {
    const oraison = priereDuPas({ priere: 'oraison-rosaire', verset: 'avant' })
    expect(marques(strophes(oraison, true))).toEqual([
      'V Priez pour nous, sainte Mère de Dieu.',
      'R Afin que nous soyons rendus dignes des promesses du Christ.',
      'V Prions.',
      'R Amen.',
    ])
    // Seul, le verset garde ses marques, l'oraison n'en a pas.
    expect(marques(strophes(oraison, false))).toEqual(marques(strophes(oraison, true)).slice(0, 2))
  })
})
