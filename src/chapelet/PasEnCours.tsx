import { useState } from 'react'
import { FinDePriere } from '../composants/FinDePriere'
import type { SerieId } from '../recueil/mysteres'
import type { Passage } from '../recueil/passages'
import type { PriereId } from '../recueil/prieres'
import type { Reglages } from '../reglages/reglages'
import { Annonce } from './Annonce'
import type { Pas } from './deroule'
import type { IntentionDuMois } from './intentionsDuPape'
import { passageDeSerie } from './libelles'
import { MystereEnCours } from './MystereEnCours'
import { Priere } from './Priere'

const estPriere = (pas: Pas): pas is Pas & { priere: PriereId | 'litanies' } =>
  pas.priere !== 'annonce'

interface Props {
  // Le pas en cours ; aucun, le chapelet est terminé.
  pas: Pas | undefined
  index: number
  // Au Rosaire, la série où l'on en est ; au chapelet, celle du seuil.
  serie: SerieId
  // Les passages choisis pour les mystères de cette série.
  passages: Passage[] | undefined
  reglages: Reglages
  rosaire: boolean
  intentionDuMois: IntentionDuMois | undefined
  onAvancer: () => void
  onAccueil: () => void
}

// Ce que le chapelet donne à prier au pas en cours : la prière, l'annonce du
// mystère ou la fin.
export function PasEnCours({ pas, index, serie, passages, reglages, rosaire, ...props }: Props) {
  const compact = reglages.affichage === 'compact'
  // Le passage déplié, en compact : celui d'une dizaine, dans sa série.
  const [passageDeplie, setPassageDeplie] = useState<string | null>(null)
  const passageDe = (dizaine: number) => passages?.[dizaine - 1]
  const cleDizaine = pas?.dizaine === undefined ? null : `${serie}-${pas.dizaine}`

  return (
    // Une seule région annonce chaque prière au lecteur d'écran : une région
    // neuve à chaque pas resterait muette. Le mystère y entre aussi, lu quand
    // il change : en compact, sans écran d'annonce, c'est lui qui dit le
    // mystère qui commence.
    <div aria-live="polite">
      {/* Au Rosaire, la série qui commence : une ligne en rouge en tête de
          l'annonce du premier mystère, ou au-dessus du Notre Père sans
          annonce à part. */}
      {pas?.nouvelleSerie && (
        <p className="passage-serie" data-testid="passage-serie">
          {passageDeSerie(serie)}
        </p>
      )}
      {/* Sans annonce, rien du mystère : des prières vocales seules. */}
      {pas && estPriere(pas) && pas.dizaine !== undefined && reglages.annonce && (
        <MystereEnCours
          serie={serie}
          dizaine={pas.dizaine}
          fruit={compact && pas.priere === 'notre-pere'}
        />
      )}
      {!pas ? (
        // La fin comme celle de l'office.
        <FinDePriere
          libelle={rosaire ? 'Fin du Rosaire' : 'Fin du chapelet'}
          className="fin"
          testId="fin-chapelet"
          onAccueil={props.onAccueil}
        />
      ) : estPriere(pas) ? (
        <Priere
          key={index}
          pas={pas}
          compact={compact}
          plusieurs={reglages.plusieurs}
          annonce={reglages.annonce}
          passage={pas.dizaine ? passageDe(pas.dizaine) : undefined}
          passageDeplie={cleDizaine !== null && passageDeplie === cleDizaine}
          intentionDuMois={props.intentionDuMois}
          onBasculerPassage={() => setPassageDeplie((d) => (d === cleDizaine ? null : cleDizaine))}
        />
      ) : (
        <Annonce
          key={index}
          serie={serie}
          dizaine={pas.dizaine!}
          passage={passageDe(pas.dizaine!)!}
          onCommencer={props.onAvancer}
        />
      )}
    </div>
  )
}
