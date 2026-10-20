import { decaler, paques } from '../office/dates'
import type { PriereMariale } from '../recueil/angelus'

// Du dimanche de Pâques au dimanche de la Pentecôte inclus (Pâques plus 49
// jours), le Regina Caeli remplace l'Angélus : sur l'accueil, dans les rappels
// et leurs notifications (décision du porteur du projet, 2026-10-20). Le menu
// garde les deux toute l'année.
export function priereMarialeDu(date: string): PriereMariale {
  const dimanche = paques(Number(date.slice(0, 4)))
  return date >= dimanche && date <= decaler(dimanche, 49) ? 'regina-caeli' : 'angelus'
}
