import { estObjet } from '../reglages/stockage'

// Une heure du jour, à l'horloge du téléphone, et ses conversions : les
// écrans comptent en minutes depuis minuit, les réglages retiennent des heures.
export interface Heure {
  heures: number
  minutes: number
}

const MINUTE = 60_000

export const enMinutes = ({ heures, minutes }: Heure) => heures * 60 + minutes

// Des minutes depuis minuit, entières : à qui en a de fractionnaires de les
// arrondir d'abord.
export const versHeure = (minutes: number): Heure => ({
  heures: Math.floor(minutes / 60),
  minutes: minutes % 60,
})

// Minutes écoulées depuis minuit, à l'heure du téléphone (heure d'été comprise).
export const minutesDe = (date: Date) => date.getHours() * 60 + date.getMinutes()

// À la minute la plus proche : 7 h 52 min 30 s donne 7 h 53.
export const arrondirALaMinute = (date: Date) =>
  new Date(Math.round(date.getTime() / MINUTE) * MINUTE)

// Une heure enregistrée, reprise seulement si elle en est bien une.
export function lireHeure(valeur: unknown): Heure | undefined {
  if (!estObjet(valeur)) return undefined
  const { heures, minutes } = valeur
  const valide = (n: unknown, max: number): n is number =>
    typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < max
  return valide(heures, 24) && valide(minutes, 60) ? { heures, minutes } : undefined
}

// « 7 h », « 18 h 30 ».
export function ecrireHeure({ heures, minutes }: Heure): string {
  return minutes === 0 ? `${heures} h` : `${heures} h ${String(minutes).padStart(2, '0')}`
}
