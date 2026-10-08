import type { Accord } from '../telephone/notifications'
import type { Blocages, Fabricant } from '../telephone/sonnerie'
import { aucunRappelActif, type Rappels } from './reglages'

// Ce qu'Android accorde à l'app, et ce qu'il bloque.
export interface EtatAndroid {
  accord: Accord
  exacte: boolean
  marque: Fabricant
  bloque: Blocages
}

// Les avis de la rubrique Rappels, dans leur ordre d'affichage. Tous disent
// qu'un rappel ne viendra pas, sauf « minute » : sans « Alarmes et rappels »,
// il viendra, peut-être en retard.
export type Avis = 'notifications' | 'minute' | 'arrierePlan' | 'demarrage' | 'batterie'

// Les avis à montrer : seulement tant qu'un rappel est activé, et seulement
// sur ce que l'on sait lire du téléphone. Un accord encore à demander ne
// bloque rien : la fenêtre viendra au premier rappel activé.
export function avisDesRappels(rappels: Rappels, android: EtatAndroid | undefined): Avis[] {
  if (!android || aucunRappelActif(rappels)) return []
  const { accord, exacte, marque, bloque } = android
  if (accord === 'refuse') return ['notifications']
  if (accord !== 'accorde') return []
  // La batterie ne bloque les rappels que sous les surcouches de Xiaomi et Samsung.
  const guide = marque === 'xiaomi' || marque === 'samsung'
  const avis: Avis[] = []
  if (!exacte) avis.push('minute')
  if (bloque.arrierePlan) avis.push('arrierePlan')
  if (marque === 'xiaomi' && bloque.demarrage) avis.push('demarrage')
  if (guide && bloque.batterie) avis.push('batterie')
  return avis
}

// « Rappels bloqués par le téléphone » : la rubrique fermée et l'accueil le
// disent dès qu'un avis de blocage s'affiche (décision du porteur du projet,
// 2026-10-08). Un même calcul pour les trois, qui ne divergent jamais.
export const rappelsBloques = (rappels: Rappels, android: EtatAndroid | undefined) =>
  avisDesRappels(rappels, android).some((avis) => avis !== 'minute')
