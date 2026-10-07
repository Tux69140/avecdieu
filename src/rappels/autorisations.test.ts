import { beforeEach, describe, expect, it } from 'vitest'
import type { TelephoneSimule } from '../telephone/simulation'
import { etapeSuivante } from './autorisations'
import { noterDemande } from './reglages'

const telephone = (etat: Partial<TelephoneSimule>) => {
  delete window.__telephone
  window.__telephoneInitial = etat
}

beforeEach(() => localStorage.clear())

describe('autorisations au premier rappel activé', () => {
  it('l’accord d’abord, s’il reste à demander', async () => {
    telephone({ accord: 'prompt' })
    expect(await etapeSuivante('activation')).toBe('accord')
  })

  it('puis « À la minute près », si Android ne l’a pas donnée', async () => {
    telephone({ accord: 'granted', exacte: false })
    expect(await etapeSuivante('accord')).toBe('minute')
    expect(await etapeSuivante('activation')).toBe('minute')
  })

  it('puis le guide de batterie, sur Xiaomi et Samsung seulement', async () => {
    telephone({ accord: 'granted', exacte: true, fabricant: 'xiaomi' })
    expect(await etapeSuivante('activation')).toBe('batterie')
    expect(await etapeSuivante('minute')).toBe('batterie')
    telephone({ accord: 'granted', exacte: true, fabricant: 'samsung' })
    expect(await etapeSuivante('accord')).toBe('batterie')
    telephone({ accord: 'granted', exacte: false, fabricant: 'autre' })
    expect(await etapeSuivante('minute')).toBeUndefined()
  })

  it('rien à demander quand tout est accordé', async () => {
    telephone({ accord: 'granted', exacte: true, fabricant: 'autre' })
    expect(await etapeSuivante('activation')).toBeUndefined()
  })

  it('un refus des notifications arrête tout : l’avis de la rubrique prend le relais', async () => {
    telephone({ accord: 'denied', exacte: false, fabricant: 'xiaomi' })
    expect(await etapeSuivante('activation')).toBeUndefined()
    expect(await etapeSuivante('accord')).toBeUndefined()
  })

  it('« À la minute près » et le guide ne viennent qu’une fois', async () => {
    telephone({ accord: 'granted', exacte: false, fabricant: 'samsung' })
    noterDemande('minute')
    expect(await etapeSuivante('activation')).toBe('batterie')
    noterDemande('batterie')
    expect(await etapeSuivante('activation')).toBeUndefined()
  })
})
