import { describe, expect, it } from 'vitest'
import { PRIERES } from './prieres'

// Dans le recueil, chaque ligne est un vers ; une ligne vide ('') sépare deux strophes.
describe('format du recueil des prières', () => {
  for (const [id, { lignes }] of Object.entries(PRIERES)) {
    it(`${id} : vers sans espaces superflus, strophes séparées par une seule ligne vide`, () => {
      for (const ligne of lignes) expect(ligne).toBe(ligne.trim())
      expect(lignes[0]).not.toBe('')
      expect(lignes.at(-1)).not.toBe('')
      lignes.forEach((ligne, i) => {
        if (ligne === '') expect(lignes[i + 1]).not.toBe('')
      })
    })
  }
})
