import { describe, expect, it } from 'vitest'
import {
  AUX_INTENTIONS,
  CHAPELET_OU_ROSAIRE,
  ESSENTIEL,
  FACULTATIF,
  passageDeSerie,
  PRIERE_SAINT_PERE,
  repereSerie,
  VIBRATIONS,
} from './libelles'

describe('VIBRATIONS', () => {
  // Un mot composé ne se coupe pas en fin de ligne (2026-10-08).
  it('« Coupez-les » ne se coupe pas à son trait d’union', () => {
    expect(VIBRATIONS.aide).toContain('Coupez-\u2060les')
  })
})

describe('CHAPELET_OU_ROSAIRE', () => {
  // Le texte validé mot à mot (phase 17), une fois ôtées les espaces
  // insécables et les liants posés pour la mise en page.
  const brut = (texte: string) => texte.replace(/\u00a0/g, ' ').replace(/\u2060/g, '')

  it('reprend mot à mot le texte validé par le porteur du projet', () => {
    expect(brut(CHAPELET_OU_ROSAIRE.titre)).toBe('Chapelet ou Rosaire ?')
    expect(CHAPELET_OU_ROSAIRE.formes.map(([nom, suite]) => nom + brut(suite))).toEqual([
      'Chapelet : cinq dizaines, la série de mystères du jour.',
      'Rosaire : vingt dizaines, les quatre séries à la suite. On peut s’arrêter entre deux séries et reprendre plus tard dans la journée. La puissance spirituelle XXL.',
    ])
    expect(CHAPELET_OU_ROSAIRE.paragraphes.map(brut)).toEqual([
      'Le Rosaire est né au Moyen Âge. Ceux qui ne savaient pas lire les 150 psaumes disaient à la place 150 Je vous salue Marie : on l’appela le « psautier de Marie ». La tradition l’attribue à saint Dominique, et les dominicains l’ont répandu. En 1569, saint Pie V en fixe la forme : quinze dizaines, en mystères joyeux, douloureux et glorieux. En 2002, saint Jean-Paul II ajoute les mystères lumineux, ceux de la vie publique de Jésus.',
      'Le chapelet en est le quart. En priant chaque jour la série du jour, on parcourt tout le Rosaire dans la semaine. Le mot vient du « chapel », la couronne de fleurs posée sur la tête ; « rosaire » vient de la roseraie : une couronne de roses offerte à Marie.',
      'Avec Marie, on contemple la vie du Christ. Jean-Paul II disait du Rosaire qu’il est « un résumé de l’Évangile ».',
    ])
  })

  it('aucun guillemet ni deux-points n’échoue seul en début de ligne', () => {
    const textes = [
      CHAPELET_OU_ROSAIRE.titre,
      ...CHAPELET_OU_ROSAIRE.formes.map(([, suite]) => suite),
      ...CHAPELET_OU_ROSAIRE.paragraphes,
    ]
    for (const texte of textes) expect(texte).not.toMatch(/« | [»:;?]/)
  })
})

describe('Rosaire', () => {
  const brut = (texte: string) => texte.replace(/\u00a0/g, ' ').replace(/\u2060/g, '')

  // Texte validé mot à mot par le porteur du projet (phase 17, 2026-10-08).
  it('le passage de série, mot à mot, pour chacun des trois passages', () => {
    expect(
      (['lumineux', 'douloureux', 'glorieux'] as const).map((s) => brut(passageDeSerie(s))),
    ).toEqual([
      'Les mystères joyeux sont achevés. Viennent les mystères lumineux.',
      'Les mystères lumineux sont achevés. Viennent les mystères douloureux.',
      'Les mystères douloureux sont achevés. Viennent les mystères glorieux.',
    ])
  })

  it('le repère de la série en cours', () => {
    expect(repereSerie('joyeux')).toBe('Série 1 sur 4')
    expect(repereSerie('glorieux')).toBe('Série 4 sur 4')
  })
})

// Textes validés mot à mot par le porteur du projet (phase 18, 2026-10-09).
describe('chapelet simplifié', () => {
  const brut = (texte: string) => texte.replace(/\u00a0/g, ' ').replace(/\u2060/g, '')

  it('la partie « Aux intentions du Saint-Père » de la page d’aide', () => {
    expect(brut(AUX_INTENTIONS.titre)).toBe('Aux intentions du Saint-Père')
    expect(AUX_INTENTIONS.paragraphes.map(brut)).toEqual([
      'Prier aux intentions du Saint-Père, c’est s’unir à la prière du pape pour l’Église et pour le monde. Il n’est pas nécessaire de connaître ces intentions : on confie au Seigneur ce que le pape porte dans son cœur. Chaque mois, il en propose une en particulier, par son Réseau mondial de prière.',
      'Jean-Paul II y voyait un moyen « d’élargir le regard de celui qui prie aux vastes horizons des nécessités ecclésiales ».',
      'C’est aussi l’une des conditions de l’indulgence que l’Église attache au chapelet, c’est-à-dire la remise de la peine encore due pour des péchés déjà pardonnés. Dit à l’église, en famille ou en communauté, le chapelet peut obtenir l’indulgence plénière, avec la confession, la communion et le refus de tout attachement au péché. Ailleurs, l’indulgence est partielle.',
    ])
    for (const texte of AUX_INTENTIONS.paragraphes) expect(texte).not.toMatch(/« | [»:;?]/)
  })

  it('« L’essentiel seulement », son aide et l’avis de la page des prières', () => {
    expect(ESSENTIEL.libelle).toBe('L’essentiel seulement')
    const suite =
      ' : l’annonce du mystère, un Notre Père, dix Je vous salue Marie, un Gloire au Père.'
    expect(brut(ESSENTIEL.aide.chapelet)).toBe(`Le signe de croix, puis les cinq dizaines${suite}`)
    expect(brut(ESSENTIEL.aide.rosaire)).toBe(`Le signe de croix, puis les vingt dizaines${suite}`)
    expect(brut(ESSENTIEL.aide.commune)).toBe(`Le signe de croix, puis les dizaines${suite}`)
    expect(ESSENTIEL.active).toBe('L’essentiel seulement est activé.')
    expect(FACULTATIF).toBe('facultatif')
    expect(PRIERE_SAINT_PERE).toBe('Prière aux intentions du Saint-Père')
  })
})
