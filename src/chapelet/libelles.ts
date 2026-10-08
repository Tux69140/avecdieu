// « Premier mystère », « Deuxième mystère »… : rang de la dizaine, de 1 à 5.
export const ORDINAUX = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième']

// Partagée entre le seuil et l'écran des réglages.
export const AIDE_VIBRATIONS =
  'Une courte à chaque grain, une plus marquée à chaque dizaine. Coupez-les pour prier en silence.'

// L'étiquette du seuil et du chapelet, sur la ligne de la croix. Trop longue
// pour un petit écran, elle se coupe après le point, jamais avant : espaces
// insécables partout ailleurs.
export function etiquetteDuChapelet(duJour: boolean, date: Date): string {
  const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const insecable = (texte: string) => texte.replaceAll(' ', ' ')
  return `${insecable(duJour ? 'Chapelet du jour ·' : 'Chapelet ·')} ${insecable(jour)}`
}
