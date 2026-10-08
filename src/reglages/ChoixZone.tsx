import { useEffect, useId, useRef, useState } from 'react'
import { ZONES, type Zone } from '../aelf/zones'
import '../composants/Dialogue.css'
import './ChoixZone.css'

interface Props {
  zone: Zone
  // Des textes sont gardés pour prier sans connexion : en changer demande confirmation.
  textesGardes: boolean
  onChoisir: (zone: Zone) => void
}

// La zone liturgique, choisie une fois pour toutes : une seule ligne dans la
// rubrique Offices, qui ouvre le choix dans une fenêtre. Changer de zone efface
// les textes gardés ; une confirmation l'annonce avant (textes validés par le
// porteur du projet, 2026-10-08, revus le même jour).
export function ChoixZone({ zone, textesGardes, onChoisir }: Props) {
  const [ouvert, setOuvert] = useState(false)
  return (
    <div className="choix-zone">
      <button
        className="choix-zone-ligne"
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOuvert(true)}
      >
        <span className="choix-zone-libelle">Zone liturgique</span>
        <span className="choix-zone-valeur">{ZONES[zone]}</span>
      </button>
      <p className="choix-aide">Le calendrier propre à votre pays ou région.</p>
      {ouvert && (
        <Fenetre
          zone={zone}
          textesGardes={textesGardes}
          onChoisir={(choisie) => {
            setOuvert(false)
            onChoisir(choisie)
          }}
          onFermer={() => setOuvert(false)}
        />
      )}
    </div>
  )
}

// « ceux de la zone Belgique », mais « ceux du calendrier romain général ».
const ceuxDe = (zone: Zone) =>
  zone === 'romain' ? 'ceux du calendrier romain général' : `ceux de la zone ${ZONES[zone]}`

function Fenetre({ zone, textesGardes, onChoisir, onFermer }: Props & { onFermer: () => void }) {
  const fenetre = useRef<HTMLDialogElement>(null)
  const titre = useId()
  // La zone touchée, en attente de confirmation.
  const [enAttente, setEnAttente] = useState<Zone>()

  useEffect(() => {
    const dialogue = fenetre.current
    if (dialogue && !dialogue.open) dialogue.showModal?.()
    return () => dialogue?.close()
  }, [])

  const toucher = (choisie: Zone) => {
    if (choisie === zone) onFermer()
    else if (textesGardes) setEnAttente(choisie)
    else onChoisir(choisie)
  }

  return (
    <dialog
      ref={fenetre}
      className="dialogue"
      aria-labelledby={titre}
      // Échap ou le bouton retour : comme « Annuler ».
      onCancel={(e) => {
        e.preventDefault()
        onFermer()
      }}
    >
      {enAttente ? (
        <>
          <h2 id={titre}>Changer de zone ?</h2>
          <p>
            Les textes gardés pour prier sans connexion seront effacés et remplacés par{' '}
            {ceuxDe(enAttente)}. Il faudra une connexion pour les recharger, sinon aucun texte ne
            sera disponible.
          </p>
          <div className="dialogue-boutons">
            <button
              className="btn btn-principal"
              type="button"
              onClick={() => onChoisir(enAttente)}
            >
              Changer
            </button>
            <button className="lien-discret" type="button" onClick={onFermer}>
              Annuler
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 id={titre}>Zone liturgique</h2>
          <div className="choix-zone-liste" role="radiogroup" aria-labelledby={titre}>
            {(Object.entries(ZONES) as [Zone, string][]).map(([cle, nom]) => (
              <label key={cle} className="choix-zone-option">
                <input
                  type="radio"
                  name="zone"
                  checked={zone === cle}
                  onChange={() => toucher(cle)}
                />
                {nom}
              </label>
            ))}
          </div>
          <div className="dialogue-boutons">
            <button className="lien-discret" type="button" onClick={onFermer}>
              Annuler
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}
