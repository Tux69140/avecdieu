import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { NotificationPrevue } from '../rappels/programme'
import { telephoneSimule } from './simulation'

// Les notifications des rappels, par le greffon de Capacitor dans l'APK ;
// simulées dans un navigateur (./simulation.ts). Un échec d'Android ne doit
// jamais casser l'écran : chaque appel retombe sur une réponse prudente.

export type Accord = 'accorde' | 'a-demander' | 'refuse'

const natif = () => Capacitor.isNativePlatform()

const versAccord = (etat: string): Accord =>
  etat === 'granted' ? 'accorde' : etat === 'denied' ? 'refuse' : 'a-demander'

export async function accordNotifications(): Promise<Accord> {
  if (!natif()) return versAccord(telephoneSimule().accord)
  return LocalNotifications.checkPermissions()
    .then(({ display }) => versAccord(display))
    .catch(() => 'a-demander' as const)
}

// La fenêtre d'Android : « Autoriser Avec Dieu à envoyer des notifications ? »
export async function demanderAccord(): Promise<Accord> {
  if (!natif()) {
    const telephone = telephoneSimule()
    telephone.journal.push('demande d’accord')
    if (telephone.accord === 'prompt') telephone.accord = telephone.reponse
    return versAccord(telephone.accord)
  }
  return LocalNotifications.requestPermissions()
    .then(({ display }) => versAccord(display))
    .catch(() => 'refuse' as const)
}

// « Alarmes et rappels » : sans elle, Android peut retarder les rappels.
export async function minuteExacte(): Promise<boolean> {
  if (!natif()) return telephoneSimule().exacte
  return LocalNotifications.checkExactNotificationSetting()
    .then(({ exact_alarm }) => exact_alarm === 'granted')
    .catch(() => true)
}

// Ouvre la page d'Android ; la réponse est connue au retour dans l'app.
export async function ouvrirPageMinute(): Promise<boolean> {
  if (!natif()) {
    const telephone = telephoneSimule()
    telephone.journal.push('page « Alarmes et rappels »')
    telephone.exacte = telephone.reponseExacte
    return telephone.exacte
  }
  return LocalNotifications.changeExactNotificationSetting()
    .then(({ exact_alarm }) => exact_alarm === 'granted')
    .catch(() => false)
}

// Remplace toutes les notifications prévues par celles-ci.
export async function remplacerNotifications(prevues: NotificationPrevue[], exacte: boolean) {
  if (!natif()) {
    telephoneSimule().programmees = prevues.map((n) => ({
      id: n.id,
      titre: n.titre,
      texte: n.texte,
      quand: n.quand.toISOString(),
      route: n.route,
      canal: n.canal,
      exacte,
    }))
    return
  }
  const { notifications: anciennes } = await LocalNotifications.getPending().catch(() => ({
    notifications: [],
  }))
  if (anciennes.length > 0)
    await LocalNotifications.cancel({
      notifications: anciennes.map(({ id }) => ({ id })),
    }).catch(() => {})
  if (prevues.length === 0) return
  await LocalNotifications.schedule({
    notifications: prevues.map((n) => ({
      id: n.id,
      title: n.titre,
      body: n.texte,
      channelId: n.canal,
      extra: { route: n.route },
      schedule: { at: n.quand, allowWhileIdle: true },
      // Sinon le greffon ouvrirait de lui-même « Alarmes et rappels », sans
      // l'explication de l'app.
      isExactNotification: exacte,
    })),
  })
}

// Ouvrir l'office ou le chapelet retire sa notification encore affichée.
export async function retirerNotification(route: string) {
  if (!natif()) {
    const telephone = telephoneSimule()
    telephone.affichees = telephone.affichees.filter((n) => n.route !== route)
    return
  }
  const { notifications } = await LocalNotifications.getDeliveredNotifications().catch(() => ({
    notifications: [],
  }))
  const aRetirer = notifications.filter((n) => n.extra?.route === route)
  if (aRetirer.length > 0)
    await LocalNotifications.removeDeliveredNotifications({ notifications: aRetirer }).catch(
      () => {},
    )
}

// Un toucher sur une notification : la route de la prière à ouvrir.
export function surToucherNotification(ouvrir: (route: string) => void) {
  if (!natif()) {
    telephoneSimule().ecouteurs.push(ouvrir)
    return
  }
  LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
    const route: unknown = notification.extra?.route
    if (typeof route === 'string') ouvrir(route)
  }).catch(() => {})
}
