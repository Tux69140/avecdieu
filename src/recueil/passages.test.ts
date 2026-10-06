import { describe, expect, it } from 'vitest'
import { SERIES, type SerieId } from './mysteres'
import { PASSAGES } from './passages'

// Format du recueil des passages : toute traduction qui le remplace doit le respecter.
describe('recueil des passages', () => {
  for (const serie of Object.keys(SERIES) as SerieId[]) {
    PASSAGES[serie].forEach((passages, i) => {
      const mystere = SERIES[serie].mysteres[i]
      it(`${mystere} : au moins trois passages, versets non vides et dans l'ordre`, () => {
        expect(passages.length).toBeGreaterThanOrEqual(3)
        for (const { reference, versets } of passages) {
          expect(reference).toBe(reference.trim())
          const numeros = Object.keys(versets).map(Number)
          expect(numeros.length).toBeGreaterThan(0)
          expect(numeros).toEqual([...numeros].sort((a, b) => a - b))
          for (const texte of Object.values(versets)) {
            expect(texte).toBe(texte.trim())
            expect(texte).not.toMatch(/[<>&]/)
          }
        }
      })
    })
  }
})
