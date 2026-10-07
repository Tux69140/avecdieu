import { dateDuJour, decaler } from '../office/dates'
import { chargerJour, chargerOffice, ErreurAelf } from './api'
import { contient, effacerAvant, etendue, RESSOURCES, type Ressource } from './cache'

// La réserve des textes pour prier sans réseau (phase 9, décisions du porteur
// du projet du 2026-10-07) : la veille, aujourd'hui et les 7 jours suivants.
const JOURS_D_AVANCE = 7
// Trois demandes à la fois : assez pour aller vite, sans accabler l'AELF.
const DEMANDES_SIMULTANEES = 3

// Dans l'ordre où l'on en a besoin : aujourd'hui d'abord, la veille en dernier.
export function joursAGarder(aujourdhui: string): string[] {
  const jours = Array.from({ length: JOURS_D_AVANCE + 1 }, (_, i) => decaler(aujourdhui, i))
  return [...jours, decaler(aujourdhui, -1)]
}

// Les jours qu'on peut prier sans réseau, pour les messages et les réglages.
export const textesEnregistres = () => etendue(dateDuJour())

const charger = (ressource: Ressource, date: string) =>
  ressource === 'informations' ? chargerJour(date) : chargerOffice(ressource, date)

// Demande à l'AELF ce qui manque, et seulement ce qui manque. À la première
// panne (pas de réseau, AELF muette), on s'arrête : inutile d'insister jusqu'à
// la prochaine ouverture. Les jours d'avant la veille ne sont effacés qu'une
// fois la réserve complète : sans réseau, ce sont peut-être les seuls textes.
export async function completerReserve(aujourdhui: string): Promise<void> {
  const manquants = joursAGarder(aujourdhui).flatMap((date) =>
    RESSOURCES.filter((r) => !contient(r, date)).map((r) => [r, date] as const),
  )
  let panne = false
  const suivant = async (): Promise<void> => {
    const tache = manquants.shift()
    if (!tache || panne) return
    try {
      await charger(...tache)
    } catch (erreur) {
      // Un office absent de l'AELF est enregistré comme tel : ce n'est pas une panne.
      if (!(erreur instanceof ErreurAelf && erreur.absent)) panne = true
    }
    return suivant()
  }
  await Promise.all(Array.from({ length: DEMANDES_SIMULTANEES }, suivant))
  if (!panne) effacerAvant(decaler(aujourdhui, -1))
}

// À l'ouverture de l'app, chaque fois qu'elle revient au premier plan (une app
// laissée ouverte passe minuit) et quand le réseau revient.
export function entretenirReserve(): () => void {
  let enCours: Promise<void> | undefined
  const completer = () => {
    if (enCours || document.visibilityState === 'hidden') return
    enCours = completerReserve(dateDuJour()).finally(() => (enCours = undefined))
  }
  completer()
  document.addEventListener('visibilitychange', completer)
  window.addEventListener('online', completer)
  return () => {
    document.removeEventListener('visibilitychange', completer)
    window.removeEventListener('online', completer)
  }
}
