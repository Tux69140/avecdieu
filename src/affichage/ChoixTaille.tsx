import { PRIERES } from '../recueil/prieres'
import { TAILLES, type TailleTexte } from '../reglages/reglages'
import './ChoixTaille.css'

interface Props {
  taille: TailleTexte
  onChoisir: (taille: TailleTexte) => void
  // Identifiant du titre qui nomme le choix.
  titre: string
}

const ORIGINE: TailleTexte = 18
// En exemple, le début du Notre Père, tiré du recueil validé.
const EXEMPLE = PRIERES['notre-pere'].lignes.slice(0, 2)

// La taille du texte à prier : A− et A+ de cran en cran, autour de 5 points,
// avec un exemple qui change en direct (libellés validés le 2026-10-07).
export function ChoixTaille({ taille, onChoisir, titre }: Props) {
  const rang = TAILLES.indexOf(taille)
  return (
    <div className="choix-taille" role="group" aria-labelledby={titre}>
      <div className="taille-crans">
        <button
          className="taille-bouton"
          type="button"
          aria-label="Réduire le texte"
          disabled={rang === 0}
          onClick={() => onChoisir(TAILLES[rang - 1])}
        >
          A−
        </button>
        <span
          className="taille-points"
          role="img"
          aria-label={`Taille ${rang + 1} sur ${TAILLES.length}`}
        >
          {TAILLES.map((t, i) => (
            <span key={t} className="taille-point" data-plein={i <= rang ? 'oui' : 'non'} />
          ))}
        </span>
        <button
          className="taille-bouton taille-bouton-grand"
          type="button"
          aria-label="Agrandir le texte"
          disabled={rang === TAILLES.length - 1}
          onClick={() => onChoisir(TAILLES[rang + 1])}
        >
          A+
        </button>
      </div>
      <p className="taille-exemple" data-testid="exemple-taille">
        {EXEMPLE.map((ligne) => (
          <span key={ligne}>{ligne}</span>
        ))}
      </p>
      {taille !== ORIGINE && (
        <button className="lien-discret" type="button" onClick={() => onChoisir(ORIGINE)}>
          Taille d’origine
        </button>
      )}
      <p className="choix-aide">Dans un office ou au chapelet, pincez ou écartez deux doigts.</p>
    </div>
  )
}
