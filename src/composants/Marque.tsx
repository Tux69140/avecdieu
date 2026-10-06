import type { Marque as Sorte } from '../chapelet/versets'
import './Marque.css'

// Les signes liturgiques ℣. et ℟., composés plutôt qu'écrits : les polices de
// l'app n'ont pas ces caractères, et un repli sur une police du système
// changerait d'un téléphone à l'autre. La lettre est celle du texte, barrée
// d'un trait fin ; rouge rubrique, comme dans les livres.
export function Marque({ sorte }: { sorte: Sorte }) {
  return (
    <span
      className={`marque marque-${sorte.toLowerCase()}`}
      data-testid={`marque-${sorte}`}
      role="img"
      aria-label={`${sorte}/`}
    >
      <span className="marque-lettre">{sorte}</span>.
    </span>
  )
}
