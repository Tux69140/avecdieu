// Hors de l'APK (navigateur, parcours Playwright), le téléphone est simulé :
// ni notification ni réglage d'Android, mais un état que les parcours règlent
// avant l'ouverture (window.__telephoneInitial) et lisent ensuite
// (window.__telephone) pour vérifier ce que l'app a demandé.

export type Etat = 'granted' | 'denied' | 'prompt'

export interface NotificationSimulee {
  id: number
  titre: string
  texte: string
  quand: string
  route: string
  canal?: string
  exacte: boolean
}

export interface TelephoneSimule {
  // L'accord pour les notifications, et la réponse que le priant donnera.
  accord: Etat
  reponse: 'granted' | 'denied'
  // « Alarmes et rappels », et ce que le priant y fera s'il ouvre la page.
  exacte: boolean
  reponseExacte: boolean
  fabricant: 'xiaomi' | 'samsung' | 'autre'
  // Ce que le téléphone bloque en plus des notifications.
  blocages: { batterie: boolean; arrierePlan: boolean; demarrage?: boolean }
  programmees: NotificationSimulee[]
  affichees: { id: number; route: string }[]
  canaux: string[]
  journal: string[]
  // Un toucher sur une notification affichée.
  toucher: (route: string) => void
  ecouteurs: ((route: string) => void)[]
}

declare global {
  interface Window {
    __telephone?: TelephoneSimule
    __telephoneInitial?: Partial<TelephoneSimule>
  }
}

export function telephoneSimule(): TelephoneSimule {
  if (window.__telephone) return window.__telephone
  const telephone: TelephoneSimule = {
    accord: 'prompt',
    reponse: 'granted',
    exacte: true,
    reponseExacte: true,
    fabricant: 'autre',
    blocages: { batterie: false, arrierePlan: false },
    programmees: [],
    affichees: [],
    canaux: [],
    journal: [],
    ecouteurs: [],
    toucher: (route) => telephone.ecouteurs.forEach((ecouteur) => ecouteur(route)),
    ...window.__telephoneInitial,
  }
  window.__telephone = telephone
  return telephone
}
