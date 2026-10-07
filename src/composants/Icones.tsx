import { Link } from 'react-router'

// ‹ et ☰, partout les mêmes : en tête d'un office et dans sa barre.

export function BoutonRetour({ onClick }: { onClick: () => void }) {
  return (
    <button className="bouton-icone" type="button" aria-label="Retour" onClick={onClick}>
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M12.5 4l-6 6 6 6" />
      </svg>
    </button>
  )
}

// Le menu sait d'où il est ouvert : le jour, et l'office en cours s'il y en a un.
export function LienMenu({ depuis, office }: { depuis: string; office?: string }) {
  return (
    <Link className="bouton-icone" to="/menu" state={{ depuis, office }} aria-label="Menu">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 5h14M3 10h14M3 15h14" />
      </svg>
    </Link>
  )
}
