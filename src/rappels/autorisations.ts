import { accordNotifications, minuteExacte } from '../telephone/notifications'
import { fabricant } from '../telephone/sonnerie'
import { lireDemandes } from './reglages'

// Ce que l'app demande au premier rappel activé (US-39, US-40), dans l'ordre :
// l'accord pour les notifications, « Alarmes et rappels », puis le guide de
// batterie sur Xiaomi et Samsung. Chaque fenêtre ne vient qu'au besoin, et
// les deux dernières une seule fois : refusées, elles laissent un avis dans
// la rubrique (textes validés par le porteur du projet, 2026-10-07).
export type Etape = 'accord' | 'minute' | 'batterie'

export const guideDeBatterie = async () => {
  const marque = await fabricant()
  return marque === 'xiaomi' || marque === 'samsung'
}

// La fenêtre qui suit `depuis` (« activation » : un rappel vient d'être
// activé), ou rien s'il n'y a plus rien à demander.
export async function etapeSuivante(depuis: 'activation' | Etape): Promise<Etape | undefined> {
  const accord = await accordNotifications()
  if (depuis === 'activation' && accord === 'a-demander') return 'accord'
  // Sans notifications, ni l'exactitude ni la batterie n'y changeraient rien.
  if (accord !== 'accorde') return undefined
  const demandes = lireDemandes()
  if (
    (depuis === 'activation' || depuis === 'accord') &&
    !demandes.minute &&
    !(await minuteExacte())
  )
    return 'minute'
  if (depuis !== 'batterie' && !demandes.batterie && (await guideDeBatterie())) return 'batterie'
  return undefined
}
