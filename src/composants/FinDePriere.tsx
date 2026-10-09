import type { ReactNode } from 'react'
import { Repere } from '../office/Repere'
import './FinDePriere.css'

interface Props {
  // Ce que le lecteur d'écran entend en y arrivant : « Fin du chapelet »… Sans
  // nom, pas de région : l'office n'en a aucune, ses parties portent les titres.
  libelle?: string
  onAccueil: () => void
  // À côté du chemin de l'accueil : l'office suivant (2026-10-09).
  suite?: ReactNode
  className?: string
  testId?: string
}

// La fin d'une prière, la même partout : une perle d'or qui ferme, puis le
// chemin de l'accueil, sans mot de plus ni « Recommencer » qu'un toucher
// machinal relancerait (choix du porteur du projet, 2026-10-08).
export function FinDePriere({ libelle, onAccueil, suite, className, testId }: Props) {
  const Bloc = libelle ? 'section' : 'div'
  return (
    <Bloc
      className={className ? `fin-de-priere ${className}` : 'fin-de-priere'}
      data-testid={testId}
      aria-label={libelle}
    >
      <Repere testId="perle-de-fin" />
      <div className="fin-de-priere-liens">
        <button className="lien-discret" type="button" onClick={onAccueil}>
          Revenir à l’accueil
        </button>
        {suite}
      </div>
    </Bloc>
  )
}
