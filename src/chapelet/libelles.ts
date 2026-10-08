import { insecables } from './typographie'

// « Premier mystère », « Deuxième mystère »… : rang de la dizaine, de 1 à 5.
export const ORDINAUX = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième']

// Partagée entre le seuil et l'écran des réglages ; dit ce que l'écran montre
// à plusieurs (texte validé par le porteur du projet, 2026-10-08).
export const AIDE_PLUSIEURS =
  '℣ celui qui mène, ℟ ceux qui répondent ; en gras, ce que disent tous.'

// Partagée entre le seuil et l'écran des réglages ; « Coupez-les » ne se
// coupe pas en fin de ligne.
export const AIDE_VIBRATIONS = insecables(
  'Une courte à chaque grain, une plus marquée à chaque dizaine. Coupez-les pour prier en silence.',
)
