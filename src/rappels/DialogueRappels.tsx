import { useEffect, useId, useRef } from 'react'
import type { Fabricant } from '../telephone/sonnerie'
import type { Etape } from './autorisations'
import './DialogueRappels.css'

interface Props {
  etape: Etape
  marque: Fabricant
  // Le bouton principal : « Continuer » ou « Ouvrir la page ».
  onAccepter: () => void
  // « Plus tard », Échap ou le bouton retour.
  onRenoncer: () => void
}

// Textes validés par le porteur du projet (2026-10-07).
const GUIDES: Record<'xiaomi' | 'samsung', { titre: string; texte: string; reglages: string[] }> = {
  xiaomi: {
    titre: 'Sur un Xiaomi',
    texte: 'L’économiseur de batterie peut bloquer les rappels. Dans la page qui va s’ouvrir :',
    reglages: ['Économiseur de batterie : Aucune restriction', 'Démarrage automatique : activé'],
  },
  samsung: {
    titre: 'Sur un Samsung',
    texte: 'La mise en veille des applis peut bloquer les rappels. Dans la page qui va s’ouvrir :',
    reglages: ['Batterie : Non restreinte'],
  },
}

function contenu(etape: Etape, marque: Fabricant) {
  if (etape === 'accord')
    return {
      titre: 'Recevoir les rappels',
      texte:
        'Pour vous prévenir à l’heure de la prière, l’app a besoin de votre accord. Android va vous le demander.',
      accepter: 'Continuer',
      renoncer: undefined,
    }
  if (etape === 'minute')
    return {
      titre: 'À la minute près',
      texte:
        'Pour que le rappel arrive à l’heure exacte, autorisez « Alarmes et rappels » dans la page qui va s’ouvrir.',
      accepter: 'Ouvrir la page',
      renoncer: 'Plus tard',
    }
  const guide = GUIDES[marque === 'samsung' ? 'samsung' : 'xiaomi']
  return { ...guide, accepter: 'Ouvrir la page', renoncer: 'Plus tard' }
}

// Une fenêtre au milieu de l'écran, par-dessus les réglages assombris.
export function DialogueRappels({ etape, marque, onAccepter, onRenoncer }: Props) {
  const fenetre = useRef<HTMLDialogElement>(null)
  const titre = useId()
  const { titre: intitule, texte, accepter, renoncer, ...reste } = contenu(etape, marque)
  const reglages = 'reglages' in reste ? reste.reglages : undefined

  useEffect(() => {
    const dialogue = fenetre.current
    if (dialogue && !dialogue.open) dialogue.showModal?.()
    return () => dialogue?.close()
  }, [etape])

  return (
    <dialog
      ref={fenetre}
      className="dialogue-rappels"
      aria-labelledby={titre}
      data-etape={etape}
      // Échap ou le bouton retour : comme « Plus tard ».
      onCancel={(e) => {
        e.preventDefault()
        onRenoncer()
      }}
    >
      <h2 id={titre}>{intitule}</h2>
      <p>{texte}</p>
      {reglages &&
        (reglages.length > 1 ? (
          <ol className="dialogue-reglages">
            {reglages.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        ) : (
          <p className="dialogue-reglages">{reglages[0]}</p>
        ))}
      <div className="dialogue-boutons">
        <button className="btn btn-principal" type="button" onClick={onAccepter}>
          {accepter}
        </button>
        {renoncer && (
          <button className="lien-discret" type="button" onClick={onRenoncer}>
            {renoncer}
          </button>
        )}
      </div>
    </dialog>
  )
}
