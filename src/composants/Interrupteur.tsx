import { useId } from 'react'
import './Interrupteur.css'

interface Props {
  libelle: string
  aide?: string
  // Le curseur seul, au bout d'une ligne qui dit déjà ce qu'il règle (un
  // rappel, « Pas avant ») : le libellé n'est lu que par le lecteur d'écran.
  libelleCache?: boolean
  actif: boolean
  onBasculer: (actif: boolean) => void
}

const piste = (
  <span className="interrupteur-piste" aria-hidden="true">
    <span className="interrupteur-curseur" />
  </span>
)

// Un réglage oui ou non : toute la ligne se touche, pas seulement le curseur.
export function Interrupteur({ libelle, aide, libelleCache, actif, onBasculer }: Props) {
  const id = useId()
  if (libelleCache)
    return (
      <button
        className="interrupteur-seul"
        type="button"
        role="switch"
        aria-checked={actif}
        aria-label={libelle}
        onClick={() => onBasculer(!actif)}
      >
        {piste}
      </button>
    )
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
        {piste}
      </button>
      {aide && (
        <p id={id} className="interrupteur-aide">
          {aide}
        </p>
      )}
    </div>
  )
}
