import { registerPlugin } from '@capacitor/core'
import type { Canal } from '../rappels/programme'
import type { Cloche, Son } from '../rappels/reglages'
import { telephoneSimule } from './simulation'

// Les sons des rappels et les réglages d'Android, par le greffon propre à
// l'app (android/…/Sonnerie.java). Dans un navigateur, les cloches s'écoutent
// depuis public/sons/ et le reste est simulé (./simulation.ts).

type SonNatif =
  { sorte: 'cloche'; cloche: Cloche } | { sorte: 'telephone' } | { sorte: 'mp3'; uri: string }

export type Fabricant = 'xiaomi' | 'samsung' | 'autre'

// Ce qui, en plus des notifications, peut empêcher un rappel d'arriver :
// l'économie de batterie, l'arrière-plan restreint, et chez Xiaomi le
// démarrage automatique (absent quand on ne sait pas le lire).
export interface Blocages {
  batterie: boolean
  arrierePlan: boolean
  demarrage?: boolean
}

interface GreffonSonnerie {
  creerCanal(o: { id: string; nom: string; son: SonNatif; vibreur: boolean }): Promise<void>
  supprimerCanaux(o: { garder: string[] }): Promise<void>
  choisirMp3(): Promise<{ uri?: string; nom?: string }>
  ecouter(o: { son: SonNatif }): Promise<void>
  arreterEcoute(): Promise<void>
  fabricant(): Promise<{ fabricant: Fabricant }>
  ouvrirFicheApp(): Promise<void>
  blocages(): Promise<Blocages>
  ouvrirDemarrageAutomatique(): Promise<void>
  ouvrirReglagesNotifications(): Promise<void>
}

// Le fichier de chaque cloche dans public/sons/.
const fichier = (cloche: Cloche) => `/sons/${cloche.replaceAll('_', '-')}.mp3`

let lecture: HTMLAudioElement | undefined

const Sonnerie = registerPlugin<GreffonSonnerie>('Sonnerie', {
  web: {
    creerCanal: async ({ id }: { id: string }) => {
      const telephone = telephoneSimule()
      if (!telephone.canaux.includes(id)) telephone.canaux.push(id)
    },
    supprimerCanaux: async ({ garder }: { garder: string[] }) => {
      const telephone = telephoneSimule()
      telephone.canaux = telephone.canaux.filter((id) => garder.includes(id))
    },
    choisirMp3: async () => {
      telephoneSimule().journal.push('choisir un MP3')
      return { uri: 'content://media/simule/1', nom: 'Mon MP3.mp3' }
    },
    ecouter: async ({ son }: { son: SonNatif }) => {
      telephoneSimule().journal.push(`écouter ${son.sorte === 'cloche' ? son.cloche : son.sorte}`)
      lecture?.pause()
      if (son.sorte !== 'cloche') return
      lecture = new Audio(fichier(son.cloche))
      await lecture.play().catch(() => {})
    },
    arreterEcoute: async () => {
      lecture?.pause()
      lecture = undefined
    },
    fabricant: async () => ({ fabricant: telephoneSimule().fabricant }),
    ouvrirFicheApp: async () => {
      telephoneSimule().journal.push('fiche de l’app')
    },
    ouvrirReglagesNotifications: async () => {
      telephoneSimule().journal.push('réglages des notifications')
    },
    blocages: async () => telephoneSimule().blocages,
    ouvrirDemarrageAutomatique: async () => {
      telephoneSimule().journal.push('démarrage automatique')
    },
  },
})

const versNatif = (son: Son): SonNatif =>
  son.sorte === 'mp3' ? { sorte: 'mp3', uri: son.uri } : son

export const creerCanal = ({ id, nom, son, vibreur }: Canal) =>
  Sonnerie.creerCanal({ id, nom, son: versNatif(son), vibreur })

export const supprimerCanaux = (garder: string[]) => Sonnerie.supprimerCanaux({ garder })

// Le MP3 choisi sur le téléphone, ou rien si le priant renonce.
export async function choisirMp3(): Promise<Son | undefined> {
  const { uri, nom } = await Sonnerie.choisirMp3().catch(() => ({ uri: undefined, nom: undefined }))
  return uri ? { sorte: 'mp3', uri, nom: nom ?? 'MP3' } : undefined
}

export const ecouter = (son: Son) => Sonnerie.ecouter({ son: versNatif(son) }).catch(() => {})
export const arreterEcoute = () => Sonnerie.arreterEcoute().catch(() => {})

// Dans le doute, une autre marque : pas de guide.
export const fabricant = (): Promise<Fabricant> =>
  Sonnerie.fabricant()
    .then(({ fabricant }) => fabricant)
    .catch(() => 'autre' as const)

export const ouvrirFicheApp = () => Sonnerie.ouvrirFicheApp().catch(() => {})
export const ouvrirReglagesNotifications = () =>
  Sonnerie.ouvrirReglagesNotifications().catch(() => {})

// Dans le doute, rien ne bloque : on ne prévient pas sans savoir.
export const blocages = (): Promise<Blocages> =>
  Sonnerie.blocages().catch(() => ({ batterie: false, arrierePlan: false }))

export const ouvrirDemarrageAutomatique = () =>
  Sonnerie.ouvrirDemarrageAutomatique().catch(() => {})
