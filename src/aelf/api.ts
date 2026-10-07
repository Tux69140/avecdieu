import type { JourLiturgique, NomOffice, Office } from '../office/modele'
import { ABSENT, enregistrer, lireEnregistre, oublier, ZONE, type Ressource } from './cache'
import { lireJour, lireOffice } from './office'

// Le seul endroit de l'app qui parle au réseau, et seulement à l'AELF : rien
// d'autre ne quitte le téléphone que la date et l'office demandés. Ce qui est
// déjà enregistré se lit sur le téléphone, même avec du réseau (phase 9).
const RACINE = 'https://api.aelf.org/v1'

// Toute panne (réseau absent, AELF muette ou réponse illisible) devient cette
// erreur. « absent » : l'AELF répond, mais ne propose pas cet office ce jour-là
// (l'office des lectures du dimanche de Pâques, que remplace la Vigile pascale).
export class ErreurAelf extends Error {
  name = 'ErreurAelf'
  absent = false
}

const officeAbsent = () =>
  Object.assign(new ErreurAelf('Office absent de l’AELF'), { absent: true })

// La réponse brute de l'AELF pour une ressource (un office, ou « informations »).
async function demander(ressource: Ressource, date: string): Promise<unknown> {
  try {
    const http = await fetch(`${RACINE}/${ressource}/${date}/${ZONE}`, {
      headers: { Accept: 'application/json' },
    })
    if (http.status === 404) return ABSENT
    if (!http.ok) throw new ErreurAelf(`L’AELF a répondu ${http.status}`)
    return await http.json()
  } catch (erreur) {
    throw erreur instanceof ErreurAelf
      ? erreur
      : new ErreurAelf('AELF injoignable', { cause: erreur })
  }
}

// Une seule demande à la fois par ressource et par jour : l'écran ouvert et
// la réserve des jours à venir se partagent la même réponse.
const enCours = new Map<string, Promise<unknown>>()

function demanderUneFois(ressource: Ressource, date: string): Promise<unknown> {
  const cle = `${ressource}/${date}`
  let demande = enCours.get(cle)
  if (!demande) {
    demande = demander(ressource, date).finally(() => enCours.delete(cle))
    enCours.set(cle, demande)
  }
  return demande
}

// La ressource lue par `lire`, depuis le téléphone ou, à défaut, l'AELF. Une
// réponse n'est enregistrée qu'une fois lue sans erreur ; une entrée devenue
// illisible est oubliée et redemandée.
async function obtenir<T>(
  ressource: Ressource,
  date: string,
  lire: (reponse: unknown) => T,
): Promise<T> {
  const enregistre = lireEnregistre(ressource, date)
  if (enregistre === ABSENT) throw officeAbsent()
  if (enregistre !== undefined) {
    try {
      return lire(enregistre)
    } catch {
      oublier(ressource, date)
    }
  }
  const reponse = await demanderUneFois(ressource, date)
  if (reponse === ABSENT) {
    enregistrer(ressource, date, ABSENT)
    throw officeAbsent()
  }
  let lu: T
  try {
    lu = lire(reponse)
  } catch (erreur) {
    throw new ErreurAelf('Réponse AELF illisible', { cause: erreur })
  }
  enregistrer(ressource, date, reponse)
  return lu
}

// Un écran quitté n'attend plus la réponse, qui sert tout de même à la réserve.
function abandonnable<T>(promesse: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promesse
  return new Promise((resoudre, rejeter) => {
    const abandon = () => rejeter(new DOMException('Abandon', 'AbortError'))
    if (signal.aborted) return abandon()
    signal.addEventListener('abort', abandon, { once: true })
    promesse.then(resoudre, rejeter)
  })
}

const informationsDe = (reponse: unknown): unknown =>
  typeof reponse === 'object' && reponse !== null
    ? (reponse as { informations?: unknown }).informations
    : undefined

export interface OfficeDuJour {
  office: Office
  jour: JourLiturgique
}

export function chargerOffice(
  nom: NomOffice,
  date: string,
  signal?: AbortSignal,
): Promise<OfficeDuJour> {
  const lire = (reponse: unknown) => ({
    office: lireOffice(nom, date, reponse),
    jour: lireJour(informationsDe(reponse)),
  })
  return abandonnable(obtenir(nom, date, lire), signal)
}

// Le jour liturgique seul, pour l'accueil : date, temps, fête, couleur.
export function chargerJour(date: string, signal?: AbortSignal): Promise<JourLiturgique> {
  const lire = (reponse: unknown) => {
    const jour = lireJour(informationsDe(reponse))
    if (jour.date !== date) throw new Error('Jour liturgique d’une autre date')
    return jour
  }
  return abandonnable(obtenir('informations', date, lire), signal)
}
