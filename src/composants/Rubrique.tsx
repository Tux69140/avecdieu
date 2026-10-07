import { useId, type ReactNode } from 'react'
import './Rubrique.css'

interface Props {
  titre: string
  resume: string
  ouverte: boolean
  onBasculer: () => void
  children: ReactNode
}

// Une rubrique des réglages en accordéon : le titre et son résumé se touchent
// en entier, le chevron pivote à l'ouverture.
export function Rubrique({ titre, resume, ouverte, onBasculer, children }: Props) {
  const id = useId()
  return (
    <section className="rubrique" data-ouverte={ouverte ? 'oui' : 'non'}>
      <h2 className="rubrique-titre">
        <button type="button" aria-expanded={ouverte} aria-controls={id} onClick={onBasculer}>
          <span className="rubrique-nom">{titre}</span>
          {/* Le résumé guide l'œil ; le lecteur d'écran lit le contenu une fois ouvert. */}
          <span className="rubrique-resume" aria-hidden="true">
            {resume}
          </span>
          <span className="rubrique-chevron" aria-hidden="true">
            ›
          </span>
        </button>
      </h2>
      <div id={id} className="rubrique-contenu" hidden={!ouverte}>
        {children}
      </div>
    </section>
  )
}
