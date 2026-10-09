import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  AUX_INTENTIONS_DU_SAINT_PERE,
  INTENTIONS_DU_PAPE,
  CE_MOIS_CI,
  intentionDuMois,
  titreEnLigne,
} from './intentionsDuPape'

// Les intentions de prière du pape, texte français officiel du Réseau mondial
// de prière du pape, validées par le porteur du projet le 2026-10-09 (phase
// 18). Si ce test échoue, un texte a changé : faire valider la nouvelle
// version par le porteur du projet AVANT de mettre à jour l'empreinte.
const empreinte = (donnees: unknown) =>
  createHash('sha256').update(JSON.stringify(donnees)).digest('hex')

describe('intentions de prière du pape', () => {
  it('les 24 intentions de 2026 et 2027 sont celles validées par le porteur du projet', () => {
    expect(empreinte(INTENTIONS_DU_PAPE)).toBe(
      'ef5fdd6a9b1fdee508eed9a3c8e3fac97c2350f08fc6751a80601114cba3c6da',
    )
    expect(Object.keys(INTENTIONS_DU_PAPE)).toEqual(['2026', '2027'])
    for (const annee of Object.values(INTENTIONS_DU_PAPE)) expect(annee).toHaveLength(12)
  })

  it('chacune a un titre « Pour … » et un texte qui prie pour elle', () => {
    for (const [titre, texte] of Object.values(INTENTIONS_DU_PAPE).flat()) {
      expect(titre).toMatch(/^Pour /)
      expect(texte).toMatch(/prions pour/i)
    }
  })

  it('les lignes du chapelet sont celles validées', () => {
    expect(AUX_INTENTIONS_DU_SAINT_PERE).toBe('Aux intentions du Saint-Père.')
    expect(CE_MOIS_CI).toBe('Ce mois-ci :')
  })
})

describe('intention du mois', () => {
  it('octobre 2026 : la pastorale de la santé mentale', () => {
    expect(intentionDuMois(new Date(2026, 9, 6))).toEqual({
      titre: 'Pour la pastorale de la santé mentale',
      texte:
        'Prions pour que la pastorale de la santé mentale se développe dans toute l’Église et aide à surmonter la stigmatisation et la discrimination à l’égard des personnes atteintes de maladies mentales.',
    })
  })

  it('suit le mois du téléphone, du premier au dernier jour', () => {
    expect(intentionDuMois(new Date(2026, 9, 31, 23, 59))?.titre).toBe(
      'Pour la pastorale de la santé mentale',
    )
    expect(intentionDuMois(new Date(2026, 10, 1, 0, 0))?.titre).toBe(
      'Pour le bon usage de la richesse',
    )
    expect(intentionDuMois(new Date(2027, 0, 1))?.titre).toBe(
      'Pour la découverte de la force de la prière',
    )
    expect(intentionDuMois(new Date(2027, 11, 31))?.titre).toBe(
      'Pour la vocation chrétienne de la famille',
    )
  })

  it('donne une intention pour chaque mois de 2026 et de 2027', () => {
    for (const annee of [2026, 2027])
      for (let mois = 0; mois < 12; mois++)
        expect(intentionDuMois(new Date(annee, mois, 15))).toEqual({
          titre: INTENTIONS_DU_PAPE[annee][mois][0],
          texte: INTENTIONS_DU_PAPE[annee][mois][1],
        })
  })

  it('aucune hors des années embarquées', () => {
    expect(intentionDuMois(new Date(2025, 11, 31))).toBeUndefined()
    expect(intentionDuMois(new Date(2028, 0, 1))).toBeUndefined()
  })

  it('le titre se lit dans la ligne, avec une minuscule initiale', () => {
    expect(titreEnLigne('Pour la pastorale de la santé mentale')).toBe(
      'pour la pastorale de la santé mentale',
    )
    expect(titreEnLigne('Pour l’art, un don qui humanise')).toBe('pour l’art, un don qui humanise')
  })
})
