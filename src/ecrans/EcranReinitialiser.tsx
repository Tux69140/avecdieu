import { useRemonter } from '../composants/retour'
import { PageReglages } from '../reglages/PageReglages'
import { reinitialiserApp } from '../reglages/reinitialisation'

const PARENTE = '/reglages'

// Réglages › Réinitialiser l’app : l'explication complète, puis le bouton en
// bas (textes validés par le porteur du projet, 2026-10-07).
export function EcranReinitialiser() {
  const remonter = useRemonter(PARENTE)
  return (
    <PageReglages titre="Réinitialiser l’app ?" parente={PARENTE}>
      <p className="reglages-texte">
        Réglages, rappels, lieu et chapelet en cours sont effacés : l’app revient comme au premier
        lancement. Les textes enregistrés pour la semaine sont gardés.
      </p>
      <div className="reglages-boutons">
        <button className="btn btn-principal" type="button" onClick={() => void reinitialiserApp()}>
          Réinitialiser
        </button>
        <button className="lien-discret" type="button" onClick={remonter}>
          Annuler
        </button>
      </div>
    </PageReglages>
  )
}
