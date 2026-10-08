import './BoutonAide.css'

// Le petit « ? » cerclé de sépia qui rouvre l'aide d'un écran de prière, dans
// l'office comme au chapelet (choix du porteur du projet, 2026-10-08). La place
// dans la ligne revient à l'écran, par `className`.
export function BoutonAide({
  libelle,
  className,
  onClick,
}: {
  libelle: string
  className?: string
  onClick: () => void
}) {
  return (
    <button
      className={className ? `bouton-aide ${className}` : 'bouton-aide'}
      type="button"
      aria-haspopup="dialog"
      aria-label={libelle}
      onClick={onClick}
    >
      <span aria-hidden="true">?</span>
    </button>
  )
}
