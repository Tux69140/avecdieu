import { CENTRE_FRANCE, type Lieu } from '../office/soleil'
import { ecrireEtSignaler, lireObjet, RACINE } from '../reglages/stockage'

// Le lieu des heures solaires (phase 12), saisi une fois : une ville de la
// liste embarquée, ou la position du GPS rattachée à la ville la plus proche.
// Il ne quitte jamais le téléphone et n'est jamais écrit dans un journal.

export interface LieuChoisi extends Lieu {
  // « Lyon » : la ville choisie, ou la plus proche de la position du GPS.
  nom: string
  // Trouvé par le GPS : « Près de Lyon ».
  pres: boolean
}

export interface ReglagesLieu {
  lieu?: LieuChoisi
  // Actualiser la position à chaque ouverture (US-45), désactivé d'origine.
  actualiser: boolean
}

const CLE = `${RACINE}lieu`

// Signalé à la page : les heures et les rappels se recalculent.
export const LIEU_CHANGE = 'avec-dieu:lieu-change'

const estNombre = (v: unknown, borne: number): v is number =>
  typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= borne

function lireLieuChoisi(v: unknown): LieuChoisi | undefined {
  if (typeof v !== 'object' || v === null) return undefined
  const { nom, pres, latitude, longitude } = v as Record<string, unknown>
  if (typeof nom !== 'string' || !estNombre(latitude, 90) || !estNombre(longitude, 180))
    return undefined
  return { nom, pres: pres === true, latitude, longitude }
}

export function lireLieu(): ReglagesLieu {
  const { lieu, actualiser } = lireObjet(CLE)
  const lu = lireLieuChoisi(lieu)
  return { ...(lu && { lieu: lu }), actualiser: actualiser === true }
}

function enregistrer(reglages: ReglagesLieu) {
  ecrireEtSignaler(CLE, reglages, LIEU_CHANGE)
}

export function choisirLieu(lieu: LieuChoisi) {
  enregistrer({ ...lireLieu(), lieu })
}

export function changerActualisation(actualiser: boolean) {
  enregistrer({ ...lireLieu(), actualiser })
}

// Le lieu du lever et du coucher : celui du priant s'il l'a donné, sinon le
// centre de la France (cadran et thème nuit, dès la phase 8).
export function lieuDuSoleil(): Lieu {
  const { lieu } = lireLieu()
  return lieu ? { latitude: lieu.latitude, longitude: lieu.longitude } : CENTRE_FRANCE
}

export const nommerLieu = ({ nom, pres }: LieuChoisi) => (pres ? `Près de ${nom}` : nom)

const RAYON_TERRE = 6371
const rad = Math.PI / 180

// Distance du grand cercle (haversine).
export function distanceEnKm(a: Lieu, b: Lieu): number {
  const dLat = (b.latitude - a.latitude) * rad
  const dLon = (b.longitude - a.longitude) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2
  return 2 * RAYON_TERRE * Math.asin(Math.sqrt(h))
}

// Au-delà de 50 km, le lever se décale de quelques minutes : on recalcule
// (PRD). En deçà, rien ne change.
const DISTANCE_DE_VOYAGE = 50

export const deplacementNotable = (avant: Lieu, apres: Lieu) =>
  distanceEnKm(avant, apres) > DISTANCE_DE_VOYAGE
