import { Link } from 'react-router'
import { useRetour } from '../composants/retour'
import { dateDuJour, dateLisible } from '../office/dates'
import { NOMS_OFFICES, OFFICES } from '../office/modele'
import './EcranOffices.css'

// Les sept offices du jour, ouverts depuis le menu. Écran d'attente : l'accueil
// « Aujourd'hui » (phase 8) le remplacera.
export function EcranOffices() {
  const retour = useRetour()
  const date = dateDuJour()
  return (
    <main className="offices">
      <button className="retour lien-discret" type="button" onClick={retour}>
        ‹ Retour
      </button>
      <header className="offices-entete">
        <p className="offices-date">{dateLisible(date)}</p>
        <h1>Offices du jour</h1>
      </header>
      <ul className="offices-liste">
        {OFFICES.map((office) => (
          <li key={office}>
            <Link to={`/office/${office}/${date}`}>{NOMS_OFFICES[office]}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
