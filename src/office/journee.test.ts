import { beforeEach, describe, expect, it } from 'vitest'
import { deplacerInvitatoire, ouvrirOffice, peutRecevoirInvitatoire } from './journee'

describe('R1 : l’office qui ouvre la journée', () => {
  beforeEach(() => localStorage.clear())

  it('le premier des deux offices ouverts porte l’invitatoire, l’autre non', () => {
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(true)
    expect(ouvrirOffice('lectures', '2026-10-06')).toBe(false)
    // Rouvert plus tard dans la journée, il le garde.
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(true)
  })

  it('l’office des lectures ouvert d’abord le prend aux laudes', () => {
    expect(ouvrirOffice('lectures', '2026-10-06')).toBe(true)
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(false)
  })

  it('chaque jour a son premier office', () => {
    expect(ouvrirOffice('lectures', '2026-10-06')).toBe(true)
    expect(ouvrirOffice('laudes', '2026-10-07')).toBe(true)
  })

  it('les autres offices ne portent jamais l’invitatoire, et ne comptent pas', () => {
    expect(ouvrirOffice('tierce', '2026-10-06')).toBe(false)
    expect(ouvrirOffice('vepres', '2026-10-06')).toBe(false)
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(true)
  })

  it('le lien déplace l’invitatoire vers l’office où l’on est', () => {
    ouvrirOffice('lectures', '2026-10-06')
    deplacerInvitatoire('laudes', '2026-10-06')
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(true)
    expect(ouvrirOffice('lectures', '2026-10-06')).toBe(false)
  })

  it('n’encombre pas le téléphone : seules les dernières dates sont retenues', () => {
    for (let jour = 1; jour <= 20; jour++)
      ouvrirOffice('laudes', `2026-10-${String(jour).padStart(2, '0')}`)
    const retenues = Object.keys(JSON.parse(localStorage.getItem('avec-dieu.invitatoire')!))
    expect(retenues).toHaveLength(14)
    expect(retenues[0]).toBe('2026-10-07')
  })

  it('une date plus ancienne que les autres reste retenue une fois ouverte', () => {
    for (let jour = 10; jour <= 25; jour++) ouvrirOffice('laudes', `2026-10-${jour}`)
    expect(ouvrirOffice('lectures', '2026-10-01')).toBe(true)
    expect(ouvrirOffice('laudes', '2026-10-01')).toBe(false)
  })
})

describe('le lien « Le dire ici »', () => {
  it('offert aux laudes et à l’office des lectures quand l’autre porte l’invitatoire', () => {
    expect(peutRecevoirInvitatoire('laudes', { premier: false, invitatoire: true })).toBe(true)
    expect(peutRecevoirInvitatoire('lectures', { premier: false, invitatoire: true })).toBe(true)
  })

  it('pas à l’office qui le porte déjà', () => {
    expect(peutRecevoirInvitatoire('laudes', { premier: true, invitatoire: true })).toBe(false)
  })

  it('pas sans invitatoire à dire (laudes introuvables)', () => {
    expect(peutRecevoirInvitatoire('lectures', { premier: false, invitatoire: false })).toBe(false)
  })

  it('jamais aux autres offices', () => {
    expect(peutRecevoirInvitatoire('vepres', { premier: false, invitatoire: true })).toBe(false)
  })
})
