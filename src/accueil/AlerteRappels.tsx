import { Link } from 'react-router'
import { useOuvrirEnProfondeur } from '../composants/retour'
import { RAPPELS_BLOQUES } from '../rappels/textes'
import { useRappelsBloques } from '../rappels/useEtatAndroid'

const RAPPELS = '/reglages/rappels'

// Sur la ligne du ☰, à droite : le téléphone bloque les rappels activés. Un
// toucher ouvre Réglages › Rappels, sur ses avis (décision du porteur du
// projet, 2026-10-08) ; la croix et le retour d'Android remontent aux
// Réglages, puis à l'accueil. Posée là, elle ne repousse pas les complies
// sous la ligne de flottaison.
export function AlerteRappels() {
  const ouvrir = useOuvrirEnProfondeur()
  if (!useRappelsBloques()) return null
  return (
    <Link
      className="accueil-alerte"
      to={RAPPELS}
      onClick={(e) => {
        e.preventDefault()
        void ouvrir(RAPPELS)
      }}
    >
      {/* Un seul enfant : dans la boîte flexible, les espaces autour de ⚠ et ›
          tomberaient. */}
      <span>
        <span aria-hidden="true">⚠ </span>
        {RAPPELS_BLOQUES}
        <span aria-hidden="true"> ›</span>
      </span>
    </Link>
  )
}
