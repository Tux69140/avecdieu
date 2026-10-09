import type { NomOffice } from './modele'

// Combien de temps prendre pour chaque prière, affiché sur le seuil du
// chapelet, l'accueil et le menu (US-59). Des durées fixes et approximatives,
// pas un calcul : elles seront affinées à l'usage (PRD, « Durées affichées »,
// 2026-10-08).
export type PriereMinutee = NomOffice | 'chapelet' | 'rosaire'

export interface Duree {
  minutes: number
  // « ~ » à l'œil, « environ » à l'oreille.
  environ: boolean
}

const environ = (minutes: number): Duree => ({ minutes, environ: true })

export const DUREES: Record<PriereMinutee, Duree> = {
  chapelet: { minutes: 20, environ: false },
  rosaire: environ(105),
  lectures: environ(20),
  laudes: environ(20),
  tierce: environ(10),
  sexte: environ(10),
  none: environ(10),
  vepres: environ(20),
  complies: environ(15),
}

// Avec « L’essentiel seulement », le chapelet et le Rosaire sans les prières
// d'usage (phase 18, 2026-10-09).
const DUREES_ESSENTIEL: Partial<Record<PriereMinutee, Duree>> = {
  chapelet: environ(15),
  rosaire: environ(75),
}

const dureeDe = (priere: PriereMinutee, essentiel: boolean) =>
  (essentiel && DUREES_ESSENTIEL[priere]) || DUREES[priere]

// « 20 min », « ~20 min », « ~1 h 45 » : court, pour tenir sur la ligne.
export function ecrireDuree(priere: PriereMinutee, essentiel = false): string {
  const { minutes, environ } = dureeDe(priere, essentiel)
  const h = Math.floor(minutes / 60)
  const min = minutes % 60
  const texte =
    h === 0 ? `${min} min` : min === 0 ? `${h} h` : `${h} h ${String(min).padStart(2, '0')}`
  return environ ? `~${texte}` : texte
}

// Ce que dit le lecteur d'écran, qui lirait « tilde » et « min » :
// « environ vingt minutes », « environ une heure quarante-cinq ».
export function direDuree(priere: PriereMinutee, essentiel = false): string {
  const { minutes, environ } = dureeDe(priere, essentiel)
  const h = Math.floor(minutes / 60)
  const min = minutes % 60
  const enLettres = (n: number) => (n === 1 ? 'une' : nombreEnLettres(n))
  const texte =
    h === 0
      ? `${enLettres(min)} minute${min > 1 ? 's' : ''}`
      : `${enLettres(h)} heure${h > 1 ? 's' : ''}${min ? ` ${enLettres(min)}` : ''}`
  return environ ? `environ ${texte}` : texte
}

const UNITES = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
]
const DIZAINES = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante']

// De 1 à 59, assez pour des minutes et des heures de prière.
export function nombreEnLettres(n: number): string {
  if (n <= 16) return UNITES[n]
  const dizaine = DIZAINES[Math.floor(n / 10)]
  const unite = n % 10
  if (unite === 0) return dizaine
  return unite === 1 ? `${dizaine} et un` : `${dizaine}-${UNITES[unite]}`
}
