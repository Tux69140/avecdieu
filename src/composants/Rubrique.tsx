import { useId, type ReactNode } from 'react'
import { FlecheBas } from './Icones'
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
          <span className="rubrique-chevron" aria-hidden="true">
            <FlecheBas />
          </span>
        </button>
      </h2>
      <div id={id} className="rubrique-contenu" hidden={!ouverte}>
        {children}
      </div>
    </section>
  )
}
