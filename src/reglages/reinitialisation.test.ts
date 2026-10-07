import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effacerMemoire } from './reinitialisation'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

const cles = () => Object.keys(localStorage).sort()

describe('réinitialiser l’app', () => {
  it('efface réglages, rappels, lieu, chapelet en cours et lectures', () => {
    for (const cle of [
      'avec-dieu.reglages',
      'avec-dieu.rappels',
      'avec-dieu.heures-solaires',
      'avec-dieu.lieu',
      'avec-dieu.en-cours',
      'avec-dieu.lectures',
      'avec-dieu.aide-gestes',
      'avec-dieu.invitatoire',
    ])
      localStorage.setItem(cle, '{}')
    effacerMemoire()
    expect(cles()).toEqual([])
  })

  it('garde les textes enregistrés de la zone France, et rien d’une autre app', () => {
    localStorage.setItem('avec-dieu.aelf.france.laudes.2026-10-07', '{}')
    localStorage.setItem('autre-app.cle', 'x')
    effacerMemoire()
    expect(cles()).toEqual(['autre-app.cle', 'avec-dieu.aelf.france.laudes.2026-10-07'])
  })

  it('oublie les textes d’une autre zone : l’app revient à la France', () => {
    localStorage.setItem('avec-dieu.reglages', JSON.stringify({ zone: 'belgique' }))
    localStorage.setItem('avec-dieu.aelf.belgique.laudes.2026-10-07', '{}')
    effacerMemoire()
    expect(cles()).toEqual([])
  })

  it('ne lève rien si la mémoire est indisponible', () => {
    vi.spyOn(Storage.prototype, 'key').mockImplementation(() => {
      throw new Error('stockage bloqué')
    })
    expect(() => effacerMemoire()).not.toThrow()
  })
})
