import { useId, useRef } from 'react'
import { useFenetreModale } from '../composants/useFenetreModale'
import type { Etape } from './etapes'
import { PerleEtape } from './FilDePerles'
import { etatDePerle } from './reperage'
import './SommaireOffice.css'

interface Props {
  office: string
  etapes: Etape[]
  courante: number
  onChoisir: (etape: number) => void
  onFermer: () => void
}

// Le volet du sommaire, qui descend du haut de l'écran par-dessus le texte
// assombri (choix du porteur du projet, 2026-10-07). Monté seulement quand il
// est ouvert : le bouton retour d'Android le démonte en remontant l'historique.
export function SommaireOffice({ office, etapes, courante, onChoisir, onFermer }: Props) {
  const fenetre = useRef<HTMLDialogElement>(null)
  const enCours = useRef<HTMLButtonElement>(null)
  const titre = useId()

  // On retrouve d'emblée où l'on en est ; le texte, dessous, ne défile pas
  // avec le doigt qui parcourt le volet.
  useFenetreModale(fenetre, { focus: enCours, fixerLaPage: true })

  return (
    <dialog
      ref={fenetre}
      className="sommaire"
      aria-labelledby={titre}
      onClose={onFermer}
      // Un toucher sur le texte assombri tombe sur le dialogue lui-même.
      onClick={(e) => {
        if (e.target === e.currentTarget) fenetre.current?.close()
      }}
    >
      <div className="sommaire-volet">
        <div className="sommaire-tete">
          <h2 id={titre}>Sommaire · {office}</h2>
          <button
            className="sommaire-fermer"
            type="button"
            aria-label="Fermer le sommaire"
            onClick={() => fenetre.current?.close()}
          >
            <svg viewBox="0 0 16 10" aria-hidden="true">
              <path d="M2 8l6-6 6 6" />
            </svg>
          </button>
        </div>
        <ol className="sommaire-liste">
          {etapes.map((etape, i) => (
            <li key={i}>
              <button
                ref={i === courante ? enCours : undefined}
                type="button"
                aria-current={i === courante ? 'step' : undefined}
                onClick={() => onChoisir(i)}
              >
                <PerleEtape etat={etatDePerle(i, courante)} />
                <span>
                  {etape.libelle}
                  {etape.precision && (
                    <span className="sommaire-precision"> · {etape.precision}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </dialog>
  )
}
