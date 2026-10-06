import { useId } from 'react'
import './Interrupteur.css'

interface Props {
  libelle: string
  aide?: string
  actif: boolean
  onBasculer: (actif: boolean) => void
}

// Un réglage oui ou non : toute la ligne se touche, pas seulement le curseur.
export function Interrupteur({ libelle, aide, actif, onBasculer }: Props) {
  const id = useId()
  return (
    <div className="interrupteur">
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        aria-describedby={aide ? id : undefined}
        onClick={() => onBasculer(!actif)}
      >
        <span className="interrupteur-libelle">{libelle}</span>
        <span className="interrupteur-piste" aria-hidden="true">
          <span className="interrupteur-curseur" />
        </span>
      </button>
      {aide && (
        <p id={id} className="interrupteur-aide">
          {aide}
        </p>
      )}
    </div>
  )
}
