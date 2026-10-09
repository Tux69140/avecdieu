import { useId, type ReactNode } from 'react'
import './Rubrique.css'

interface Props {
  titre: string
  resume?: ReactNode
  ouverte: boolean
  onBasculer: () => void
  children: ReactNode
}

// Une rubrique en accordéon (menu et « A propos ») : le titre et
// son résumé se touchent en entier, la flèche se retourne à l'ouverture.
export function Rubrique({ titre, resume, ouverte, onBasculer, children }: Props) {
  const id = useId()
  return (
    <section className="rubrique" data-ouverte={ouverte ? 'oui' : 'non'}>
      <h2 className="rubrique-titre">
        <button type="button" aria-expanded={ouverte} aria-controls={id} onClick={onBasculer}>
          <span className="rubrique-nom">{titre}</span>
          {/* Le résumé guide l'œil ; le lecteur d'écran lit le contenu une fois ouvert. */}
          {resume && (
            <span className="rubrique-resume" aria-hidden="true">
              {resume}
            </span>
          )}
          {/* Une flèche vers le bas, dessinée : › veut dire « ouvre un autre
              écran », et le caractère retombait sur une police système. */}
          <span className="rubrique-chevron" aria-hidden="true">
            <svg viewBox="0 0 16 10">
              <path d="M2 2l6 6 6-6" />
            </svg>
          </span>
        </button>
      </h2>
      <div id={id} className="rubrique-contenu" hidden={!ouverte}>
        {children}
      </div>
    </section>
  )
}
