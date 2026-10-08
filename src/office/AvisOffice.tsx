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
  return (
    <div className="office-erreur" role="alert">
      {enregistres ? (
        <>
          <p className="office-erreur-titre">
            <span aria-hidden="true">⚠ </span>Cet office n’est pas enregistré sur le téléphone.
          </p>
          <p>
            Les textes enregistrés vont {periodeLisible(enregistres.debut, enregistres.fin)}. Pour
            ce jour-ci, connectez-vous à internet, puis réessayez.
          </p>
        </>
      ) : (
        <>
          <p className="office-erreur-titre">
            <span aria-hidden="true">⚠ </span>Les offices demandent une première connexion à
            internet.
          </p>
          <p>
            Une fois connecté, l’app enregistre une semaine de textes d’avance. Le chapelet, lui, se
            prie dès maintenant.
          </p>
        </>
      )}
      <button className="btn btn-secondaire" type="button" onClick={onReessayer}>
        Réessayer
      </button>
    </div>
  )
}
