import { ouvrirPageMinute, type Accord } from '../telephone/notifications'
import {
  ouvrirDemarrageAutomatique,
  ouvrirFicheApp,
  ouvrirReglagesNotifications,
  type Blocages,
  type Fabricant,
} from '../telephone/sonnerie'

export interface EtatAndroid {
  accord: Accord
  exacte: boolean
  marque: Fabricant
  bloque: Blocages
}

interface Props {
  android: EtatAndroid
  // Après « Autoriser » : Android relu, rappels refaits.
  onMinuteOuverte: () => void
}

function Avis({
  texte,
  bouton,
  onOuvrir,
}: {
  texte: string
  bouton: string
  onOuvrir: () => void
}) {
  return (
    <div className="rappels-avis" role="status">
      <p>
        <span aria-hidden="true">⚠ </span>
        {texte}
      </p>
      <button className="btn btn-secondaire" type="button" onClick={onOuvrir}>
        {bouton}
      </button>
    </div>
  )
}

// Les avis de la rubrique quand un rappel est activé mais qu'Android, ou la
// surcouche du fabricant, l'empêchera d'arriver (textes validés par le porteur
// du projet, 2026-10-07). Chacun se relit au retour des réglages.
export function AvisRappels({ android, onMinuteOuverte }: Props) {
  const { accord, exacte, marque, bloque } = android
  if (accord === 'refuse')
    return (
      <Avis
        texte="Android bloque les notifications de l’app : aucun rappel ne s’affichera."
        bouton="Ouvrir les réglages d’Android"
        onOuvrir={ouvrirReglagesNotifications}
      />
    )
  if (accord !== 'accorde') return null
  const guide = marque === 'xiaomi' || marque === 'samsung'
  return (
    <>
      {!exacte && (
        <Avis
          texte="Sans l’autorisation « Alarmes et rappels », les rappels peuvent arriver en retard."
          bouton="Autoriser"
          onOuvrir={async () => {
            await ouvrirPageMinute()
            onMinuteOuverte()
          }}
        />
      )}
      {bloque.arrierePlan && (
        <Avis
          texte="Android interdit à l’app de travailler en arrière-plan : aucun rappel ne viendra."
          bouton="Ouvrir les réglages d’Android"
          onOuvrir={ouvrirFicheApp}
        />
      )}
      {marque === 'xiaomi' && bloque.demarrage && (
        <Avis
          texte="Le démarrage automatique est désactivé : si l’app est fermée, le téléphone ne la réveille pas et le rappel ne vient pas."
          bouton="Ouvrir la page"
          onOuvrir={ouvrirDemarrageAutomatique}
        />
      )}
      {guide && bloque.batterie && (
        <Avis
          texte="L’économiseur de batterie peut bloquer les rappels."
          bouton="Régler la batterie"
          onOuvrir={ouvrirFicheApp}
        />
      )}
    </>
  )
}
