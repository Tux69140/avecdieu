// Les zones liturgiques de l'AELF, chacune avec le calendrier propre de son
// pays (documentation de l'API, https://api.aelf.org/). France par défaut ;
// « romain » : le calendrier général de toute l'Église.
export const ZONES = {
  france: 'France',
  afrique: 'Afrique',
  belgique: 'Belgique',
  canada: 'Canada',
  luxembourg: 'Luxembourg',
  monaco: 'Monaco',
  suisse: 'Suisse',
  romain: 'Calendrier romain général',
} as const

export type Zone = keyof typeof ZONES

export const estZone = (valeur: unknown): valeur is Zone =>
  typeof valeur === 'string' && Object.hasOwn(ZONES, valeur)
