import { describe, expect, it } from 'vitest'
import { insecables } from './typographie'

const NBSP = ' '

describe('insecables', () => {
  it('lie les guillemets français à leur texte', () => {
    expect(insecables('il dit : « Je te salue »')).toBe(
      `il dit${NBSP}: «${NBSP}Je te salue${NBSP}»`,
    )
  })

  it('lie la ponctuation haute au mot qui précède', () => {
    expect(insecables('Pourquoi dormez-vous ? Relevez-vous ! fils ; et')).toBe(
      `Pourquoi dormez-\u2060vous${NBSP}? Relevez-\u2060vous${NBSP}! fils${NBSP}; et`,
    )
  })

  it('ne touche pas au reste du texte', () => {
    expect(insecables('Le sixième mois, l’ange Gabriel')).toBe('Le sixième mois, l’ange Gabriel')
  })

  // Un mot composé ne se coupe pas à son trait d'union : « Saint- » seul en
  // fin de ligne serait un mot coupé (choix du porteur du projet, 2026-10-08).
  it('lie les deux moitiés d’un mot composé', () => {
    expect(insecables('au Saint-Esprit, fais-moi vivre')).toBe(
      'au Saint-\u2060Esprit, fais-\u2060moi vivre',
    )
  })

  it('laisse le tiret entre deux mots', () => {
    expect(insecables('Psaume 93 - I')).toBe('Psaume 93 - I')
  })
})
