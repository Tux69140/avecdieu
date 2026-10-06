import type { Marque as Sorte } from '../chapelet/versets'
import './Marque.css'

// Les signes liturgiques ℣ et ℟, dessinés plutôt qu'écrits : les polices de
// l'app n'ont pas ces caractères, et un repli sur une police du système
// changerait d'un téléphone à l'autre. Rouge rubrique, comme dans les livres.
const TRACES: Record<Sorte, string> = {
  V: 'M3 3 L8 13.5 L13 3 M8.2 11.2 L14.4 7.2',
  R: 'M4.5 13.5 V3 H8.5 A2.9 2.9 0 0 1 8.5 8.8 H4.5 M8 8.8 L12 13.5 M8.2 13.4 L13.4 9.6',
}

export function Marque({ sorte }: { sorte: Sorte }) {
  return (
    <svg
      className="marque"
      data-testid={`marque-${sorte}`}
      viewBox="0 0 16 16"
      role="img"
      aria-label={`${sorte}/`}
    >
      <path d={TRACES[sorte]} />
    </svg>
  )
}
