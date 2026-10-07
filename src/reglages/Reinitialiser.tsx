import { useEffect, useId, useRef, useState } from 'react'
import '../composants/Dialogue.css'
import { reinitialiserApp } from './reinitialisation'
import './Reinitialiser.css'

// En bas des réglages, un lien discret, puis une confirmation avant d'effacer
// (textes validés par le porteur du projet, 2026-10-07).
export function Reinitialiser() {
  const [confirmer, setConfirmer] = useState(false)
  return (
    <div className="reinitialiser">
      <button className="lien-discret" type="button" onClick={() => setConfirmer(true)}>
        Réinitialiser l’app
      </button>
      {confirmer && <Confirmation onAnnuler={() => setConfirmer(false)} />}
    </div>
  )
}

function Confirmation({ onAnnuler }: { onAnnuler: () => void }) {
  const fenetre = useRef<HTMLDialogElement>(null)
  const titre = useId()

  useEffect(() => {
    const dialogue = fenetre.current
    if (dialogue && !dialogue.open) dialogue.showModal?.()
    return () => dialogue?.close()
  }, [])

  return (
    <dialog
      ref={fenetre}
      className="dialogue"
      aria-labelledby={titre}
      // Échap ou le bouton retour : comme « Annuler ».
      onCancel={(e) => {
        e.preventDefault()
        onAnnuler()
      }}
    >
      <h2 id={titre}>Réinitialiser l’app ?</h2>
      <p>
        Réglages, rappels, lieu et chapelet en cours sont effacés : l’app revient comme au premier
        lancement. Les textes enregistrés pour la semaine sont gardés.
      </p>
      <div className="dialogue-boutons">
        <button className="btn btn-principal" type="button" onClick={() => void reinitialiserApp()}>
          Réinitialiser
        </button>
        <button className="lien-discret" type="button" onClick={onAnnuler}>
          Annuler
        </button>
      </div>
    </dialog>
  )
}
