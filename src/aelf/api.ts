import type { JourLiturgique, NomOffice, Office } from '../office/modele'
import { lireJour, lireOffice } from './office'

// Le seul endroit de l'app qui parle au réseau, et seulement à l'AELF : rien
// d'autre ne quitte le téléphone que la date et l'office demandés.
const RACINE = 'https://api.aelf.org/v1'
const ZONE = 'france'

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
async function demander(ressource: string, date: string, signal?: AbortSignal): Promise<unknown> {
  try {
    const http = await fetch(`${RACINE}/${ressource}/${date}/${ZONE}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
    if (http.status === 404) throw officeAbsent()
    if (!http.ok) throw new ErreurAelf(`L’AELF a répondu ${http.status}`)
    return await http.json()
  } catch (erreur) {
    // Un abandon voulu (écran quitté) n'est pas une panne.
    if (signal?.aborted) throw erreur
    throw erreur instanceof ErreurAelf
      ? erreur
      : new ErreurAelf('AELF injoignable', { cause: erreur })
  }
}

const informationsDe = (reponse: unknown): unknown =>
  typeof reponse === 'object' && reponse !== null
    ? (reponse as { informations?: unknown }).informations
    : undefined

export interface OfficeDuJour {
  office: Office
  jour: JourLiturgique
}

export async function chargerOffice(
  nom: NomOffice,
  date: string,
  signal?: AbortSignal,
): Promise<OfficeDuJour> {
  const reponse = await demander(nom, date, signal)
  try {
    const office = lireOffice(nom, date, reponse)
    const jour = lireJour(informationsDe(reponse))
    return { office, jour }
  } catch (erreur) {
    throw new ErreurAelf('Réponse AELF illisible', { cause: erreur })
  }
}

// Le jour liturgique seul, pour l'accueil : date, temps, fête, couleur.
export async function chargerJour(date: string, signal?: AbortSignal): Promise<JourLiturgique> {
  const informations = informationsDe(await demander('informations', date, signal))
  const jour = lireJour(informations)
  if (jour.date !== date) throw new ErreurAelf('Réponse AELF illisible')
  return jour
}
