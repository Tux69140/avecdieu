import { Link } from 'react-router'
import { insecables } from '../chapelet/typographie'
import type { Etendue } from '../aelf/cache'
import { periodeLisible } from './dates'

interface Props {
  // L'AELF n'a pas ce texte : réessayer n'y changerait rien.
  absent: boolean
  // Le jour de Pâques, l'office des lectures : un fait liturgique, pas une panne.
  paques: boolean
  // Les jours qu'on peut prier sans réseau, s'il y en a.
  enregistres?: Etendue
  onReessayer: () => void
  onAccueil: () => void
  onLaudes: () => void
}

// Ce que dit l'écran de l'office quand il n'a pas de texte à montrer. Textes
// validés par le porteur du projet (2026-10-07 et 2026-10-08).
export function AvisOffice({
  absent,
  paques,
  enregistres,
  onReessayer,
  onAccueil,
  onLaudes,
}: Props) {
  // Le jour le plus joyeux de l'année ne parle pas avec la voix des erreurs :
  // une note, et l'office suivant (2026-10-08).
  if (paques)
    return (
      <div className="office-note">
        <p>Le jour de Pâques, la Vigile pascale tient lieu d’office des lectures.</p>
        <p className="office-revenir">
          <button className="lien-discret" type="button" onClick={onLaudes}>
            Prier les laudes
          </button>
          <button className="lien-discret" type="button" onClick={onAccueil}>
            Revenir à l’accueil
          </button>
        </p>
      </div>
    )
  if (absent)
    return (
      <>
        <div className="office-erreur" role="alert">
          <p className="office-erreur-titre">
            <span aria-hidden="true">⚠ </span>L’AELF ne propose pas cet office pour ce jour.
          </p>
        </div>
        <p className="office-revenir">
          <button className="lien-discret" type="button" onClick={onAccueil}>
            Revenir à l’accueil
          </button>
        </p>
      </>
    )
  // Hors réseau : pourquoi le texte manque, puis les deux solutions
  // (textes validés par le porteur du projet, 2026-10-08).
  return (
    <div className="office-erreur" role="alert">
      {enregistres ? (
        <>
          <p className="office-erreur-titre">
            <span aria-hidden="true">⚠ </span>Cet office n’est pas enregistré sur le téléphone.
          </p>
          <p>Les textes enregistrés vont {periodeLisible(enregistres.debut, enregistres.fin)}.</p>
        </>
      ) : (
        <>
          <p className="office-erreur-titre">
            <span aria-hidden="true">⚠ </span>Les textes des offices ne sont pas encore sur le
            téléphone.
          </p>
          <p>L’app les reçoit de l’AELF par internet, puis en garde une semaine d’avance.</p>
        </>
      )}
      {/* « lui-même » ne se coupe pas à son trait d'union. */}
      <p>
        {insecables('Activez le Wi-Fi ou les données mobiles : l’office s’affichera de lui-même.')}
      </p>
      <p>Ou priez le chapelet, qui ne demande aucune connexion.</p>
      <div className="office-erreur-actions">
        <button className="btn btn-secondaire" type="button" onClick={onReessayer}>
          Réessayer
        </button>
        <Link className="btn btn-secondaire" to="/chapelet">
          Prier le chapelet
        </Link>
      </div>
    </div>
  )
}
