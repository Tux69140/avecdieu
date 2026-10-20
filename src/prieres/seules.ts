import { PRIERES_MARIALES, type PriereComposee } from '../recueil/angelus'
import { PRIERES_MONTFORT } from '../recueil/montfort'
import { TEXTES_OFFICE } from '../recueil/office'
import { PRIERES, type Priere } from '../recueil/prieres'

// Les prières qui s'ouvrent seules depuis le menu (choix du porteur du projet,
// 2026-10-08) : deux en accès direct, les autres sous « Prières ». Leurs
// textes sont ceux du recueil, déjà validés ; l'Angélus, le Regina Caeli et
// trois prières de saint Louis-Marie de Montfort s'y ajoutent après le Salve
// Regina (2026-10-20).
export type PriereSeuleId =
  | 'je-vous-salue-marie'
  | 'notre-pere'
  | 'credo'
  | 'gloire-au-pere'
  | 'salve-regina'
  | 'angelus'
  | 'regina-caeli'
  | 'priere-a-marie'
  | 'consecration'
  | 'tout-a-vous'
  | 'je-confesse'

// Une prière d'un seul tenant, vue comme une prière faite de morceaux.
const dUnTenant = ({ titre, lignes, reponse }: Priere): PriereComposee => ({
  titre,
  morceaux: [{ lignes, reponse }],
})

export const PRIERES_SEULES: Record<PriereSeuleId, PriereComposee> = {
  'je-vous-salue-marie': dUnTenant(PRIERES['je-vous-salue-marie']),
  'notre-pere': dUnTenant(PRIERES['notre-pere']),
  credo: dUnTenant(PRIERES.credo),
  'gloire-au-pere': dUnTenant(PRIERES['gloire-au-pere']),
  'salve-regina': dUnTenant(PRIERES['salve-regina']),
  angelus: PRIERES_MARIALES.angelus,
  'regina-caeli': PRIERES_MARIALES['regina-caeli'],
  ...PRIERES_MONTFORT,
  // Le Je confesse des complies, dit ensemble : sans réponse.
  'je-confesse': dUnTenant({ titre: 'Je confesse à Dieu', lignes: TEXTES_OFFICE['je-confesse'] }),
}

// Dans l'ordre du menu.
export const PRIERES_DIRECTES: PriereSeuleId[] = ['je-vous-salue-marie', 'notre-pere']
export const AUTRES_PRIERES: PriereSeuleId[] = [
  'credo',
  'gloire-au-pere',
  'salve-regina',
  'angelus',
  'regina-caeli',
  'priere-a-marie',
  'consecration',
  'tout-a-vous',
  'je-confesse',
]

export const estPriereSeule = (valeur: string): valeur is PriereSeuleId =>
  Object.hasOwn(PRIERES_SEULES, valeur)
