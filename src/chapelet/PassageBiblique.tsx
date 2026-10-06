import type { Passage } from '../recueil/passages'
import { insecables } from './typographie'
import './PassageBiblique.css'

// Un passage biblique : sa référence, puis ses versets en un seul paragraphe,
// numéros en rouge rubrique.
export function PassageBiblique({ passage }: { passage: Passage }) {
  return (
    <div className="passage" data-testid="passage">
      <p className="passage-reference">{passage.reference}</p>
      <p className="passage-texte">
        {Object.entries(passage.versets).map(([numero, texte]) => (
          <span key={numero}>
            <sup>{numero}</sup>
            {insecables(texte)}{' '}
          </span>
        ))}
      </p>
    </div>
  )
}
