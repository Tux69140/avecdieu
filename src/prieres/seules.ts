import { TEXTES_OFFICE } from '../recueil/office'
import { PRIERES, type Priere } from '../recueil/prieres'

// Les prières qui s'ouvrent seules depuis le menu (choix du porteur du projet,
// 2026-10-08) : deux en accès direct, quatre sous « Prières ». Leurs textes
// sont ceux du recueil, déjà validés ; aucun texte nouveau.
export type PriereSeuleId =
  'je-vous-salue-marie' | 'notre-pere' | 'credo' | 'gloire-au-pere' | 'salve-regina' | 'je-confesse'

export const PRIERES_SEULES: Record<PriereSeuleId, Priere> = {
  'je-vous-salue-marie': PRIERES['je-vous-salue-marie'],
  'notre-pere': PRIERES['notre-pere'],
  credo: PRIERES.credo,
  'gloire-au-pere': PRIERES['gloire-au-pere'],
  'salve-regina': PRIERES['salve-regina'],
  // Le Je confesse des complies, dit ensemble : sans réponse.
  'je-confesse': { titre: 'Je confesse à Dieu', lignes: TEXTES_OFFICE['je-confesse'] },
}

// Dans l'ordre du menu.
export const PRIERES_DIRECTES: PriereSeuleId[] = ['je-vous-salue-marie', 'notre-pere']
export const AUTRES_PRIERES: PriereSeuleId[] = [
  'credo',
  'gloire-au-pere',
  'salve-regina',
  'je-confesse',
]

export const estPriereSeule = (valeur: string): valeur is PriereSeuleId =>
  Object.hasOwn(PRIERES_SEULES, valeur)
