import type { Lieu } from '../office/soleil'
import { localiser, type Localisation } from '../telephone/position'
import { choisirLieu, deplacementNotable, lireLieu, type LieuChoisi } from './lieu'
import { chargerVilles, villeLaPlusProche, type Ville } from './villes'

// La position du GPS, nommée d'après la ville la plus proche (« Près de
// Lyon ») ; le calcul du soleil garde la position exacte.
export function lieuDeLaPosition(position: Lieu, villes: Ville[]): LieuChoisi {
  const proche = villeLaPlusProche(villes, position)
  return { nom: proche?.nom ?? '', pres: true, ...position }
}

// À l'ouverture, avec l'option « Actualiser à chaque ouverture » (US-45) : au-
// delà de 50 km du lieu enregistré, le lieu change sans rien afficher, et les
// heures et rappels se recalculent (décision du porteur du projet, 2026-10-07).
export async function verifierLeVoyage(
  trouver: () => Promise<Localisation> = localiser,
  charger: () => Promise<Ville[]> = chargerVilles,
) {
  const { lieu, actualiser } = lireLieu()
  if (!lieu || !actualiser) return
  const resultat = await trouver()
  if (resultat.sorte !== 'trouvee' || !deplacementNotable(lieu, resultat.position)) return
  choisirLieu(lieuDeLaPosition(resultat.position, await charger().catch(() => [])))
}

// À l'ouverture de l'app et à son retour au premier plan : sur Android, on
// rouvre souvent une app restée en mémoire plutôt qu'on ne la relance.
export function suivreLesVoyages(): () => void {
  const verifier = () => {
    if (document.visibilityState !== 'hidden') verifierLeVoyage().catch(() => {})
  }
  verifier()
  document.addEventListener('visibilitychange', verifier)
  return () => document.removeEventListener('visibilitychange', verifier)
}
