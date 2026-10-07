import { beforeEach, describe, expect, it } from 'vitest'
import type { TelephoneSimule } from '../telephone/simulation'
import { etapeSuivante } from './autorisations'
import { noterDemande } from './reglages'

const telephone = (etat: Partial<TelephoneSimule>) => {
  delete window.__telephone
  window.__telephoneInitial = etat
}

const batterie = { batterie: true, arrierePlan: false }

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
    telephone({ accord: 'granted', exacte: true, fabricant: 'xiaomi', blocages: batterie })
    expect(await etapeSuivante('activation')).toBe('batterie')
    expect(await etapeSuivante('minute')).toBe('batterie')
    telephone({ accord: 'granted', exacte: true, fabricant: 'samsung', blocages: batterie })
    expect(await etapeSuivante('accord')).toBe('batterie')
    telephone({ accord: 'granted', exacte: false, fabricant: 'autre', blocages: batterie })
    expect(await etapeSuivante('minute')).toBeUndefined()
  })

  it('pas de guide de batterie quand elle ne bloque pas', async () => {
    telephone({ accord: 'granted', exacte: true, fabricant: 'samsung' })
    expect(await etapeSuivante('activation')).toBeUndefined()
  })

  it('puis le démarrage automatique, s’il est désactivé', async () => {
    const bloque = { batterie: true, arrierePlan: false, demarrage: true }
    telephone({ accord: 'granted', exacte: true, fabricant: 'xiaomi', blocages: bloque })
    expect(await etapeSuivante('batterie')).toBe('demarrage')
    telephone({
      accord: 'granted',
      exacte: true,
      fabricant: 'xiaomi',
      blocages: { ...bloque, batterie: false },
    })
    expect(await etapeSuivante('activation')).toBe('demarrage')
    expect(await etapeSuivante('demarrage')).toBeUndefined()
    telephone({
      accord: 'granted',
      exacte: true,
      fabricant: 'xiaomi',
      blocages: { ...bloque, demarrage: false },
    })
    expect(await etapeSuivante('batterie')).toBeUndefined()
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

  it('« À la minute près » et les guides ne viennent qu’une fois', async () => {
    const bloque = { batterie: true, arrierePlan: false, demarrage: true }
    telephone({ accord: 'granted', exacte: false, fabricant: 'xiaomi', blocages: bloque })
    noterDemande('minute')
    expect(await etapeSuivante('activation')).toBe('batterie')
    noterDemande('batterie')
    expect(await etapeSuivante('activation')).toBe('demarrage')
    noterDemande('demarrage')
    expect(await etapeSuivante('activation')).toBeUndefined()
  })
})
