import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { LigneFermer } from '../composants/LigneFermer'
import { QuandPriere } from '../composants/QuandPriere'
import { avecExposants } from '../composants/Exposants'
import { useRetour, type DepuisParente } from '../composants/retour'
import { dateDuJour, dateLisible, estDate } from '../office/dates'
import { ecrireHeure } from '../office/heure'
import { heuresDuJour } from '../office/heures'
import { PRIERES_DIRECTES } from '../prieres/seules'
import { lireReglages } from '../reglages/reglages'
import { LienPriere, OfficesDuMenu } from './MenuListes'
import './EcranMenu.css'

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
  const [essentiel] = useState(() => lireReglages().essentiel)
  return (
    <main className="menu">
      <LigneFermer onFermer={fermer}>
        <h1>Avec Dieu</h1>
      </LigneFermer>
      <nav aria-label="Menu">
        <ul className="menu-liste">
          <li>
            <button className="avec-chevron" type="button" onClick={aujourdhui}>
              Aujourd’hui
            </button>
          </li>
        </ul>
        {/* Le Chapelet, le Rosaire (phase 18) et les deux prières qu'on dit le
            plus, en accès direct ; les offices et les autres prières, repliés
            (choix du porteur du projet, 2026-10-08). Le Chapelet et le Rosaire
            ouvrent chacun leur seuil (2026-10-09) ; comme sur l'accueil, l'heure du chapelet est approximative et le
            Rosaire n'en a pas. */}
        <ul className="menu-liste menu-prieres" aria-label="Chapelet et prières">
          <li>
            <Link className="avec-chevron" to="/chapelet" replace>
              <span className="menu-priere">Chapelet</span>
              <QuandPriere
                priere="chapelet"
                heure={heures.chapelet && ecrireHeure(heures.chapelet)}
                approchee
                essentiel={essentiel}
                discret
              />
            </Link>
          </li>
          <li>
            <Link className="avec-chevron" to="/rosaire" replace>
              <span className="menu-priere">Rosaire</span>
              <QuandPriere priere="rosaire" essentiel={essentiel} discret />
            </Link>
          </li>
          {PRIERES_DIRECTES.map((id) => (
            <LienPriere key={id} id={id} />
          ))}
        </ul>
        {/* Offices du jour et autres prières sur leur page, plus en repli
            (arborescence validée par le porteur du projet, 2026-10-09).
            Ouvert depuis un office, les offices sont là, sans un geste de
            plus : on voit où l'on est et l'on passe au suivant. */}
        {office ? (
          <OfficesDuMenu date={date} office={office} />
        ) : (
          <ul className="menu-liste">
            <li>
              <Link
                className="avec-chevron"
                to="/menu/offices"
                state={{ parente: '/menu', depuis: date } satisfies DepuisParente}
              >
                <span className="menu-ligne">
                  Offices du jour
                  <span className="menu-ligne-resume">{avecExposants(dateLisible(date))}</span>
                </span>
              </Link>
            </li>
            <li>
              <Link
                className="avec-chevron"
                to="/menu/prieres"
                state={{ parente: '/menu' } satisfies DepuisParente}
              >
                Prières
              </Link>
            </li>
          </ul>
        )}
        <ul className="menu-liste">
          <li>
            <Link className="avec-chevron" to="/reglages" replace>
              Réglages
            </Link>
          </li>
          <li>
            <Link className="avec-chevron" to="/a-propos" replace>
              A propos
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}
