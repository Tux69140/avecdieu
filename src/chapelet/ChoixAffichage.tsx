import type { Affichage } from './reglages'
import './ChoixAffichage.css'

interface Props {
  affichage: Affichage
  onChoisir: (affichage: Affichage) => void
  // Identifiant du titre qui nomme le choix.
  titre: string
}

const AFFICHAGES: [Affichage, string][] = [
  ['complet', 'Texte complet'],
  ['compact', 'Compact'],
]

// Texte complet ou compact : sur le seuil et dans les réglages, la même mémoire.
export function ChoixAffichage({ affichage, onChoisir, titre }: Props) {
  return (
    <>
      <div className="bascule" role="radiogroup" aria-labelledby={titre}>
        {AFFICHAGES.map(([valeur, libelle]) => (
          <button
            key={valeur}
            type="button"
            role="radio"
            aria-checked={affichage === valeur}
            onClick={() => onChoisir(valeur)}
          >
            {libelle}
          </button>
        ))}
      </div>
      <p className="choix-aide">
        Compact : le nom de la prière et le compteur, pour qui la sait par cœur.
      </p>
    </>
  )
}
