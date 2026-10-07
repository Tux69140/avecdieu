import { beforeEach, describe, expect, it } from 'vitest'
import {
  ABSENT,
  contient,
  effacerAvant,
  enregistrer,
  etendue,
  lireEnregistre,
  oublierTout,
  RESSOURCES,
} from './cache'
import { modifierReglages } from '../chapelet/reglages'

beforeEach(() => localStorage.clear())

// Un jour complet : son jour liturgique et ses sept offices.
const jourComplet = (date: string) => {
  for (const ressource of RESSOURCES) enregistrer(ressource, date, { date })
}

describe('la mémoire des réponses AELF', () => {
  it('rend ce qui a été enregistré, pour cette ressource et ce jour seulement', () => {
    enregistrer('laudes', '2026-10-06', { laudes: { hymne: 'Soleil levant' } })
    expect(lireEnregistre('laudes', '2026-10-06')).toEqual({ laudes: { hymne: 'Soleil levant' } })
    expect(lireEnregistre('laudes', '2026-10-07')).toBeUndefined()
    expect(lireEnregistre('vepres', '2026-10-06')).toBeUndefined()
    expect(contient('laudes', '2026-10-06')).toBe(true)
    expect(contient('vepres', '2026-10-06')).toBe(false)
  })

  it('retient qu’un office est absent de l’AELF', () => {
    enregistrer('lectures', '2026-04-05', ABSENT)
    expect(lireEnregistre('lectures', '2026-04-05')).toBe(ABSENT)
    expect(contient('lectures', '2026-04-05')).toBe(true)
  })

  it('ignore une entrée illisible', () => {
    localStorage.setItem('avec-dieu.aelf.france.laudes.2026-10-06', '{tronqué')
    expect(lireEnregistre('laudes', '2026-10-06')).toBeUndefined()
  })

  it('efface les jours d’avant une date, et rien d’autre', () => {
    jourComplet('2026-10-04')
    jourComplet('2026-10-05')
    localStorage.setItem('avec-dieu.reglages', '{}')
    effacerAvant('2026-10-05')
    expect(contient('laudes', '2026-10-04')).toBe(false)
    expect(contient('informations', '2026-10-04')).toBe(false)
    expect(contient('laudes', '2026-10-05')).toBe(true)
    expect(localStorage.getItem('avec-dieu.reglages')).toBe('{}')
  })
})

describe('etendue', () => {
  it('rien d’enregistré : aucune étendue', () => {
    expect(etendue('2026-10-07')).toBeUndefined()
  })

  it('va du premier au dernier jour complet qui se suivent autour d’aujourd’hui', () => {
    for (const date of ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09']) jourComplet(date)
    expect(etendue('2026-10-07')).toEqual({ debut: '2026-10-06', fin: '2026-10-09' })
  })

  it('un jour où manque un seul office n’est pas compté', () => {
    jourComplet('2026-10-07')
    jourComplet('2026-10-08')
    for (const ressource of RESSOURCES.filter((r) => r !== 'complies'))
      enregistrer(ressource, '2026-10-09', {})
    expect(etendue('2026-10-07')).toEqual({ debut: '2026-10-07', fin: '2026-10-08' })
  })

  it('un office absent de l’AELF ne rend pas le jour incomplet', () => {
    jourComplet('2026-04-05')
    enregistrer('lectures', '2026-04-05', ABSENT)
    expect(etendue('2026-04-05')).toEqual({ debut: '2026-04-05', fin: '2026-04-05' })
  })

  it('un trou coupe l’étendue : on garde la suite qui contient aujourd’hui', () => {
    for (const date of ['2026-10-06', '2026-10-07', '2026-10-09', '2026-10-10']) jourComplet(date)
    expect(etendue('2026-10-07')).toEqual({ debut: '2026-10-06', fin: '2026-10-07' })
  })

  it('aujourd’hui manque : on garde la dernière suite enregistrée', () => {
    for (const date of ['2026-10-01', '2026-10-02', '2026-10-09', '2026-10-10']) jourComplet(date)
    expect(etendue('2026-10-20')).toEqual({ debut: '2026-10-09', fin: '2026-10-10' })
  })
})

describe('les zones', () => {
  it('seuls comptent les textes de la zone choisie ; oublierTout efface toutes les zones', () => {
    enregistrer('laudes', '2026-10-06', { zone: 'france' })
    modifierReglages({ zone: 'suisse' })
    expect(contient('laudes', '2026-10-06')).toBe(false)
    enregistrer('laudes', '2026-10-06', { zone: 'suisse' })
    expect(lireEnregistre('laudes', '2026-10-06')).toEqual({ zone: 'suisse' })
    localStorage.setItem('avec-dieu.reglages-autre', 'garde')
    oublierTout()
    expect(contient('laudes', '2026-10-06')).toBe(false)
    modifierReglages({ zone: 'france' })
    expect(contient('laudes', '2026-10-06')).toBe(false)
    expect(localStorage.getItem('avec-dieu.reglages-autre')).toBe('garde')
  })
})
