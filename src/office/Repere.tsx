import type { CouleurLiturgique } from './modele'
import '../styles/perle-liturgique.css'
import './Repere.css'

// Entre deux parties : un filet fin, et au milieu une perle de la couleur
// liturgique du jour (choix du porteur du projet, 2026-10-06). Sans couleur
// connue, la perle est d'or.
export function Repere({
  couleur,
  testId = 'repere',
}: {
  couleur?: CouleurLiturgique
  // Celle qui ferme une prière n'est pas un repère entre deux parties.
  testId?: string
}) {
  return (
    <div className="repere" aria-hidden="true" data-testid={testId}>
      <span className="repere-perle" data-couleur={couleur ?? 'or'} />
    </div>
  )
}
