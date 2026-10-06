import { describe, expect, it } from 'vitest'
import { retrancherFin, strophesDe, texteDe } from './textes'

describe('textes du recueil dans l’office', () => {
  it('découpe strophes, vers, V/ et R/', () => {
    expect(
      strophesDe(['V/ Bénissons le Seigneur.', 'R/ Nous rendons grâce à Dieu.', '', 'Amen.']),
    ).toEqual([
      [
        [{ texte: 'V/', signe: 'V' }, { texte: 'Bénissons le Seigneur.' }],
        [{ texte: 'R/', signe: 'R' }, { texte: 'Nous rendons grâce à Dieu.' }],
      ],
      [[{ texte: 'Amen.' }]],
    ])
  })
})

describe('retrancher la fin d’un texte', () => {
  const coupe = (lignes: string[], fin: string) => {
    const strophes = strophesDe(lignes)
    return texteDe(retrancherFin(strophes, fin.length))
  }

  it('dans une ligne', () => {
    expect(coupe(['Garde-nous. Lui qui règne.'], ' Lui qui règne.')).toBe('Garde-nous.')
  })

  it('par-delà une fin de ligne', () => {
    expect(coupe(['Garde-nous.', 'Lui qui règne.'], ' Lui qui règne.')).toBe('Garde-nous.')
  })

  it('par-delà plusieurs strophes, sans entamer le texte qui reste', () => {
    expect(
      coupe(['…sa vie divine.', '', 'Lui qui règne.', '', 'Amen.'], ' Lui qui règne. Amen.'),
    ).toBe('…sa vie divine.')
  })
})
