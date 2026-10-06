import type { JourLiturgique, NomOffice, Office } from '../office/modele'
import { lireJour, lireOffice } from './office'

// Le seul endroit de l'app qui parle au réseau, et seulement à l'AELF : rien
// d'autre ne quitte le téléphone que la date et l'office demandés.
const RACINE = 'https://api.aelf.org/v1'
const ZONE = 'france'

// Toute panne (réseau absent, AELF muette ou réponse illisible) devient cette
// erreur : l'écran n'a qu'un message à afficher.
export class ErreurAelf extends Error {
  name = 'ErreurAelf'
}

export interface OfficeDuJour {
  office: Office
  jour: JourLiturgique
}

export async function chargerOffice(
  nom: NomOffice,
  date: string,
  signal?: AbortSignal,
): Promise<OfficeDuJour> {
  let reponse: unknown
  try {
    const http = await fetch(`${RACINE}/${nom}/${date}/${ZONE}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
    if (!http.ok) throw new ErreurAelf(`L’AELF a répondu ${http.status}`)
    reponse = await http.json()
  } catch (erreur) {
    // Un abandon voulu (écran quitté) n'est pas une panne.
    if (signal?.aborted) throw erreur
    throw erreur instanceof ErreurAelf
      ? erreur
      : new ErreurAelf('AELF injoignable', { cause: erreur })
  }
  try {
    const office = lireOffice(nom, date, reponse)
    const jour = lireJour((reponse as { informations?: unknown }).informations)
    return { office, jour }
  } catch (erreur) {
    throw new ErreurAelf('Réponse AELF illisible', { cause: erreur })
  }
}
