import { useId, useRef } from 'react'
import { useFenetreModale } from '../composants/useFenetreModale'
import type { Fabricant } from '../telephone/sonnerie'
import type { Etape } from './autorisations'
import { guideBatterie } from './textes'
import '../composants/Dialogue.css'

interface Props {
  etape: Etape
  marque: Fabricant
  // Le bouton principal : « Continuer » ou « Ouvrir la page ».
  onAccepter: () => void
  // « Plus tard », Échap ou le bouton retour.
  onRenoncer: () => void
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
      titre: 'A la minute près',
      texte:
        'Pour que le rappel arrive à l’heure exacte, autorisez « Alarmes et rappels » dans la page qui va s’ouvrir.',
      accepter: 'Ouvrir la page',
      renoncer: 'Plus tard',
    }
  if (etape === 'demarrage')
    return {
      titre: 'Démarrage automatique',
      texte:
        'Si l’app est fermée, Xiaomi l’empêche de se réveiller pour vous prévenir. Dans la page qui va s’ouvrir, activez Avec Dieu.',
      accepter: 'Ouvrir la page',
      renoncer: 'Plus tard',
    }
  return { ...guideBatterie(marque), accepter: 'Ouvrir la page', renoncer: 'Plus tard' }
}

// Une fenêtre au milieu de l'écran, par-dessus les réglages assombris.
export function DialogueRappels({ etape, marque, onAccepter, onRenoncer }: Props) {
  const fenetre = useRef<HTMLDialogElement>(null)
  const titre = useId()
  const { titre: intitule, texte, accepter, renoncer, ...reste } = contenu(etape, marque)
  const reglages = 'reglages' in reste ? reste.reglages : undefined

  useFenetreModale(fenetre, { cle: etape })

  return (
    <dialog
      ref={fenetre}
      className="dialogue"
      aria-labelledby={titre}
      data-etape={etape}
      // Échap ou le bouton retour : comme « Plus tard ».
      onCancel={(e) => {
        e.preventDefault()
        onRenoncer()
      }}
    >
      <h2 className="petit-titre" id={titre}>
        {intitule}
      </h2>
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
