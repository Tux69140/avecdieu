import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  aideMasquable,
  clesCommencantPar,
  ecrireEtSignaler,
  estObjet,
  lireObjet,
  RACINE,
} from './stockage'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('la mémoire du téléphone', () => {
  it('toutes les clés de l’app commencent par « avec-dieu. »', () => {
    expect(RACINE).toBe('avec-dieu.')
  })

  it('reconnaît un objet, ni null ni tableau', () => {
    expect(estObjet({})).toBe(true)
    for (const autre of [null, undefined, [], 'x', 3]) expect(estObjet(autre)).toBe(false)
  })

  it('lit un objet enregistré, ou un objet vide', () => {
    localStorage.setItem('avec-dieu.essai', '{"a":1}')
    expect(lireObjet('avec-dieu.essai')).toEqual({ a: 1 })
    localStorage.setItem('avec-dieu.essai', '[1]')
    expect(lireObjet('avec-dieu.essai')).toEqual({})
    localStorage.setItem('avec-dieu.essai', 'pas du json')
    expect(lireObjet('avec-dieu.essai')).toEqual({})
  })

  it('énumère les clés d’un préfixe, et rien si la mémoire est bloquée', () => {
    localStorage.setItem('avec-dieu.aelf.france.laudes.2026-10-07', '{}')
    localStorage.setItem('avec-dieu.reglages', '{}')
    localStorage.setItem('autre-app.cle', 'x')
    expect(clesCommencantPar('avec-dieu.aelf.')).toEqual([
      'avec-dieu.aelf.france.laudes.2026-10-07',
    ])
    expect(clesCommencantPar(RACINE).sort()).toEqual([
      'avec-dieu.aelf.france.laudes.2026-10-07',
      'avec-dieu.reglages',
    ])
    vi.spyOn(Storage.prototype, 'key').mockImplementation(() => {
      throw new Error('stockage bloqué')
    })
    expect(clesCommencantPar(RACINE)).toEqual([])
  })

  it('écrit puis signale à la page', () => {
    let signale = false
    window.addEventListener('avec-dieu:essai', () => (signale = true), { once: true })
    ecrireEtSignaler('avec-dieu.essai', { a: 1 }, 'avec-dieu:essai')
    expect(signale).toBe(true)
    expect(localStorage.getItem('avec-dieu.essai')).toBe('{"a":1}')
  })

  it('une aide masquée reste masquée jusqu’à ce que les réglages la rétablissent', () => {
    const aide = aideMasquable('avec-dieu.aide-essai')
    expect(aide.aMontrer()).toBe(true)
    aide.masquer()
    expect(localStorage.getItem('avec-dieu.aide-essai')).toBe('masquee')
    expect(aide.aMontrer()).toBe(false)
    aide.montrer()
    expect(aide.aMontrer()).toBe(true)
    expect(localStorage.getItem('avec-dieu.aide-essai')).toBeNull()
  })
})
