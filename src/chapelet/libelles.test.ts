import { describe, expect, it } from 'vitest'
import { AIDE_VIBRATIONS, CHAPELET_OU_ROSAIRE } from './libelles'

describe('AIDE_VIBRATIONS', () => {
  // Un mot composé ne se coupe pas en fin de ligne (2026-10-08).
  it('« Coupez-les » ne se coupe pas à son trait d’union', () => {
    expect(AIDE_VIBRATIONS).toContain('Coupez-\u2060les')
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
