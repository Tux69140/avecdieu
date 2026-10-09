import { LigneFermer } from '../composants/LigneFermer'
import { useQuitterLeMenu, useRemonter } from '../composants/retour'
import { AUTRES_PRIERES } from '../prieres/seules'
import { LienPriere } from './MenuListes'
import './EcranMenu.css'

// Menu › Prières (/menu/prieres) : les prières seules qui ne sont pas en accès
// direct, sur une page (2026-10-09). La croix remonte au menu.
export function EcranMenuPrieres() {
  const remonter = useRemonter()
  const ouvrir = useQuitterLeMenu()
  return (
    <main className="menu">
      <LigneFermer onFermer={remonter}>
        <h1>Prières</h1>
      </LigneFermer>
      <nav aria-label="Prières">
        <ul className="menu-liste">
          {AUTRES_PRIERES.map((id) => (
            <LienPriere key={id} id={id} ouvrir={ouvrir} />
          ))}
        </ul>
      </nav>
    </main>
  )
}
