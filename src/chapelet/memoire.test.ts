import { beforeEach, describe, expect, it, vi } from 'vitest'
import { aideAMontrer, compterLecture, lireLectures, masquerAide, montrerAide } from './memoire'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('lectures des mystères', () => {
  it('commencent à zéro et se comptent mystère par mystère', () => {
    expect(lireLectures('joyeux', 1)).toBe(0)
    compterLecture('joyeux', 1)
    compterLecture('joyeux', 1)
    compterLecture('glorieux', 5)
    expect(lireLectures('joyeux', 1)).toBe(2)
    expect(lireLectures('joyeux', 2)).toBe(0)
    expect(lireLectures('glorieux', 5)).toBe(1)
  })

  it('repartent de zéro si la mémoire est illisible', () => {
    localStorage.setItem('avec-dieu.lectures', 'pas du json')
    expect(lireLectures('joyeux', 1)).toBe(0)
    compterLecture('joyeux', 1)
    expect(lireLectures('joyeux', 1)).toBe(1)
  })
})

describe('aide aux gestes', () => {
  it('se montre tant qu’on n’a pas coché « Ne plus afficher »', () => {
    expect(aideAMontrer()).toBe(true)
    masquerAide()
    expect(aideAMontrer()).toBe(false)
  })

  it('revient quand on la rétablit dans les réglages', () => {
    masquerAide()
    montrerAide()
    expect(aideAMontrer()).toBe(true)
  })
})

describe('mémoire indisponible', () => {
  it('n’interrompt jamais la prière : valeurs par défaut, écritures ignorées', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage bloqué')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('stockage bloqué')
    })
    expect(lireLectures('joyeux', 1)).toBe(0)
    expect(() => compterLecture('joyeux', 1)).not.toThrow()
    expect(aideAMontrer()).toBe(true)
    expect(() => masquerAide()).not.toThrow()
  })
})
