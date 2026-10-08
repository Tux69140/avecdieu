import { LITANIES } from '../recueil/litanies'
import { insecables } from './typographie'
import './TexteLitanies.css'

interface Props {
  // À plusieurs : celui qui mène dit l'invocation, tous la réponse, en demi-gras.
  plusieurs: boolean
}

// Les Litanies sur une seule page qu'on fait défiler : une invocation par
// ligne, la réponse écrite seulement quand elle change, après un tiret
// (décision du porteur du projet, 2026-10-08).
export function TexteLitanies({ plusieurs }: Props) {
  return (
    <div className="priere-texte litanies">
      {LITANIES.invocations.map(({ invocation, reponse }, i) => (
        <p key={i} className="invocation" data-testid="invocation">
          {insecables(invocation)}
          {reponse !== undefined && (
            <>
              {' '}
              {/* Le tiret ne se sépare pas de la réponse en fin de ligne. */}
              <span className="reponse" data-tous={plusieurs ? 'oui' : undefined}>
                {'— ' + insecables(reponse)}
              </span>
            </>
          )}
        </p>
      ))}
    </div>
  )
}
