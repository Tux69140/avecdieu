import type { Forme } from '../chapelet/reglages'
import { dateDuJour, decaler, enDate } from '../office/dates'
import type { Heure } from '../office/heures'
import { PRIERES_RAPPELEES, type Priere, type Rappel, type Rappels, type Son } from './reglages'

// L'heure de chaque prière un jour donné : fixe, ou selon le soleil (phase 12).
export type HeuresDuJour = (date: string) => Record<Priere, Heure | undefined>
import {
  nomDuSon,
  OUVERTURE_DES_HEURES,
  OUVERTURE_DU_CHAPELET,
  OUVERTURE_DU_JOUR,
  TITRE_ROSAIRE,
  TITRES_NOTIFICATIONS,
} from './textes'

// Les notifications des semaines à venir, calculées d'après les rappels :
// Android les garde et les déclenche même si l'app n'est pas ouverte (US-46).

// Environ un mois d'avance (PRD), au plus 8 × 31 = 248 alarmes : sous la
// limite de 500 que Samsung impose à chaque app.
export const JOURS_PROGRAMMES = 31

// Un canal Android par son et vibreur : le son appartient au canal et ne
// change plus une fois le canal créé.
export interface Canal {
  id: string
  nom: string
  son: Son
  vibreur: boolean
}

export interface NotificationPrevue {
  // Stable d'une programmation à l'autre : le jour et la prière.
  id: number
  priere: Priere
  date: string
  quand: Date
  titre: string
  texte: string
  route: string
  canal: string
}

// Un nombre court et stable pour une adresse de MP3, qui ne passe pas telle
// quelle dans un identifiant de canal.
const empreinteCourte = (texte: string) => {
  let h = 0
  for (const c of texte) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  return h.toString(36)
}

export function canalDe({ son, vibreur }: Rappel): Canal {
  const cle =
    son.sorte === 'cloche'
      ? son.cloche
      : son.sorte === 'telephone'
        ? 'telephone'
        : `mp3-${empreinteCourte(son.uri)}`
  return {
    id: `rappel-${cle}-${vibreur ? 'vibreur' : 'sans-vibreur'}`,
    nom: `Rappels · ${nomDuSon(son)} · ${vibreur ? 'vibreur' : 'sans vibreur'}`,
    son,
    vibreur,
  }
}

const enMinutes = ({ heures, minutes }: Heure) => heures * 60 + minutes

// Les heures réglées avec les rappels, les mêmes chaque jour.
const heuresFixes =
  (rappels: Rappels): HeuresDuJour =>
  () =>
    Object.fromEntries(
      PRIERES_RAPPELEES.map((p) => [p, rappels[p].heure]),
    ) as ReturnType<HeuresDuJour>

// R1 : le premier office du matin s'ouvre par « Seigneur, ouvre mes lèvres ».
// Les rappels étant prêts un mois d'avance, c'est le plus matinal des rappels
// actifs entre l'office des lectures et les laudes ; en mode solaire, il peut
// changer d'un jour à l'autre.
export function officeDuMatin(
  rappels: Rappels,
  heures = heuresFixes(rappels)(''),
): Priere | undefined {
  const candidats = (['lectures', 'laudes'] as const).filter(
    (priere) => rappels[priere].actif && heures[priere],
  )
  return candidats.sort((a, b) => enMinutes(heures[a]!) - enMinutes(heures[b]!))[0]
}

function texteDe(priere: Priere, matin: Priere | undefined) {
  if (priere === 'chapelet') return OUVERTURE_DU_CHAPELET
  return priere === matin ? OUVERTURE_DU_JOUR : OUVERTURE_DES_HEURES
}

// Jours écoulés depuis le 1er janvier 1970 : la base des identifiants.
const numeroDuJour = (date: string) => {
  const [a, m, j] = date.split('-').map(Number)
  return Date.UTC(a, m - 1, j) / 86_400_000
}

// Le rappel du chapelet annonce et ouvre le Rosaire quand il est retenu.
const titreDe = (priere: Priere, forme: Forme) =>
  priere === 'chapelet' && forme === 'rosaire' ? TITRE_ROSAIRE : TITRES_NOTIFICATIONS[priere]
const routeDe = (priere: Priere, date: string, forme: Forme) =>
  priere === 'chapelet' ? `/${forme}` : `/office/${priere}/${date}`

// Toutes les notifications à venir, de maintenant à JOURS_PROGRAMMES jours,
// à l'heure locale de chaque jour (heure d'été comprise).
export function programmer(
  rappels: Rappels,
  maintenant: Date,
  jours = JOURS_PROGRAMMES,
  heuresDuJour = heuresFixes(rappels),
  forme: Forme = 'chapelet',
): NotificationPrevue[] {
  const premier = dateDuJour(maintenant)
  const prevues: NotificationPrevue[] = []
  for (let n = 0; n < jours; n++) {
    const date = decaler(premier, n)
    const jour = enDate(date)
    const heures = heuresDuJour(date)
    const matin = officeDuMatin(rappels, heures)
    PRIERES_RAPPELEES.forEach((priere, rang) => {
      const rappel = rappels[priere]
      const heure = heures[priere]
      if (!rappel.actif || !heure) return
      const quand = new Date(jour)
      quand.setHours(heure.heures, heure.minutes, 0, 0)
      if (quand <= maintenant) return
      prevues.push({
        id: numeroDuJour(date) * 10 + rang,
        priere,
        date,
        quand,
        titre: titreDe(priere, forme),
        texte: texteDe(priere, matin),
        route: routeDe(priere, date, forme),
        canal: canalDe(rappel).id,
      })
    })
  }
  return prevues.sort((a, b) => a.quand.getTime() - b.quand.getTime())
}

// Les canaux dont les rappels actifs ont besoin, chacun une fois.
export function canauxNecessaires(rappels: Rappels): Canal[] {
  const canaux = new Map<string, Canal>()
  for (const priere of PRIERES_RAPPELEES) {
    const rappel = rappels[priere]
    if (!rappel.actif) continue
    const canal = canalDe(rappel)
    canaux.set(canal.id, canal)
  }
  return [...canaux.values()]
}
