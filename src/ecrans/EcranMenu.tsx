import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Duree } from '../composants/Duree'
import { LigneFermer } from '../composants/LigneFermer'
import { avecExposants } from '../composants/Exposants'
import { useRetour } from '../composants/retour'
import { Rubrique } from '../composants/Rubrique'
import { dateDuJour, dateLisible, estDate } from '../office/dates'
import { ecrireHeure, heuresDuJour } from '../office/heures'
import { PerleEtape } from '../office/FilDePerles'
import { NOMS_OFFICES, OFFICES } from '../office/modele'
import {
  AUTRES_PRIERES,
  PRIERES_DIRECTES,
  PRIERES_SEULES,
  type PriereSeuleId,
} from '../prieres/seules'
import './EcranMenu.css'

// Une prière seule : sa page remplace le menu, comme les autres écrans.
const lienPriere = (id: PriereSeuleId) => (
  <li key={id}>
    <Link to={`/priere/${id}`} replace>
      {PRIERES_SEULES[id].titre}
    </Link>
  </li>
)

// Le menu de l'app, ouvert par ☰ depuis l'accueil ou un office. C'est une page
// à part entière : le retour d'Android le referme. Les écrans qu'il ouvre le
// remplacent dans l'historique, si bien que leur retour ramène là d'où il a
// été ouvert. Il donne les offices du jour et le chapelet, à leur heure, comme
// le tiroir de l'app de l'AELF (demande du porteur du projet, 2026-10-07),
// et les prières seules (2026-10-08).
export function EcranMenu() {
  const fermer = useRetour()
  const naviguer = useNavigate()
  const { state } = useLocation()
  // Ouvert depuis l'accueil d'aujourd'hui, « Aujourd'hui » le referme
  // simplement ; depuis un autre jour, il ramène à aujourd'hui.
  const { depuis, office } = (state ?? {}) as { depuis?: string; office?: string }
  const aujourdhui = () =>
    depuis === dateDuJour() && !office ? fermer() : naviguer('/', { replace: true })
  const date = depuis && estDate(depuis) ? depuis : dateDuJour()
  const heures = heuresDuJour(date)
  const [officesOuverts, setOfficesOuverts] = useState(!!office)
  const [prieresOuvertes, setPrieresOuvertes] = useState(false)
  return (
    <main className="menu">
      <LigneFermer onFermer={fermer}>
        <h1>Avec Dieu</h1>
      </LigneFermer>
      <nav aria-label="Menu">
        <ul className="menu-liste">
          <li>
            <button type="button" onClick={aujourdhui}>
              Aujourd’hui
            </button>
          </li>
        </ul>
        {/* Le chapelet et les deux prières qu'on dit le plus, en accès direct ;
            les offices et les autres prières, repliés (choix du porteur du
            projet, 2026-10-08). */}
        <ul className="menu-liste menu-prieres" aria-label="Chapelet et prières">
          <li>
            <Link to="/chapelet" replace>
              <span className="menu-priere">Chapelet</span>
              <span className="menu-quand">
                <span className="menu-heure">
                  {heures.chapelet ? ecrireHeure(heures.chapelet) : ''}
                </span>
                <Duree priere="chapelet" className="menu-duree" />
              </span>
            </Link>
          </li>
          {PRIERES_DIRECTES.map(lienPriere)}
        </ul>
        <div className="menu-rubriques">
          {/* Ouvert depuis un office, on voit où l'on est et l'on passe au suivant. */}
          <Rubrique
            titre="Offices du jour"
            resume={avecExposants(dateLisible(date))}
            ouverte={officesOuverts}
            onBasculer={() => setOfficesOuverts((o) => !o)}
          >
            <ul className="menu-liste menu-prieres" aria-label="Offices du jour">
              {OFFICES.map((nom) => {
                const heure = heures[nom]
                const ouvert = nom === office
                return (
                  <li key={nom}>
                    <Link
                      to={`/office/${nom}/${date}`}
                      replace
                      aria-current={ouvert ? 'page' : undefined}
                    >
                      <span className="menu-priere">
                        {ouvert && <PerleEtape etat="courante" />}
                        {NOMS_OFFICES[nom]}
                      </span>
                      <span className="menu-quand">
                        <span className="menu-heure">
                          {heure ? ecrireHeure(heure) : 'à toute heure'}
                        </span>
                        <Duree priere={nom} className="menu-duree" />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Rubrique>
          <Rubrique
            titre="Prières"
            ouverte={prieresOuvertes}
            onBasculer={() => setPrieresOuvertes((o) => !o)}
          >
            <ul className="menu-liste" aria-label="Prières">
              {AUTRES_PRIERES.map(lienPriere)}
            </ul>
          </Rubrique>
        </div>
        <ul className="menu-liste">
          <li>
            <Link to="/reglages" replace>
              Réglages
            </Link>
          </li>
          <li>
            <Link to="/a-propos" replace>
              A propos
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}
