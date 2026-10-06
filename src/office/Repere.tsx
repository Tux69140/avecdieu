import type { CouleurLiturgique } from './modele'
import './Repere.css'

// Entre deux parties : un filet fin, et au milieu une perle de la couleur
// liturgique du jour (choix du porteur du projet, 2026-10-06). Sans couleur
// connue, la perle est d'or.
export function Repere({ couleur }: { couleur?: CouleurLiturgique }) {
  return (
    <div className="repere" aria-hidden="true" data-testid="repere">
      <span className="repere-perle" data-couleur={couleur ?? 'or'} />
    </div>
  )
}
