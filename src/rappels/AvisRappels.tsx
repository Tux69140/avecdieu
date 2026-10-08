import { ouvrirPageMinute } from '../telephone/notifications'
import {
  ouvrirDemarrageAutomatique,
  ouvrirFicheApp,
  ouvrirReglagesNotifications,
} from '../telephone/sonnerie'
import type { Avis as NomAvis } from './blocage'

interface Props {
  // Ceux que `avisDesRappels` retient, dans l'ordre.
  avis: NomAvis[]
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

const PARAMETRES = 'Ouvrir les Paramètres du téléphone'

// Les avis de la rubrique quand un rappel est activé mais qu'Android, ou la
// surcouche du fabricant, l'empêchera d'arriver (textes validés par le porteur
// du projet, 2026-10-07). Chacun se relit au retour des réglages.
export function AvisRappels({ avis, onMinuteOuverte }: Props) {
  const textes: Record<NomAvis, [string, string, () => void]> = {
    notifications: [
      'Android bloque les notifications de l’app : aucun rappel ne s’affichera.',
      PARAMETRES,
      ouvrirReglagesNotifications,
    ],
    minute: [
      'Sans l’autorisation « Alarmes et rappels », les rappels peuvent arriver en retard.',
      'Autoriser',
      async () => {
        await ouvrirPageMinute()
        onMinuteOuverte()
      },
    ],
    arrierePlan: [
      'Android interdit à l’app de travailler en arrière-plan : aucun rappel ne viendra.',
      PARAMETRES,
      ouvrirFicheApp,
    ],
    demarrage: [
      'Le démarrage automatique est désactivé : si l’app est fermée, le téléphone ne la réveille pas et le rappel ne vient pas.',
      'Ouvrir la page',
      ouvrirDemarrageAutomatique,
    ],
    batterie: [
      'L’économiseur de batterie peut bloquer les rappels.',
      'Régler la batterie',
      ouvrirFicheApp,
    ],
  }
  return (
    <>
      {avis.map((nom) => {
        const [texte, bouton, onOuvrir] = textes[nom]
        return <Avis key={nom} texte={texte} bouton={bouton} onOuvrir={onOuvrir} />
      })}
    </>
  )
}
