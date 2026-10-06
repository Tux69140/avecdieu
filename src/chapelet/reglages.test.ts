import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lireReglages, modifierReglages, optionsDuDeroule, REGLAGES_PAR_DEFAUT } from './reglages'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('réglages du chapelet', () => {
  it('par défaut : ceux du PRD, prière seul et vibrations actives', () => {
    expect(lireReglages()).toEqual({
      annonce: true,
      oMonJesus: true,
      salveRegina: true,
      plusieurs: false,
      affichage: 'complet',
      vibrations: true,
    })
    expect(REGLAGES_PAR_DEFAUT).toEqual(lireReglages())
  })

  it('retiennent chaque changement sans toucher aux autres', () => {
    modifierReglages({ salveRegina: false })
    modifierReglages({ affichage: 'compact', vibrations: false })
    expect(lireReglages()).toEqual({
      ...REGLAGES_PAR_DEFAUT,
      salveRegina: false,
      affichage: 'compact',
      vibrations: false,
    })
  })

  it('reprennent l’affichage choisi avant les réglages (phase 3)', () => {
    localStorage.setItem('avec-dieu.affichage', 'compact')
    expect(lireReglages().affichage).toBe('compact')
    modifierReglages({ vibrations: false })
    localStorage.removeItem('avec-dieu.affichage')
    expect(lireReglages().affichage).toBe('compact')
  })

  it('ignorent une mémoire illisible ou des valeurs invalides', () => {
    localStorage.setItem('avec-dieu.reglages', 'pas du json')
    expect(lireReglages()).toEqual(REGLAGES_PAR_DEFAUT)
    localStorage.setItem(
      'avec-dieu.reglages',
      JSON.stringify({ annonce: 'non', affichage: 'grand', vibrations: false }),
    )
    expect(lireReglages()).toEqual({ ...REGLAGES_PAR_DEFAUT, vibrations: false })
  })

  it('n’interrompent jamais la prière si la mémoire est bloquée', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage bloqué')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('stockage bloqué')
    })
    expect(lireReglages()).toEqual(REGLAGES_PAR_DEFAUT)
    expect(() => modifierReglages({ vibrations: false })).not.toThrow()
  })
})

describe('options du déroulé selon les réglages', () => {
  it('l’annonce n’a d’écran à part qu’en texte complet', () => {
    expect(optionsDuDeroule(REGLAGES_PAR_DEFAUT)).toEqual({
      annonce: true,
      oMonJesus: true,
      salveRegina: true,
    })
    expect(optionsDuDeroule({ ...REGLAGES_PAR_DEFAUT, affichage: 'compact' }).annonce).toBe(false)
    expect(optionsDuDeroule({ ...REGLAGES_PAR_DEFAUT, annonce: false }).annonce).toBe(false)
  })

  it('le « Ô mon Jésus » et le Salve Regina suivent leurs réglages', () => {
    expect(
      optionsDuDeroule({ ...REGLAGES_PAR_DEFAUT, oMonJesus: false, salveRegina: false }),
    ).toEqual({ annonce: true, oMonJesus: false, salveRegina: false })
  })
})
