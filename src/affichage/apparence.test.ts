import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { modifierReglages } from '../chapelet/reglages'
import { appliquerApparence, estNuit, suivreApparence } from './apparence'

// Le 6 octobre 2026 au centre de la France : lever vers 8 h, coucher vers 19 h 20.
const MARDI = (heures: number, minutes = 0) => new Date(2026, 9, 6, heures, minutes)

describe('estNuit', () => {
  it('en automatique, la nuit tombe au coucher du soleil et se lève avec lui', () => {
    expect(estNuit('automatique', false, MARDI(12))).toBe(false)
    expect(estNuit('automatique', false, MARDI(19, 0))).toBe(false)
    expect(estNuit('automatique', false, MARDI(19, 40))).toBe(true)
    expect(estNuit('automatique', false, MARDI(23, 50))).toBe(true)
    expect(estNuit('automatique', false, MARDI(6, 30))).toBe(true)
    expect(estNuit('automatique', false, MARDI(8, 30))).toBe(false)
  })

  it('en automatique, suit le coucher du soleil du lieu choisi', () => {
    // À Brest, le soleil se couche vers 19 h 47, une demi-heure après le centre.
    const BREST = { latitude: 48.39, longitude: -4.49 }
    expect(estNuit('automatique', false, MARDI(19, 35))).toBe(true)
    expect(estNuit('automatique', false, MARDI(19, 35), BREST)).toBe(false)
    expect(estNuit('automatique', false, MARDI(19, 55), BREST)).toBe(true)
  })

  it('en automatique, le mode sombre d’Android l’emporte, même à midi', () => {
    expect(estNuit('automatique', true, MARDI(12))).toBe(true)
  })

  it('« Jour » et « Nuit » forcent le thème, quoi que disent Android et le soleil', () => {
    expect(estNuit('jour', true, MARDI(23))).toBe(false)
    expect(estNuit('nuit', false, MARDI(12))).toBe(true)
  })
})

describe('appliquerApparence', () => {
  it('pose le thème et la taille du texte à prier sur la page', () => {
    appliquerApparence({ theme: 'nuit', tailleTexte: 22 }, false, MARDI(12))
    expect(document.documentElement.dataset.theme).toBe('nuit')
    expect(document.documentElement.style.getPropertyValue('--taille-priere')).toBe('22px')
    appliquerApparence({ theme: 'automatique', tailleTexte: 18 }, false, MARDI(12))
    expect(document.documentElement.dataset.theme).toBe('jour')
    expect(document.documentElement.style.getPropertyValue('--taille-priere')).toBe('18px')
  })
})

describe('suivreApparence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(MARDI(19, 0))
  })
  afterEach(() => vi.useRealTimers())

  it('passe en nuit au coucher du soleil, sans rouvrir l’app', () => {
    const arret = suivreApparence()
    expect(document.documentElement.dataset.theme).toBe('jour')
    vi.advanceTimersByTime(40 * 60_000)
    expect(document.documentElement.dataset.theme).toBe('nuit')
    arret()
  })

  it('suit aussitôt un réglage changé', () => {
    const arret = suivreApparence()
    modifierReglages({ theme: 'nuit', tailleTexte: 24 })
    expect(document.documentElement.dataset.theme).toBe('nuit')
    expect(document.documentElement.style.getPropertyValue('--taille-priere')).toBe('24px')
    arret()
  })
})
