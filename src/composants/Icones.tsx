import { Link } from 'react-router'

// La croix et ☰, partout les mêmes : en tête des écrans, d'un office et dans sa barre.

// Fermer : une croix fine en haut à gauche, le même dessin sur chaque écran.
// Elle ramène là d'où l'on vient, comme le retour d'Android (décision du
// porteur du projet, 2026-10-08).
export function BoutonFermer({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="bouton-icone bouton-fermer"
      type="button"
      aria-label="Fermer"
      onClick={onClick}
    >
      <svg viewBox="0 0 18 18" aria-hidden="true">
        <path d="M3.5 3.5l11 11M14.5 3.5l-11 11" />
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
