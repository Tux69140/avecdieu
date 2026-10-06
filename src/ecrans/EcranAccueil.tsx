import { Link, Navigate, useParams } from 'react-router'
import { BandeauJour } from '../accueil/BandeauJour'
import { astre } from '../accueil/cadran'
import { Cadran } from '../accueil/Cadran'
import { minutesDe, useMaintenant } from '../accueil/maintenant'
import { ecrireEcart, situerOffices, type Journee } from '../accueil/moment'
import { dateCourte, dateDuJour, dateLisible, decaler, enDate, estDate } from '../office/dates'
import { ecrireHeure, heuresDesOffices } from '../office/heures'
import { NOMS_OFFICES, OFFICES } from '../office/modele'
import { leverEtCoucher } from '../office/soleil'
import './EcranAccueil.css'

const routeDuJour = (date: string, aujourdhui: string) =>
  date === aujourdhui ? '/' : `/jour/${date}`

// L'accueil « Aujourd'hui » (/) ou d'un autre jour (/jour/AAAA-MM-JJ). Passé
// minuit, l'accueil du jour passe de lui-même au lendemain.
export function EcranAccueil() {
  const { date: demandee } = useParams()
  const maintenant = useMaintenant()
  const aujourdhui = dateDuJour(maintenant)
  if (demandee !== undefined && (!estDate(demandee) || demandee === aujourdhui))
    return <Navigate to="/" replace />
  const date = demandee ?? aujourdhui
  return <Accueil key={date} date={date} aujourdhui={aujourdhui} maintenant={maintenant} />
}

interface Props {
  date: string
  aujourdhui: string
  maintenant: Date
}

function Accueil({ date, aujourdhui, maintenant }: Props) {
  const estAujourdhui = date === aujourdhui
  const heures = heuresDesOffices()
  const minutes = minutesDe(maintenant)
  const journee = estAujourdhui ? situerOffices(heures, minutes) : undefined
  const soleil = leverEtCoucher(enDate(date))
  const veille = decaler(date, -1)
  const lendemain = decaler(date, 1)
  // Changer de jour remplace l'adresse : le retour d'Android quitte l'accueil
  // au lieu de repasser par chaque jour parcouru.
  return (
    <main className="accueil">
      <Link className="bouton-menu" to="/menu" state={{ depuis: date }} aria-label="Menu">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </Link>
      <nav className="accueil-jours" aria-label="Autres jours">
        <Link
          to={routeDuJour(veille, aujourdhui)}
          replace
          aria-label={`Jour précédent, ${dateLisible(veille)}`}
        >
          ‹ {dateCourte(veille)}
        </Link>
        {estAujourdhui ? (
          <span className="accueil-aujourdhui">Aujourd’hui</span>
        ) : (
          <Link to="/" replace>
            Revenir à aujourd’hui
          </Link>
        )}
        <Link
          to={routeDuJour(lendemain, aujourdhui)}
          replace
          aria-label={`Jour suivant, ${dateLisible(lendemain)}`}
        >
          {dateCourte(lendemain)} ›
        </Link>
      </nav>
      <Cadran
        date={date}
        heures={heures}
        journee={journee}
        astre={
          estAujourdhui
            ? astre(minutes, { lever: minutesDe(soleil.lever), coucher: minutesDe(soleil.coucher) })
            : undefined
        }
      >
        <BandeauJour date={date} />
      </Cadran>
      {journee && <PriereDuMoment date={date} journee={journee} minutes={minutes} />}
      <ListeOffices date={date} journee={journee} />
    </main>
  )
}

// Tout l'encadré se touche ; le chevron d'or, à droite, centré sur ses trois
// lignes (idée du porteur du projet, 2026-10-06).
function PriereDuMoment({
  date,
  journee,
  minutes,
}: {
  date: string
  journee: Journee
  minutes: number
}) {
  const office = journee.moment
  const heure = office && heuresDesOffices()[office]
  if (!office || !heure) return null
  return (
    <Link className="accueil-moment" to={`/office/${office}/${date}`} data-testid="moment">
      <span className="etiquette">Prière du moment</span>
      <span className="accueil-moment-nom">{NOMS_OFFICES[office]}</span>
      <span className="accueil-moment-heure">
        {ecrireHeure(heure)} · {ecrireEcart(heure, minutes)}
      </span>
    </Link>
  )
}

// Les sept offices ; l'office des lectures, sans heure, se dit à toute heure.
// Un office passé est atténué, mais s'ouvre comme les autres.
function ListeOffices({ date, journee }: { date: string; journee?: Journee }) {
  const heures = heuresDesOffices()
  return (
    <ul className="accueil-offices" aria-label="Offices du jour">
      {OFFICES.map((office) => {
        const heure = heures[office]
        return (
          <li key={office} data-etat={journee?.etats[office]}>
            <Link to={`/office/${office}/${date}`}>
              <span className="accueil-office-nom">{NOMS_OFFICES[office]}</span>
              <span className="accueil-office-heure">
                {heure ? ecrireHeure(heure) : 'à toute heure'}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
