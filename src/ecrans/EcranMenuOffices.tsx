import { useLocation, useNavigate } from 'react-router'
import { ListeJournee } from '../accueil/ListeJournee'
import { useMaintenant } from '../accueil/maintenant'
import { situerOffices } from '../accueil/moment'
import { avecExposants } from '../composants/Exposants'
import { LigneFermer } from '../composants/LigneFermer'
import { useQuitterLeMenu, useRemonter, type DepuisParente } from '../composants/retour'
import { dateDuJour, dateLisible, estDate } from '../office/dates'
import { minutesDe } from '../office/heure'
import { heuresDuJour } from '../office/heures'
import { OFFICES } from '../office/modele'
import './EcranMenu.css'

// Menu › Offices du jour (/menu/offices) : une page, plus un repli
// (arborescence validée par le porteur du projet, 2026-10-09). La croix
// remonte au menu ; un office choisi remplace le menu et cette page. Ses
// lignes sont celles de l'accueil, mais elle donne toujours les sept offices,
// même masqués sur l'accueil, et eux seuls (2026-10-20). L'office d'où le
// menu a été ouvert est deux pages plus tôt dans l'historique : y revenir
// retrouve la lecture où on l'avait laissée.
export function EcranMenuOffices() {
  const remonter = useRemonter()
  const ouvrir = useQuitterLeMenu()
  const maintenant = useMaintenant()
  const naviguer = useNavigate()
  const { depuis, office, parente } = (useLocation().state ?? {}) as DepuisParente
  const date = depuis && estDate(depuis) ? depuis : dateDuJour(maintenant)
  const journee =
    date === dateDuJour(maintenant)
      ? situerOffices(heuresDuJour(date), minutesDe(maintenant), OFFICES)
      : undefined
  return (
    <main className="menu">
      <LigneFermer onFermer={remonter}>
        <h1>Offices du jour</h1>
      </LigneFermer>
      <p className="menu-sous-titre">{avecExposants(dateLisible(date))}</p>
      <nav aria-label="Offices du jour">
        <ListeJournee
          date={date}
          prieres={OFFICES}
          journee={journee}
          enCours={office}
          reprendre={parente === '/menu' ? () => void naviguer(-2) : undefined}
          ouvrir={ouvrir}
        />
      </nav>
    </main>
  )
}
