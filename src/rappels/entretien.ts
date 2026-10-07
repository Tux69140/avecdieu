import {
  accordNotifications,
  minuteExacte,
  remplacerNotifications,
  surToucherNotification,
} from '../telephone/notifications'
import { creerCanal, supprimerCanaux } from '../telephone/sonnerie'
import { canauxNecessaires, programmer } from './programme'
import { aucunRappelActif, lireRappels, RAPPELS_CHANGES } from './reglages'

// Android garde les notifications du mois à venir. Elles sont refaites en
// entier à chaque changement de rappel, à l'ouverture de l'app et à son
// retour au premier plan : le mois glisse, et une autorisation donnée entre-
// temps dans les réglages d'Android est prise en compte.

export async function reprogrammer(maintenant = new Date()) {
  const rappels = lireRappels()
  if (aucunRappelActif(rappels)) {
    await remplacerNotifications([], false)
    await supprimerCanaux([]).catch(() => {})
    return
  }
  // Sans accord, Android refuserait tout : les rappels attendent l'accord.
  if ((await accordNotifications()) !== 'accorde') return
  const canaux = canauxNecessaires(rappels)
  for (const canal of canaux) await creerCanal(canal).catch(() => {})
  await supprimerCanaux(canaux.map((c) => c.id)).catch(() => {})
  await remplacerNotifications(programmer(rappels, maintenant), await minuteExacte())
}

// Les reprogrammations passent l'une après l'autre : deux à la fois
// mêleraient leurs annulations et leurs créations.
let file: Promise<unknown> = Promise.resolve()
export function reprogrammerBientot() {
  file = file.then(() => reprogrammer()).catch(() => {})
  return file
}

export function entretenirRappels(): () => void {
  const auPremierPlan = () => {
    if (document.visibilityState !== 'hidden') reprogrammerBientot()
  }
  reprogrammerBientot()
  document.addEventListener('visibilitychange', auPremierPlan)
  window.addEventListener(RAPPELS_CHANGES, reprogrammerBientot)
  return () => {
    document.removeEventListener('visibilitychange', auPremierPlan)
    window.removeEventListener(RAPPELS_CHANGES, reprogrammerBientot)
  }
}

// Seules les routes des prières s'ouvrent depuis une notification.
const ROUTE_DE_PRIERE = /^\/(office\/[a-z]+\/\d{4}-\d{2}-\d{2}|chapelet)$/

// Installé avant le premier affichage : une notification touchée app fermée
// ouvre directement sa prière.
export function ouvrirLesNotifications(naviguer: (route: string) => void) {
  surToucherNotification((route) => {
    if (ROUTE_DE_PRIERE.test(route)) naviguer(route)
  })
}
