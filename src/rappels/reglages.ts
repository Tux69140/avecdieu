import { lireHeure, type Heure } from '../office/heure'
import { OFFICES, type NomOffice } from '../office/modele'
import { ecrireEtSignaler, estObjet, lireObjet, RACINE } from '../reglages/stockage'

// Les rappels du priant (phase 11) : pour chaque office et pour le chapelet,
// s'il est rappelé, à quelle heure, avec quel son. Décisions du porteur du
// projet (2026-10-07) : app muette par défaut, heures du PRD, une cloche
// d'origine selon l'heure, vibreur activé.

export type Priere = NomOffice | 'chapelet'

// Dans l'ordre du jour, comme la page Réglages › Rappels les présente.
export const PRIERES_RAPPELEES: readonly Priere[] = [...OFFICES, 'chapelet']

// Mêmes noms que les sons de res/raw dans l'APK.
export type Cloche = 'bourdon_notre_dame' | 'cloche_marcel' | 'angelus_village'
export const CLOCHES: readonly Cloche[] = ['bourdon_notre_dame', 'cloche_marcel', 'angelus_village']

export const NOMS_CLOCHES: Record<Cloche, string> = {
  bourdon_notre_dame: 'Bourdon de Notre-Dame',
  cloche_marcel: 'Cloche Marcel',
  angelus_village: 'Angélus de village',
}

// Le MP3 choisi sur le téléphone : son adresse durable et le nom du fichier.
export type Son =
  | { sorte: 'cloche'; cloche: Cloche }
  | { sorte: 'telephone' }
  | { sorte: 'mp3'; uri: string; nom: string }

export interface Rappel {
  actif: boolean
  // Absente pour l'office des lectures tant que le priant n'en a pas choisi une.
  heure?: Heure
  son: Son
  vibreur: boolean
}

export type Rappels = Record<Priere, Rappel>

// Ce que l'app a déjà demandé une fois, pour ne pas le redemander.
export interface Demandes {
  // « A la minute près » : l'autorisation « Alarmes et rappels ».
  minute: boolean
  // Le guide de batterie, sur Xiaomi et Samsung.
  batterie: boolean
  // Le démarrage automatique, sur Xiaomi.
  demarrage: boolean
}

const cloche = (cloche: Cloche): Son => ({ sorte: 'cloche', cloche })
const rappel = (heure: Heure | undefined, son: Cloche): Rappel => ({
  actif: false,
  heure,
  son: cloche(son),
  vibreur: true,
})

// Heures du PRD ; cloche claire le matin, l'angélus pour les petites heures et
// le chapelet, le bourdon le soir (choix du porteur du projet, 2026-10-07).
export const RAPPELS_PAR_DEFAUT: Rappels = {
  lectures: rappel(undefined, 'cloche_marcel'),
  laudes: rappel({ heures: 7, minutes: 0 }, 'cloche_marcel'),
  tierce: rappel({ heures: 9, minutes: 0 }, 'angelus_village'),
  sexte: rappel({ heures: 12, minutes: 0 }, 'angelus_village'),
  none: rappel({ heures: 15, minutes: 0 }, 'angelus_village'),
  vepres: rappel({ heures: 18, minutes: 30 }, 'bourdon_notre_dame'),
  complies: rappel({ heures: 21, minutes: 30 }, 'bourdon_notre_dame'),
  chapelet: rappel({ heures: 20, minutes: 0 }, 'angelus_village'),
}

// L'heure que l'office des lectures propose quand on active son rappel.
export const HEURE_PROPOSEE_LECTURES: Heure = { heures: 6, minutes: 30 }

const CLE = `${RACINE}rappels`

const lireSon = (v: unknown): Son | undefined => {
  if (!estObjet(v)) return undefined
  if (v.sorte === 'telephone') return { sorte: 'telephone' }
  if (v.sorte === 'cloche' && CLOCHES.includes(v.cloche as Cloche))
    return cloche(v.cloche as Cloche)
  if (v.sorte === 'mp3' && typeof v.uri === 'string' && typeof v.nom === 'string')
    return { sorte: 'mp3', uri: v.uri, nom: v.nom }
  return undefined
}

// Chaque valeur enregistrée n'est reprise que si elle a le bon type.
export function lireRappels(): Rappels {
  const enregistres = lireObjet(CLE)
  const rappels = {} as Rappels
  for (const priere of PRIERES_RAPPELEES) {
    const defaut = RAPPELS_PAR_DEFAUT[priere]
    const lu = enregistres[priere]
    if (!estObjet(lu)) {
      rappels[priere] = { ...defaut }
      continue
    }
    rappels[priere] = {
      actif: typeof lu.actif === 'boolean' ? lu.actif : defaut.actif,
      heure: 'heure' in lu ? (lireHeure(lu.heure) ?? defaut.heure) : defaut.heure,
      son: lireSon(lu.son) ?? defaut.son,
      vibreur: typeof lu.vibreur === 'boolean' ? lu.vibreur : defaut.vibreur,
    }
    // Un office sans heure ne peut pas être rappelé.
    if (!rappels[priere].heure) rappels[priere].actif = false
  }
  return rappels
}

export function lireDemandes(): Demandes {
  const { demandes } = lireObjet(CLE)
  const lues = estObjet(demandes) ? demandes : {}
  return {
    minute: lues.minute === true,
    batterie: lues.batterie === true,
    demarrage: lues.demarrage === true,
  }
}

// Signalé à la page : les rappels se reprogramment, l'accueil suit les heures.
export const RAPPELS_CHANGES = 'avec-dieu:rappels-changes'

function enregistrer(rappels: Rappels, demandes: Demandes) {
  ecrireEtSignaler(CLE, { ...rappels, demandes }, RAPPELS_CHANGES)
}

export function modifierRappel(priere: Priere, changement: Partial<Rappel>): Rappels {
  const rappels = lireRappels()
  rappels[priere] = { ...rappels[priere], ...changement }
  enregistrer(rappels, lireDemandes())
  return rappels
}

export function noterDemande(demande: keyof Demandes) {
  enregistrer(lireRappels(), { ...lireDemandes(), [demande]: true })
}

export const aucunRappelActif = (rappels: Rappels) =>
  PRIERES_RAPPELEES.every((priere) => !rappels[priere].actif)
