import { useEffect, useRef, useState } from 'react'
import { changerDeZone, textesEnregistres } from '../aelf/reserve'
import { ZONES, type Zone } from '../aelf/zones'
import { glissement } from '../composants/defilement'
import { useRemonter } from '../composants/retour'
import { PageReglages } from '../reglages/PageReglages'
import { lireReglages } from '../reglages/reglages'
import './EcranZone.css'

const PARENTE = '/reglages/offices'

// « ceux de la zone Belgique », mais « ceux du calendrier romain général ».
const ceuxDe = (zone: Zone) =>
  zone === 'romain' ? 'ceux du calendrier romain général' : `ceux de la zone ${ZONES[zone]}`

// Réglages › Offices › Zone liturgique : la liste des zones. Changer de zone
// efface les textes gardés pour prier sans connexion : une zone touchée,
// l'avertissement s'affiche sous la liste avant de valider (textes validés par
// le porteur du projet, 2026-10-08).
export function EcranZone() {
  const remonter = useRemonter(PARENTE)
  const [zone] = useState(() => lireReglages().zone)
  const [textesGardes] = useState(() => !!textesEnregistres())
  // La zone touchée, en attente de confirmation.
  const [enAttente, setEnAttente] = useState<Zone>()
  const avertissement = useRef<HTMLElement>(null)

  // L'avertissement paraît sous la liste : on l'amène à l'écran.
  useEffect(() => {
    if (enAttente)
      avertissement.current?.scrollIntoView({ block: 'nearest', behavior: glissement() })
  }, [enAttente])

  // Une autre zone : les textes enregistrés sont oubliés, puis refaits.
  const choisir = (choisie: Zone) => {
    changerDeZone(choisie)
    remonter()
  }

  const toucher = (choisie: Zone) => {
    if (choisie === zone) setEnAttente(undefined)
    else if (textesGardes) setEnAttente(choisie)
    else choisir(choisie)
  }

  return (
    <PageReglages titre="Zone liturgique" parente={PARENTE}>
      <div className="zone-liste" role="radiogroup" aria-label="Zone liturgique">
        {(Object.entries(ZONES) as [Zone, string][]).map(([cle, nom]) => (
          <label key={cle} className="zone-option">
            <input
              type="radio"
              name="zone"
              checked={(enAttente ?? zone) === cle}
              onChange={() => toucher(cle)}
            />
            {nom}
          </label>
        ))}
      </div>
      {enAttente && (
        <section ref={avertissement} className="zone-avertissement" aria-label="Changer de zone ?">
          <h2>Changer de zone ?</h2>
          <p className="reglages-texte">
            Les textes gardés pour prier sans connexion seront effacés et remplacés par{' '}
            {ceuxDe(enAttente)}. Il faudra une connexion pour les recharger, sinon aucun texte ne
            sera disponible.
          </p>
          <div className="reglages-boutons">
            <button className="btn btn-principal" type="button" onClick={() => choisir(enAttente)}>
              Changer
            </button>
            <button className="lien-discret" type="button" onClick={remonter}>
              Annuler
            </button>
          </div>
        </section>
      )}
    </PageReglages>
  )
}
