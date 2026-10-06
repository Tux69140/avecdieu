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
      `Pourquoi dormez-vous${NBSP}? Relevez-vous${NBSP}! fils${NBSP}; et`,
    )
  })

  it('ne touche pas au reste du texte', () => {
    expect(insecables('Le sixième mois, l’ange Gabriel')).toBe('Le sixième mois, l’ange Gabriel')
  })
})
