import type { MouseEvent } from 'react'
import { Link } from 'react-router'
import { QuandPriere } from '../composants/QuandPriere'
import { ecrireHeure } from '../office/heure'
import { heuresDuJour } from '../office/heures'
import { cheminOffice, NOMS_OFFICES, type NomOffice } from '../office/modele'
import { priereMarialeDu } from '../prieres/angelus'
import { estAngelus, type Angelus } from '../rappels/reglages'
import { PRIERES_MARIALES } from '../recueil/angelus'
import type { Journee } from './moment'
import './ListeJournee.css'

interface Props {
  date: string
  // Les lignes, dans leur ordre : la journée choisie sur l'accueil, les sept
  // offices sur la page « Offices du jour ».
  prieres: readonly (NomOffice | Angelus)[]
  journee?: Journee
  // Sans aucun texte (premier lancement sans réseau), les offices sont atténués.
  indisponibles?: boolean
  // L'office d'où l'on vient, quand on a ouvert le menu depuis lui.
  enCours?: string
  // Depuis une page du menu, l'écran choisi remplace le menu et sa page.
  ouvrir?: (chemin: string) => void
}

// Les prières de la journée, une ligne chacune, la même sur l'accueil et sur
// la page « Offices du jour » (demande du porteur du projet, 2026-10-20).
// Sous l'heure, la durée, pour choisir ce qu'on a le temps de prier (US-59).
// Une prière passée est atténuée, mais s'ouvre comme les autres. Celle du
// moment porte le badge « Prière du moment » (il remplace l'encadré
// d'origine, 2026-10-07) ; l'office d'où l'on vient, à la même place, le
// badge « En cours », qui l'emporte (2026-10-20). Chaque Angélus vient avant
// l'office de la même heure, et devient le Regina Caeli au temps pascal ; il
// se prie sans réseau (phase 19).
export function ListeJournee({ date, prieres, journee, indisponibles, enCours, ouvrir }: Props) {
  const heures = heuresDuJour(date)
  const mariale = PRIERES_MARIALES[priereMarialeDu(date)]
  return (
    <ul className="accueil-offices" aria-label="Offices du jour">
      {prieres.map((priere) => {
        const heure = heures[priere]
        const duMoment = journee?.moment === priere && heure !== undefined
        const angelus = estAngelus(priere)
        const etat = indisponibles && !angelus ? 'passe' : journee?.etats[priere]
        const vers = angelus ? `/priere/${priereMarialeDu(date)}` : cheminOffice(priere, date)
        const ici = priere === enCours
        const toucher = ouvrir
          ? (e: MouseEvent) => {
              e.preventDefault()
              ouvrir(vers)
            }
          : undefined
        return (
          <li key={priere} data-etat={etat}>
            <Link
              className="avec-chevron"
              to={vers}
              replace={ouvrir !== undefined}
              onClick={toucher}
              aria-current={ici ? 'page' : undefined}
              data-testid={duMoment ? 'moment' : undefined}
            >
              <span className="accueil-office-nom">
                {angelus ? mariale.titre : NOMS_OFFICES[priere]}
              </span>
              <QuandPriere
                priere={angelus ? 'angelus' : priere}
                heure={heure ? ecrireHeure(heure) : 'à toute heure'}
                className="accueil-office-quand"
              />
              {ici ? (
                <span className="accueil-moment accueil-en-cours">En cours</span>
              ) : (
                duMoment && <span className="accueil-moment">Prière du moment</span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
