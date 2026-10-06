import { describe, expect, it } from 'vitest'
import { TEXTES_OFFICE } from './office'
import { PRIERES } from './prieres'

// Dans le recueil, chaque ligne est un vers ; une ligne vide ('') sépare deux strophes.
describe('format du recueil des prières', () => {
  for (const [id, { lignes, reponse }] of Object.entries(PRIERES)) {
    if (reponse !== undefined)
      it(`${id} : la réponse commence sur un vers de la prière, après le premier`, () => {
        expect(lignes.indexOf(reponse)).toBeGreaterThan(0)
      })

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

describe('format du recueil des offices', () => {
  for (const [id, lignes] of Object.entries(TEXTES_OFFICE))
    it(`${id} : vers sans espaces superflus, apostrophe typographique`, () => {
      expect(lignes.length).toBeGreaterThan(0)
      for (const ligne of lignes) {
        expect(ligne).toBe(ligne.trim())
        expect(ligne).not.toBe('')
        expect(ligne).not.toContain("'")
      }
    })
})
