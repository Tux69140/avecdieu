import { Link } from 'react-router'
import { useRetour } from '../composants/retour'
import './EcranMenu.css'

// Le menu de l'app, ouvert par ☰ depuis le seuil. C'est une page à part
// entière : le retour d'Android le referme. Les écrans qu'il ouvre le
// remplacent dans l'historique, si bien que leur retour ramène au seuil.
export function EcranMenu() {
  const fermer = useRetour()
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
            <button type="button" onClick={fermer}>
              Chapelet
            </button>
          </li>
          <li className="menu-a-venir" aria-disabled="true">
            Offices <span>à venir</span>
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
