import { PRIERES_RAPPELEES, type Priere } from '../rappels/reglages'
import { ecrireEtSignaler, lireObjet, RACINE } from '../reglages/stockage'

// Les prières que l'accueil montre, réglées dans Réglages › Accueil (phase 19,
// décision du porteur du projet, 2026-10-20) : toutes au départ, chacune
// masquable, pour n'y garder que ce que l'on prie.

export type PriereAffichable = Priere | 'rosaire'

// L'ordre de la page Réglages › Accueil, celui de l'accueil : le Chapelet et
// le Rosaire en tête, puis la journée, comme Heures et rappels.
export const PRIERES_AFFICHABLES: readonly PriereAffichable[] = [
  'chapelet',
  'rosaire',
  ...PRIERES_RAPPELEES.filter((priere) => priere !== 'chapelet'),
]

export type Affichees = Record<PriereAffichable, boolean>

const CLE = `${RACINE}accueil`

// Signalé à la page, comme les autres réglages.
export const AFFICHEES_CHANGEES = 'avec-dieu:accueil-change'

// Seule une prière enregistrée comme masquée l'est : tout le reste s'affiche.
export function lireAffichees(): Affichees {
  const lues = lireObjet(CLE)
  return Object.fromEntries(
    PRIERES_AFFICHABLES.map((priere) => [priere, lues[priere] !== false]),
  ) as Affichees
}

export function modifierAffichee(priere: PriereAffichable, affichee: boolean): Affichees {
  const affichees = { ...lireAffichees(), [priere]: affichee }
  ecrireEtSignaler(CLE, affichees, AFFICHEES_CHANGEES)
  return affichees
}
