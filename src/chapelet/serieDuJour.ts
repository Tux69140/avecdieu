import { SERIES, type SerieId } from '../recueil/mysteres'

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

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

// « Le lundi et le samedi » : les jours où la série revient, du lundi au dimanche.
export function joursDeLaSerie(serie: SerieId): string {
  const jours = [1, 2, 3, 4, 5, 6, 0]
    .filter((jour) => SERIE_PAR_JOUR[jour] === serie)
    .map((jour) => `le ${JOURS[jour]}`)
  const phrase = jours.join(' et ')
  return phrase.charAt(0).toUpperCase() + phrase.slice(1)
}

// Une série du recueil : une adresse peut en nommer une inconnue (seules les
// propriétés propres comptent, toString n'en est pas une).
export const estSerie = (valeur: string): valeur is SerieId => Object.hasOwn(SERIES, valeur)
