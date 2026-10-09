import { describe, expect, it } from 'vitest'
import { officeSuivant } from './modele'

// En fin d'office, le lien vers l'office suivant du jour (2026-10-09).
describe('officeSuivant', () => {
  it('suit l’ordre du jour, de l’office des lectures aux vêpres', () => {
    expect(officeSuivant('lectures')).toBe('laudes')
    expect(officeSuivant('laudes')).toBe('tierce')
    expect(officeSuivant('tierce')).toBe('sexte')
    expect(officeSuivant('sexte')).toBe('none')
    expect(officeSuivant('none')).toBe('vepres')
    expect(officeSuivant('vepres')).toBe('complies')
  })

  it('après les complies, la journée est finie : aucun', () => {
    expect(officeSuivant('complies')).toBeUndefined()
  })
})
