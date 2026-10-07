import { lireReglages, modifierReglages, type Reglages } from '../chapelet/reglages'
import { dateDuJour, decaler } from '../office/dates'
import { chargerJour, chargerOffice, ErreurAelf } from './api'
import { contient, effacerAvant, etendue, oublierTout, RESSOURCES, type Ressource } from './cache'
import type { Zone } from './zones'

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

const ZONE_CHANGEE = 'avec-dieu:zone-changee'

// Une autre zone, un autre calendrier : les textes enregistrés sont oubliés,
// et la réserve se refait aussitôt pour la nouvelle zone.
export function changerDeZone(zone: Zone): Reglages {
  if (zone === lireReglages().zone) return lireReglages()
  const reglages = modifierReglages({ zone })
  oublierTout()
  window.dispatchEvent(new Event(ZONE_CHANGEE))
  return reglages
}

// À l'ouverture de l'app, chaque fois qu'elle revient au premier plan (une app
// laissée ouverte passe minuit), quand le réseau revient et quand la zone change.
export function entretenirReserve(): () => void {
  let enCours: Promise<void> | undefined
  // Demandée pendant qu'elle se fait : la réserve se refera juste après.
  let aRefaire = false
  const completer = () => {
    if (document.visibilityState === 'hidden') return
    if (enCours) {
      aRefaire = true
      return
    }
    enCours = completerReserve(dateDuJour()).finally(() => {
      enCours = undefined
      if (aRefaire) {
        aRefaire = false
        completer()
      }
    })
  }
  completer()
  const evenements = [
    [document, 'visibilitychange'],
    [window, 'online'],
    [window, ZONE_CHANGEE],
  ] as const
  for (const [cible, nom] of evenements) cible.addEventListener(nom, completer)
  return () => {
    for (const [cible, nom] of evenements) cible.removeEventListener(nom, completer)
  }
}
