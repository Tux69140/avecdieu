import { Link } from 'react-router'
import { useRetour } from '../composants/retour'
import { dateDuJour, dateLisible } from '../office/dates'
import { ecrireHeure, heuresDesOffices } from '../office/heures'
import { NOMS_OFFICES, OFFICES } from '../office/modele'
import './EcranOffices.css'

// Les sept offices du jour, chacun à son heure, ouverts depuis le menu. Écran
// d'attente : l'accueil « Aujourd'hui » (phase 8) le remplacera.
export function EcranOffices() {
  const retour = useRetour()
  const date = dateDuJour()
  const heures = heuresDesOffices()
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
        {OFFICES.map((office) => {
          const heure = heures[office]
          return (
            <li key={office}>
              <Link to={`/office/${office}/${date}`}>
                <span className="offices-heure">{heure && `${ecrireHeure(heure)} `}</span>
                <span className="offices-nom">{NOMS_OFFICES[office]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
