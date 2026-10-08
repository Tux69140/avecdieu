import { Link, useLocation, useNavigate } from 'react-router'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour } from '../composants/retour'
import { dateDuJour, dateLisible, estDate } from '../office/dates'
import { ecrireHeure, heuresDuJour } from '../office/heures'
import { PerleEtape } from '../office/FilDePerles'
import { NOMS_OFFICES, OFFICES } from '../office/modele'
import './EcranMenu.css'

// Le menu de l'app, ouvert par ☰ depuis l'accueil ou un office. C'est une page
// à part entière : le retour d'Android le referme. Les écrans qu'il ouvre le
// remplacent dans l'historique, si bien que leur retour ramène là d'où il a
// été ouvert. Il donne les offices du jour et le chapelet, à leur heure, comme
// le tiroir de l'app de l'AELF (demande du porteur du projet, 2026-10-07).
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
        <h2 className="menu-jour">{dateLisible(date)}</h2>
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
                  <span className="menu-heure">{heure ? ecrireHeure(heure) : 'à toute heure'}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        {/* Le chapelet, son propre groupe sous les offices, comme sur l'accueil
            (décision du porteur du projet, 2026-10-08). */}
        <ul className="menu-liste menu-prieres menu-chapelet" aria-label="Chapelet">
          <li>
            <Link to="/chapelet" replace>
              <span className="menu-priere">Chapelet</span>
              <span className="menu-heure">
                {heures.chapelet ? ecrireHeure(heures.chapelet) : ''}
              </span>
            </Link>
          </li>
        </ul>
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
