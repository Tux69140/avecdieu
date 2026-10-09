import { useLocation } from 'react-router'
import { avecExposants } from '../composants/Exposants'
import { LigneFermer } from '../composants/LigneFermer'
import { useQuitterLeMenu, useRemonter, type DepuisParente } from '../composants/retour'
import { dateDuJour, dateLisible, estDate } from '../office/dates'
import { OfficesDuMenu } from './MenuListes'
import './EcranMenu.css'

// Menu › Offices du jour (/menu/offices) : une page, plus un repli
// (arborescence validée par le porteur du projet, 2026-10-09). La croix
// remonte au menu ; un office choisi remplace le menu et cette page.
export function EcranMenuOffices() {
  const remonter = useRemonter()
  const ouvrir = useQuitterLeMenu()
  const { depuis, office } = (useLocation().state ?? {}) as DepuisParente
  const date = depuis && estDate(depuis) ? depuis : dateDuJour()
  return (
    <main className="menu">
      <LigneFermer onFermer={remonter}>
        <h1>Offices du jour</h1>
      </LigneFermer>
      <p className="menu-sous-titre">{avecExposants(dateLisible(date))}</p>
      <nav aria-label="Offices du jour">
        <OfficesDuMenu date={date} office={office} ouvrir={ouvrir} />
      </nav>
    </main>
  )
}
