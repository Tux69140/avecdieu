import type { SerieId } from '../recueil/mysteres'
import { ROSAIRE } from './definition'
import { insecables } from './typographie'

// « Premier mystère », « Deuxième mystère »… : rang de la dizaine, de 1 à 5.
export const ORDINAUX = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième']

// Partagée entre le seuil et l'écran des réglages ; dit ce que l'écran montre
// à plusieurs (texte validé par le porteur du projet, 2026-10-08).
export const AIDE_PLUSIEURS =
  '℣ celui qui mène, ℟ ceux qui répondent ; en gras, ce que disent tous.'

// La page « Chapelet ou Rosaire ? », ouverte du seuil : pour le novice, ce qui
// les distingue, puis l'histoire et le sens. Texte validé mot à mot par le
// porteur du projet (phase 17, 2026-10-08) ; la dernière citation vient de
// Rosarium Virginis Mariae, 18-19. Ce n'est pas un texte sacré.
export const CHAPELET_OU_ROSAIRE = {
  titre: insecables('Chapelet ou Rosaire ?'),
  formes: [
    ['Chapelet', insecables(' : cinq dizaines, la série de mystères du jour.')],
    [
      'Rosaire',
      insecables(
        ' : vingt dizaines, les quatre séries à la suite. On peut s’arrêter entre deux séries et reprendre plus tard dans la journée. La puissance spirituelle XXL.',
      ),
    ],
  ],
  paragraphes: [
    'Le Rosaire est né au Moyen Âge. Ceux qui ne savaient pas lire les 150 psaumes disaient à la place 150 Je vous salue Marie : on l’appela le « psautier de Marie ». La tradition l’attribue à saint Dominique, et les dominicains l’ont répandu. En 1569, saint Pie V en fixe la forme : quinze dizaines, en mystères joyeux, douloureux et glorieux. En 2002, saint Jean-Paul II ajoute les mystères lumineux, ceux de la vie publique de Jésus.',
    'Le chapelet en est le quart. En priant chaque jour la série du jour, on parcourt tout le Rosaire dans la semaine. Le mot vient du « chapel », la couronne de fleurs posée sur la tête ; « rosaire » vient de la roseraie : une couronne de roses offerte à Marie.',
    'Avec Marie, on contemple la vie du Christ. Jean-Paul II disait du Rosaire qu’il est « un résumé de l’Évangile ».',
  ].map(insecables),
} as const

// Partagée entre le seuil et l'écran des réglages ; « Coupez-les » ne se
// coupe pas en fin de ligne.
export const AIDE_VIBRATIONS = insecables(
  'Une courte à chaque grain, une plus marquée à chaque dizaine. Coupez-les pour prier en silence.',
)

// Au Rosaire, le rang de la série dans l'ordre joyeux, lumineux, douloureux,
// glorieux, de 1 à 4.
const SERIES_DU_ROSAIRE = ROSAIRE.series ?? []
export const rangDeSerie = (serie: SerieId) => SERIES_DU_ROSAIRE.indexOf(serie) + 1

// La ligne en rouge qui ouvre les séries 2 à 4 du Rosaire (texte validé mot
// à mot par le porteur du projet, phase 17, 2026-10-08) : « Les mystères
// joyeux sont achevés. Viennent les mystères lumineux. » L'identifiant de la
// série est son adjectif.
export function passageDeSerie(vient: SerieId): string {
  const finie = SERIES_DU_ROSAIRE[rangDeSerie(vient) - 2]
  return insecables(`Les mystères ${finie} sont achevés. Viennent les mystères ${vient}.`)
}

// Le repère toujours visible pendant le Rosaire : « Série 2 sur 4 ».
export const repereSerie = (serie: SerieId) =>
  `Série ${rangDeSerie(serie)} sur ${SERIES_DU_ROSAIRE.length}`
