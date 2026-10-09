import { describe, expect, it } from 'vitest'
import { AUTRES_PRIERES, estPriereSeule, PRIERES_DIRECTES } from './seules'

// Une adresse comme /priere/toString ne doit pas passer pour une prière :
// toString est une propriété héritée de tout objet.
describe('estPriereSeule', () => {
  it('reconnaît les prières du menu, et elles seules', () => {
    for (const priere of [...PRIERES_DIRECTES, ...AUTRES_PRIERES])
      expect(estPriereSeule(priere)).toBe(true)
    for (const autre of ['toString', 'constructor', '__proto__', 'valueOf', 'inconnue'])
      expect(estPriereSeule(autre)).toBe(false)
  })
})
