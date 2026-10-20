import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { lireAffichees, PRIERES_AFFICHABLES, type Affichees } from '../accueil/affichees'
import { AlerteRappels } from '../accueil/AlerteRappels'
import { BandeauJour } from '../accueil/BandeauJour'
import type { Forme } from '../chapelet/definition'
import { avecExposants } from '../composants/Exposants'
import { LienMenu } from '../composants/Icones'
import { QuandPriere } from '../composants/QuandPriere'
import { astre } from '../accueil/cadran'
import { Cadran } from '../accueil/Cadran'
import { useGlisserLesJours } from '../accueil/glisserLesJours'
import { useMaintenant } from '../accueil/maintenant'
import { ListeJournee } from '../accueil/ListeJournee'
import { situerOffices, type Journee } from '../accueil/moment'
import { dateCourte, dateDuJour, dateLisible, decaler, enDate, estDate } from '../office/dates'
import { ecrireHeure, minutesDe, type Heure } from '../office/heure'
import { heuresDesOffices, heuresDuJour, heuresSolairesEnService } from '../office/heures'
import { OFFICES, type NomOffice } from '../office/modele'
import { lieuDuSoleil } from '../lieu/lieu'
import { useLieu } from '../lieu/useLieu'
import { leverEtCoucher } from '../office/soleil'
import { PRIERES_RAPPELEES, type Angelus } from '../rappels/reglages'
import { lireReglages } from '../reglages/reglages'
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
  // Les prières masquées dans Réglages › Accueil n'y paraissent pas, ni sur le
  // cadran, et ne sont jamais la prière du moment (2026-10-20).
  const [affichees] = useState(lireAffichees)
  const heures = officesAffiches(heuresDesOffices(date), affichees)
  const minutes = minutesDe(maintenant)
  // Premier lancement sans réseau : aucun office ne peut s'ouvrir.
  const [sansTextes, setSansTextes] = useState(false)
  const candidates = sansTextes ? [] : PRIERES_RAPPELEES.filter((priere) => affichees[priere])
  const journee = estAujourdhui ? situerOffices(heuresDuJour(date), minutes, candidates) : undefined
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
        <LienMenu depuis={date} className="accueil-menu" />
        {/* Les jours sur la ligne du ☰ : une ligne de gagnée, pour que les
            complies tiennent dans le premier écran (2026-10-09). */}
        <nav className="accueil-jours" aria-label="Autres jours">
          <Link
            to={routeDuJour(veille, aujourdhui)}
            replace
            aria-label={`Jour précédent, ${dateLisible(veille)}`}
          >
            ‹ {avecExposants(dateCourte(veille))}
          </Link>
          {estAujourdhui ? (
            <span className="accueil-aujourdhui">Aujourd’hui</span>
          ) : (
            // Un autre jour, « Aujourd’hui » souligné d'or y ramène : « Revenir à
            // aujourd’hui » ne tient plus sur la ligne du ☰ ; le lecteur
            // d'écran, lui, l'entend en entier.
            <Link to="/" replace aria-label="Revenir à aujourd’hui">
              Aujourd’hui
            </Link>
          )}
          <Link
            to={routeDuJour(lendemain, aujourdhui)}
            replace
            aria-label={`Jour suivant, ${dateLisible(lendemain)}`}
          >
            {avecExposants(dateCourte(lendemain))} ›
          </Link>
        </nav>
      </div>
      {/* L'alerte, rare, prend sa propre ligne les jours où le téléphone
          bloque les rappels. */}
      <AlerteRappels />
      <div className="accueil-cadran" {...glisser}>
        <Cadran
          date={date}
          heures={heures}
          journee={journee}
          astre={estAujourdhui ? astre(minutes, soleil) : undefined}
          soleil={arcSolaire}
        >
          <BandeauJour date={date} onSansTextes={setSansTextes} />
        </Cadran>
      </div>
      <ListeChapeletRosaire
        date={date}
        journee={sansTextes ? undefined : journee}
        affichees={affichees}
      />
      {/* Sans aucun texte (premier lancement sans réseau), les offices sont
          atténués : le chapelet, seul en pleine couleur, est ce qui se prie
          (2026-10-08). */}
      <ListeJournee
        date={date}
        prieres={JOURNEE.filter((priere) => affichees[priere])}
        journee={journee}
        indisponibles={sansTextes}
      />
    </main>
  )
}

// Les heures des offices affichés ; un office masqué n'a pas de perle.
const officesAffiches = (
  heures: Record<NomOffice, Heure | undefined>,
  affichees: Affichees,
): Record<NomOffice, Heure | undefined> =>
  Object.fromEntries(
    OFFICES.map((nom) => [nom, affichees[nom] ? heures[nom] : undefined]),
  ) as Record<NomOffice, Heure | undefined>

// Les lignes de la journée, dans l'ordre de Réglages › Accueil.
const JOURNEE = PRIERES_AFFICHABLES.filter(
  (priere): priere is NomOffice | Angelus => priere !== 'chapelet' && priere !== 'rosaire',
)

// Le Chapelet et le Rosaire en tête de liste, au-dessus des offices (phase
// 18, décision du porteur du projet, 2026-10-09), chacun ouvrant son seuil,
// sans rien retenir (deux seuils distincts, 2026-10-09). Le Chapelet à son
// heure, celle de son rappel, approximative : du moment pendant l'heure qui
// suit, comme un office, puis atténué (2026-10-07 et 2026-10-08). Le Rosaire,
// souvent prié en plusieurs fois, n'a pas d'heure.
function ListeChapeletRosaire({
  date,
  journee,
  affichees,
}: {
  date: string
  journee?: Journee
  affichees: Affichees
}) {
  const heure = heuresDuJour(date).chapelet
  const duMoment = journee?.moment === 'chapelet'
  const [essentiel] = useState(() => lireReglages().essentiel)
  const ligne = (forme: Forme, nom: string, quand: string | undefined, etat?: string) => (
    <li data-etat={etat}>
      <Link
        className="avec-chevron"
        to={`/${forme}`}
        data-testid={etat === 'moment' ? 'moment' : undefined}
      >
        <span className="accueil-office-nom">{nom}</span>
        <QuandPriere
          priere={forme}
          heure={quand}
          approchee
          essentiel={essentiel}
          className="accueil-office-quand"
        />
        {etat === 'moment' && <span className="accueil-moment">Prière du moment</span>}
      </Link>
    </li>
  )
  // Les deux masqués, la liste disparaît avec eux.
  if (!affichees.chapelet && !affichees.rosaire) return null
  return (
    <ul className="accueil-offices accueil-chapelet" aria-label="Chapelet et Rosaire">
      {affichees.chapelet &&
        ligne(
          'chapelet',
          'Chapelet',
          heure && ecrireHeure(heure),
          duMoment ? 'moment' : journee?.etats.chapelet,
        )}
      {affichees.rosaire && ligne('rosaire', 'Rosaire', undefined)}
    </ul>
  )
}
