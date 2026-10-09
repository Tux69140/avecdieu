import { BoutonAide } from '../composants/BoutonAide'
import { avecExposants } from '../composants/Exposants'
import { LigneFermer } from '../composants/LigneFermer'
import { dateDuJour, dateLisible } from '../office/dates'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { repereSerie } from './libelles'

interface Props {
  date: Date
  // Au Rosaire, la série où l'on en est ; au chapelet, celle du seuil.
  serie: SerieId
  rosaire: boolean
  onFermer: () => void
  onAide: () => void
}

export function EnteteChapelet({ date, serie, rosaire, onFermer, onAide }: Props) {
  return (
    <header className="chapelet-entete">
      {/* La croix ramène là d'où le seuil a été ouvert, comme le retour
          d'Android : le seuil ne reste pas derrière la prière (décision du
          porteur du projet, 2026-10-09). Un toucher sur elle n'avance pas
          le chapelet (useGestesChapelet). */}
      <LigneFermer onFermer={onFermer}>
        <p className="ligne-date">{avecExposants(dateLisible(dateDuJour(date)))}</p>
        {/* En face de la croix, « ? » rouvre l'aide aux gestes, comme dans
            l'office (2026-10-08). */}
        <BoutonAide libelle="Aide aux gestes" onClick={onAide} />
      </LigneFermer>
      <h1>{SERIES[serie].titre}</h1>
      {/* Au Rosaire, où l'on en est des quatre séries, toujours visible. */}
      {rosaire && (
        <p className="repere-serie" data-testid="repere-serie">
          {repereSerie(serie)}
        </p>
      )}
    </header>
  )
}
