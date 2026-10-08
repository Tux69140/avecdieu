import { useRemonter } from '../composants/retour'
import { guideBatterie } from '../rappels/textes'
import { useEtatAndroid } from '../rappels/useEtatAndroid'
import { PageReglages } from '../reglages/PageReglages'
import { ouvrirFicheApp } from '../telephone/sonnerie'

const PARENTE = '/reglages/rappels'

// Rappels › « Rappels bloqués ? Régler la batterie › » : le guide de batterie
// de Xiaomi ou de Samsung, en page (textes validés par le porteur du projet,
// 2026-10-07). La page du téléphone ouverte, on revient aux rappels, dont les
// avis se relisent au retour dans l'app.
export function EcranBatterie() {
  const remonter = useRemonter(PARENTE)
  const [android] = useEtatAndroid()
  // Le téléphone se lit en un instant : le titre attend de savoir sa marque.
  if (!android) return <main className="reglages" />
  const { titre, texte, reglages } = guideBatterie(android.marque)
  return (
    <PageReglages titre={titre} parente={PARENTE}>
      <p className="reglages-texte">{texte}</p>
      <p className="reglages-texte reglages-batterie">{reglages[0]}</p>
      <div className="reglages-boutons">
        <button
          className="btn btn-principal"
          type="button"
          onClick={async () => {
            await ouvrirFicheApp()
            remonter()
          }}
        >
          Ouvrir la page
        </button>
        <button className="lien-discret" type="button" onClick={remonter}>
          Plus tard
        </button>
      </div>
    </PageReglages>
  )
}
