import { Link } from 'react-router'
import type { NomRubrique } from '../ecrans/EcranReglages'
import { RAPPELS_BLOQUES } from '../rappels/textes'
import { useRappelsBloques } from '../rappels/useEtatAndroid'

// Sur la ligne du ☰, à droite : le téléphone bloque les rappels activés. Un
// toucher ouvre les réglages, rubrique Rappels dépliée sur ses avis (décision
// du porteur du projet, 2026-10-08). Posée là, elle ne repousse pas les
// complies sous la ligne de flottaison.
export function AlerteRappels() {
  if (!useRappelsBloques()) return null
  return (
    <Link
      className="accueil-alerte"
      to="/reglages"
      state={{ rubrique: 'rappels' satisfies NomRubrique }}
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
