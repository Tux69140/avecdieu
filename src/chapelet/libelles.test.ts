import { describe, expect, it } from 'vitest'
import { AIDE_VIBRATIONS } from './libelles'

describe('AIDE_VIBRATIONS', () => {
  // Un mot composé ne se coupe pas en fin de ligne (2026-10-08).
  it('« Coupez-les » ne se coupe pas à son trait d’union', () => {
    expect(AIDE_VIBRATIONS).toContain('Coupez-⁠les')
  })
})
