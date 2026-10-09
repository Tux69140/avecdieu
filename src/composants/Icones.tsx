import { Link } from 'react-router'

// Les icônes dessinées, partout les mêmes : la croix et ☰ en tête des écrans,
// d'un office et dans sa barre, la flèche vers le bas.

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

// Une flèche vers le bas, dessinée : › veut dire « ouvre un autre écran », et
// le caractère retombait sur une police système. Rubriques, « Plus bas »,
// étape en cours du bandeau de l'office.
export function FlecheBas() {
  return (
    <svg viewBox="0 0 16 10" aria-hidden="true">
      <path d="M2 2l6 6 6-6" />
    </svg>
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
