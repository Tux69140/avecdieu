import { describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL, ROSAIRE } from './definition'
import { derouler } from './deroule'
import { PASSAGES } from '../recueil/passages'
import type { SerieId } from '../recueil/mysteres'
import { choisirPassages, dizaineCommencee, rangDuPassage } from './rotation'

describe('rangDuPassage', () => {
  it('garde le même passage pendant 6 lectures, puis passe au suivant', () => {
    expect([0, 1, 2, 3, 4, 5].map((n) => rangDuPassage(n, 3))).toEqual([0, 0, 0, 0, 0, 0])
    expect(rangDuPassage(6, 3)).toBe(1)
    expect(rangDuPassage(11, 3)).toBe(1)
    expect(rangDuPassage(12, 3)).toBe(2)
  })

  it('revient au premier passage après le dernier', () => {
    expect(rangDuPassage(18, 3)).toBe(0)
    expect(rangDuPassage(18 + 6, 3)).toBe(1)
  })

  it('s’adapte au nombre de passages du mystère', () => {
    expect(rangDuPassage(24, 4)).toBe(0)
    expect(rangDuPassage(18, 4)).toBe(3)
  })
})

describe('dizaineCommencee', () => {
  const complet = derouler(CHAPELET_MARIAL)
  const compact = derouler(CHAPELET_MARIAL, { annonce: false })
  const debut = (deroule: typeof complet, d: number) =>
    deroule.pas.findIndex((p) => p.dizaine === d)

  it('compte une lecture en passant l’annonce pour commencer la dizaine', () => {
    for (let d = 1; d <= 5; d++) {
      const i = debut(complet, d)
      expect(dizaineCommencee(complet, i, i + 1)?.dizaine).toBe(d)
    }
  })

  it('en mode compact, en passant le Notre Père qui porte l’annonce', () => {
    const i = debut(compact, 3)
    expect(compact.pas[i].priere).toBe('notre-pere')
    expect(dizaineCommencee(compact, i, i + 1)?.dizaine).toBe(3)
  })

  it('rien en arrivant sur l’annonce, en reculant, ni ailleurs dans la dizaine', () => {
    const i = debut(complet, 2)
    expect(dizaineCommencee(complet, i - 1, i)).toBeNull()
    expect(dizaineCommencee(complet, i + 1, i)).toBeNull()
    expect(dizaineCommencee(complet, i + 1, i + 2)).toBeNull()
    expect(dizaineCommencee(complet, 0, 1)).toBeNull()
  })
})

describe('dizaineCommencee au Rosaire', () => {
  it('nomme la série et la dizaine : chaque mystère des quatre séries compte sa lecture', () => {
    const rosaire = derouler(ROSAIRE)
    const commencees = rosaire.pas.flatMap((_, i) => {
      const pas = dizaineCommencee(rosaire, i, i + 1)
      return pas ? [`${pas.serie}-${pas.dizaine}`] : []
    })
    expect(commencees).toHaveLength(20)
    expect(new Set(commencees).size).toBe(20)
    expect(commencees.slice(5, 7)).toEqual(['lumineux-1', 'lumineux-2'])
  })
})

describe('choisirPassages', () => {
  const jamaisLu = () => 0

  it('prend le premier passage de chaque mystère tant qu’aucun n’a été lu', () => {
    const passages = choisirPassages(['joyeux'], jamaisLu)
    expect(Object.keys(passages)).toEqual(['joyeux'])
    expect(passages.joyeux).toEqual(PASSAGES.joyeux.map((liste) => liste[0]))
  })

  it('chaque mystère tourne d’après ses propres lectures', () => {
    const lectures = (serie: SerieId, rang: number) =>
      serie === 'douloureux' && rang === 2 ? 6 : 0
    const passages = choisirPassages(['douloureux'], lectures)
    const attendu = PASSAGES.douloureux[1][rangDuPassage(6, PASSAGES.douloureux[1].length)]
    expect(passages.douloureux?.[1]).toBe(attendu)
    expect(passages.douloureux?.[0]).toBe(PASSAGES.douloureux[0][0])
  })

  it('au Rosaire, choisit pour les quatre séries', () => {
    const passages = choisirPassages(ROSAIRE.series!, jamaisLu)
    expect(Object.keys(passages)).toEqual(['joyeux', 'lumineux', 'douloureux', 'glorieux'])
    expect(Object.values(passages).every((liste) => liste?.length === 5)).toBe(true)
  })
})
