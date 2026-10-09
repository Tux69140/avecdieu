import { Duree } from '../composants/Duree'
import { avecExposants } from '../composants/Exposants'
import { IndiceSuite } from '../composants/IndiceSuite'
import { LienSuite } from '../composants/LienSuite'
import { LigneFermer } from '../composants/LigneFermer'
import { LignePage } from '../composants/LignePage'
import { useRetour, type DepuisParente } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateDuJour, dateLisible } from '../office/dates'
import { useReglages } from '../reglages/useReglages'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { ChoixAffichage } from './ChoixAffichage'
import type { Forme } from './definition'
import { InterrupteursPriere } from './InterrupteursPriere'
import { CHAPELET_OU_ROSAIRE, prieresDe } from './libelles'
import { libelleReprise, type ChapeletEnCours } from './reprise'
import { joursDeLaSerie } from './serieDuJour'
import './Seuil.css'

interface Props {
  forme: Forme
  serie: SerieId
  duJour: SerieId
  date: Date
  // Le chapelet de cette série commencé aujourd'hui, s'il y en a un.
  enCours: ChapeletEnCours | null
  onCommencer: () => void
  onRecommencer: () => void
}

const TOUTES = Object.keys(SERIES) as SerieId[]

// Le seuil du chapelet ou du Rosaire, entre l'accueil et le signe de croix
// (phase 17, organisation validée par le porteur du projet, 2026-10-08) : ce
// qu'on va prier et sa durée, le bouton, puis, plus calmes, les choix qui se
// font avant de prier, les autres séries et les prières dites. Deux seuils
// distincts, sans commutateur : on a déjà choisi le Chapelet ou le Rosaire
// sur l'accueil ou dans le menu (révisé le 2026-10-09).
export function Seuil({ forme, serie, duJour, date, enCours, onCommencer, onRecommencer }: Props) {
  const [reglages, modifier] = useReglages()
  const retour = useRetour()
  const { fin, cachee } = useSuiteCachee()
  const rosaire = forme === 'rosaire'

  return (
    <main className="seuil">
      <header className="seuil-entete">
        <LigneFermer onFermer={retour}>
          <p className="ligne-date">{avecExposants(dateLisible(dateDuJour(date)))}</p>
        </LigneFermer>
        <h1>{rosaire ? 'Rosaire' : SERIES[serie].titre}</h1>
        {/* Combien de temps prendre, avant de commencer (US-59), plus court
            avec « L’essentiel seulement ». */}
        <p className="seuil-duree">
          <Duree priere={forme} essentiel={reglages.essentiel} />
        </p>
        {/* Ce qui distingue le chapelet du Rosaire : une page à part, ouverte
            des deux seuils. */}
        <p className="seuil-aide">
          <LienSuite to="/chapelet-ou-rosaire">{CHAPELET_OU_ROSAIRE.titre}</LienSuite>
        </p>
      </header>

      {/* Ce qu'on va prier n'est qu'une indication : petit et sépia, pour que
          le bouton reste à l'écran (choix du porteur du projet, 2026-10-08). */}
      <ol
        className="seuil-mysteres"
        aria-label={rosaire ? 'Les quatre séries' : 'Les cinq mystères'}
      >
        {(rosaire ? TOUTES.map((s) => SERIES[s].titre) : SERIES[serie].mysteres).map((titre) => (
          <li key={titre}>{titre}</li>
        ))}
      </ol>
      <button className="btn btn-principal seuil-commencer" type="button" onClick={onCommencer}>
        {enCours
          ? avecExposants(libelleReprise(enCours))
          : rosaire
            ? 'Commencer le Rosaire'
            : 'Commencer le chapelet'}
      </button>
      {enCours && (
        <p className="seuil-recommencer">
          <button className="lien-discret" type="button" onClick={onRecommencer}>
            Recommencer du début
          </button>
        </p>
      )}

      <section className="seuil-section seuil-prier" aria-labelledby="seuil-affichage">
        <h2 className="petit-titre" id="seuil-affichage">
          Affichage des prières
        </h2>
        <ChoixAffichage
          titre="seuil-affichage"
          affichage={reglages.affichage}
          onChoisir={(affichage) => modifier({ affichage })}
        />
        {/* Seul ou en groupe se décide au moment de prier : le même réglage
            que dans les réglages (choix du porteur du projet, 2026-10-08). */}
        <div className="seuil-interrupteurs">
          {/* Le cœur seul, sans les prières d'usage (phase 18), en tête ; ce
              qui change la prière avant le confort, comme dans Réglages ›
              Chapelet (2026-10-09). */}
          <InterrupteursPriere
            choix={['essentiel', 'plusieurs', 'vibrations']}
            forme={forme}
            reglages={reglages}
            onModifier={modifier}
          />
        </div>
      </section>

      {/* Les autres séries, en lignes directes : ni accordéon ni fenêtre
          (décision du porteur du projet, 2026-10-08). Changer de mystères
          remplace le seuil : le retour ramène d'où l'on venait, sans repasser
          par chaque série parcourue. */}
      {!rosaire && (
        <section className="seuil-section" aria-labelledby="seuil-autres">
          <h2 className="petit-titre" id="seuil-autres">
            Prier d’autres mystères
          </h2>
          <div className="seuil-liste">
            {TOUTES.filter((s) => s !== serie).map((autre) => (
              <LignePage
                key={autre}
                vers={autre === duJour ? '/chapelet' : `/chapelet/${autre}`}
                nom={SERIES[autre].titre}
                resume={`${joursDeLaSerie(autre)}${autre === duJour ? ' · aujourd’hui' : ''}`}
                remplacer
              />
            ))}
          </div>
        </section>
      )}

      {/* Les prières dites (ouverture, dizaines, fin) : la page des réglages,
          dont la croix ramène ici. Un lien discret, comme l'aide du haut :
          une ligne à filets de plus faisait une bande vide sous la liste. Au
          Rosaire, elle porte son nom (décision du porteur du projet,
          2026-10-09) ; les réglages sont les mêmes. */}
      <p className="seuil-aide seuil-prieres">
        <LienSuite
          to="/reglages/chapelet/prieres"
          state={{ revenir: true, rosaire } satisfies DepuisParente}
        >
          {prieresDe(forme)}
        </LienSuite>
      </p>

      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee} />
    </main>
  )
}
