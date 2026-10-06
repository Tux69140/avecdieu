import { Link, useLocation, useNavigate } from 'react-router'
import { useRetour } from '../composants/retour'
import { dateDuJour } from '../office/dates'
import './EcranMenu.css'

// Le menu de l'app, ouvert par ☰ depuis l'accueil. C'est une page à part
// entière : le retour d'Android le referme. Les écrans qu'il ouvre le
// remplacent dans l'historique, si bien que leur retour ramène à l'accueil.
export function EcranMenu() {
  const fermer = useRetour()
  const naviguer = useNavigate()
  const { state } = useLocation()
  // Ouvert depuis l'accueil d'aujourd'hui, « Aujourd'hui » le referme
  // simplement ; depuis un autre jour, il ramène à aujourd'hui.
  const depuis = (state as { depuis?: string } | null)?.depuis
  const aujourdhui = () => (depuis === dateDuJour() ? fermer() : naviguer('/', { replace: true }))
  return (
    <main className="menu">
      <button className="menu-fermer" type="button" aria-label="Fermer le menu" onClick={fermer}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 4l12 12M16 4L4 16" />
        </svg>
      </button>
      <h1>Avec Dieu</h1>
      <nav aria-label="Menu">
        <ul className="menu-liste">
          <li>
            <button type="button" onClick={aujourdhui}>
              Aujourd’hui
            </button>
          </li>
          <li>
            <Link to="/chapelet" replace>
              Chapelet
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
              À propos
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}
