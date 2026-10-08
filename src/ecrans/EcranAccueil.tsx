import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { AlerteRappels } from '../accueil/AlerteRappels'
import { BandeauJour } from '../accueil/BandeauJour'
import { astre } from '../accueil/cadran'
import { Cadran } from '../accueil/Cadran'
import { useGlisserLesJours } from '../accueil/glisserLesJours'
import { minutesDe, useMaintenant } from '../accueil/maintenant'
import { situerOffices, type Journee } from '../accueil/moment'
import { dateCourte, dateDuJour, dateLisible, decaler, enDate, estDate } from '../office/dates'
import {
  ecrireHeure,
  heuresDesOffices,
  heuresDuJour,
  heuresSolairesEnService,
} from '../office/heures'
import { NOMS_OFFICES, OFFICES } from '../office/modele'
import { lieuDuSoleil } from '../lieu/lieu'
import { useLieu } from '../lieu/useLieu'
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
  // Un lieu changé en voyage redessine le cadran sans attendre la minute.
  useLieu()
  const estAujourdhui = date === aujourdhui
  const heures = heuresDesOffices(date)
  const minutes = minutesDe(maintenant)
  const journee = estAujourdhui ? situerOffices(heures, minutes) : undefined
  const { lever, coucher } = leverEtCoucher(enDate(date), lieuDuSoleil())
  const soleil = { lever: minutesDe(lever), coucher: minutesDe(coucher) }
  // En heures solaires, l'arc va du lever au coucher (hors des cercles polaires).
  const arcSolaire =
    heuresSolairesEnService() && !Number.isNaN(soleil.lever + soleil.coucher) ? soleil : undefined
  const veille = decaler(date, -1)
  const lendemain = decaler(date, 1)
  // Changer de jour remplace l'adresse : le retour d'Android quitte l'accueil
  // au lieu de repasser par chaque jour parcouru.
  const naviguer = useNavigate()
  const glisser = useGlisserLesJours((sens) =>
    naviguer(routeDuJour(sens === 1 ? lendemain : veille, aujourdhui), { replace: true }),
  )
  return (
    <main className="accueil">
      <div className="accueil-haut">
        <Link className="bouton-menu" to="/menu" state={{ depuis: date }} aria-label="Menu">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </Link>
        <AlerteRappels />
      </div>
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
      <div className="accueil-cadran" {...glisser}>
        <Cadran
          date={date}
          heures={heures}
          journee={journee}
          astre={estAujourdhui ? astre(minutes, soleil) : undefined}
          soleil={arcSolaire}
        >
          <BandeauJour date={date} />
        </Cadran>
      </div>
      <ListeOffices date={date} journee={journee} />
      <LigneChapelet date={date} minutes={estAujourdhui ? minutes : undefined} />
    </main>
  )
}

// Les sept offices ; l'office des lectures, sans heure, se dit à toute heure.
// Un office passé est atténué, mais s'ouvre comme les autres. L'office du
// moment porte le badge « Prière du moment » (il remplace l'encadré
// d'origine, à la demande du porteur du projet, 2026-10-07).
function ListeOffices({ date, journee }: { date: string; journee?: Journee }) {
  const heures = heuresDesOffices(date)
  return (
    <ul className="accueil-offices" aria-label="Offices du jour">
      {OFFICES.map((office) => {
        const heure = heures[office]
        const duMoment = journee?.moment === office && heure !== undefined
        return (
          <li key={office} data-etat={journee?.etats[office]}>
            <Link to={`/office/${office}/${date}`} data-testid={duMoment ? 'moment' : undefined}>
              <span className="accueil-office-nom">{NOMS_OFFICES[office]}</span>
              <span className="accueil-office-heure">
                {heure ? ecrireHeure(heure) : 'à toute heure'}
              </span>
              {duMoment && <span className="accueil-moment">Prière du moment</span>}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

// Le chapelet sous les offices, à son heure (celle des rappels), atténué une
// fois l'heure passée (demande du porteur du projet, 2026-10-07).
function LigneChapelet({ date, minutes }: { date: string; minutes?: number }) {
  const heure = heuresDuJour(date).chapelet
  const passe =
    minutes !== undefined && heure !== undefined && heure.heures * 60 + heure.minutes <= minutes
  return (
    <ul className="accueil-offices accueil-chapelet" aria-label="Chapelet">
      <li data-etat={passe ? 'passe' : undefined}>
        <Link to="/chapelet">
          <span className="accueil-office-nom">Chapelet</span>
          <span className="accueil-office-heure">{heure ? ecrireHeure(heure) : ''}</span>
        </Link>
      </li>
    </ul>
  )
}
