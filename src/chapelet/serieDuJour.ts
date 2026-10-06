import type { SerieId } from '../recueil/mysteres'

// Indexé par Date.getDay() : 0 = dimanche.
const SERIE_PAR_JOUR: SerieId[] = [
  'glorieux',
  'joyeux',
  'douloureux',
  'glorieux',
  'lumineux',
  'douloureux',
  'joyeux',
]

export function serieDuJour(date: Date): SerieId {
  return SERIE_PAR_JOUR[date.getDay()]
}
