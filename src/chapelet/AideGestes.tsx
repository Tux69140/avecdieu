import { useEffect, useRef, useState } from 'react'
import { masquerAide } from './memoire'
import './AideGestes.css'

// L'aide aux gestes, par-dessus le signe de croix, pour qu'un nouveau priant
// sache avancer et revenir. Elle revient à chaque chapelet tant que « Ne plus
// afficher » n'est pas coché.
export function AideGestes({ onFermer }: { onFermer: () => void }) {
  const fenetre = useRef<HTMLDialogElement>(null)
  const [nePlus, setNePlus] = useState(false)

  useEffect(() => {
    const dialogue = fenetre.current
    if (dialogue && !dialogue.open) dialogue.showModal?.()
  }, [])

  const fermer = () => {
    if (nePlus) masquerAide()
    onFermer()
  }

  return (
    <dialog ref={fenetre} className="aide-gestes" aria-labelledby="aide-titre" onClose={fermer}>
      <h2 id="aide-titre">Prier avec l’app</h2>
      <ul>
        <li>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="7" className="plein" />
            <circle cx="20" cy="20" r="13" />
          </svg>
          <span>
            <strong>Touchez</strong> n’importe où : prière suivante.
          </span>
        </li>
        <li>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M8 20h24M14 14l-6 6 6 6M26 14l6 6-6 6" />
          </svg>
          <span>
            <strong>Glissez de côté</strong> : prière précédente.
          </span>
        </li>
        <li>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M20 8v24M14 14l6-6 6 6M14 26l6 6 6-6" />
          </svg>
          <span>
            <strong>Glissez vers le haut ou le bas</strong> : faire défiler un long texte.
          </span>
        </li>
        <li>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="11" className="soleil" />
          </svg>
          <span>
            À l’annonce d’un mystère, <strong>touchez la grosse perle</strong> pour commencer la
            dizaine.
          </span>
        </li>
      </ul>
      <label className="ne-plus">
        <input type="checkbox" checked={nePlus} onChange={(e) => setNePlus(e.target.checked)} />
        Ne plus afficher
      </label>
      <button className="btn btn-principal" type="button" onClick={() => fenetre.current?.close()}>
        J’ai compris
      </button>
    </dialog>
  )
}
