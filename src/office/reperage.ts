// Où en est le priant dans l'office (phase 7) : calculs purs, à partir des
// positions à l'écran que relève useReperage.

// La ligne de lecture, à un quart de l'espace lisible sous le bandeau. En fin
// d'office, elle descend jusqu'au bas de l'écran : les dernières étapes, trop
// courtes pour monter jusqu'à elle, ont aussi leur tour.
// `haut` : le bas du bandeau ; `hauteur` : celle de l'écran ; `reste` : ce
// qu'il reste à faire défiler.
export function ligneDeLecture(haut: number, hauteur: number, reste: number): number {
  const lisible = hauteur - haut
  const ligne = haut + lisible / 4
  const approche = (lisible * 3) / 4
  if (reste >= approche) return ligne
  return ligne + (hauteur - ligne) * (1 - reste / approche)
}

// L'étape en cours : la dernière dont le début a passé la ligne de lecture.
// `debuts` : la position à l'écran du début de chaque étape, dans l'ordre.
export function etapeALaLigne(debuts: readonly number[], ligne: number): number {
  let courante = 0
  debuts.forEach((debut, i) => {
    if (debut <= ligne) courante = i
  })
  return courante
}

export type EtatDePerle = 'dite' | 'courante' | 'a-venir'

export const etatDePerle = (i: number, courante: number): EtatDePerle =>
  i < courante ? 'dite' : i === courante ? 'courante' : 'a-venir'
