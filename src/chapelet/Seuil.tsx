import { useState } from 'react'
import { Link } from 'react-router'
import { Duree } from '../composants/Duree'
import { avecExposants } from '../composants/Exposants'
import { IndiceSuite } from '../composants/IndiceSuite'
import { Interrupteur } from '../composants/Interrupteur'
import { LigneFermer } from '../composants/LigneFermer'
import { LignePage } from '../composants/LignePage'
import { useRetour, type DepuisParente } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateDuJour, dateLisible } from '../office/dates'
import { usePeutVibrer } from '../telephone/retours'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { ChoixAffichage } from './ChoixAffichage'
import { AIDE_PLUSIEURS, AIDE_VIBRATIONS, CHAPELET_OU_ROSAIRE, ESSENTIEL } from './libelles'
import { lireReglages, modifierReglages, type Forme, type Reglages } from './reglages'
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
  const [reglages, setReglages] = useState(lireReglages)
  const retour = useRetour()
  // Sans vibreur (tablette), le réglage n'a pas lieu d'être.
  const vibreur = usePeutVibrer()
  const { fin, cachee } = useSuiteCachee()
  const modifier = (changement: Partial<Reglages>) => setReglages(modifierReglages(changement))
  const rosaire = forme === 'rosaire'

  return (
    <main className="seuil" data-forme={forme}>
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
          <Link className="lien-discret" to="/chapelet-ou-rosaire">
            {CHAPELET_OU_ROSAIRE.titre}
            <span aria-hidden="true">{'\u00a0›'}</span>
          </Link>
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
        <h2 id="seuil-affichage">Affichage des prières</h2>
        <ChoixAffichage
          titre="seuil-affichage"
          affichage={reglages.affichage}
          onChoisir={(affichage) => modifier({ affichage })}
        />
        {/* Seul ou en groupe se décide au moment de prier : le même réglage
            que dans les réglages (choix du porteur du projet, 2026-10-08). */}
        <div className="seuil-interrupteurs">
          {/* Le cœur seul, sans les prières d'usage (phase 18). */}
          <Interrupteur
            libelle={ESSENTIEL.libelle}
            aide={ESSENTIEL.aide}
            actif={reglages.essentiel}
            onBasculer={(essentiel) => modifier({ essentiel })}
          />
          {vibreur && (
            <Interrupteur
              libelle="Vibrations"
              aide={AIDE_VIBRATIONS}
              actif={reglages.vibrations}
              onBasculer={(vibrations) => modifier({ vibrations })}
            />
          )}
          <Interrupteur
            libelle="Prier à plusieurs"
            aide={AIDE_PLUSIEURS}
            actif={reglages.plusieurs}
            onBasculer={(plusieurs) => modifier({ plusieurs })}
          />
        </div>
      </section>

      {/* Les autres séries, en lignes directes : ni accordéon ni fenêtre
          (décision du porteur du projet, 2026-10-08). Changer de mystères
          remplace le seuil : le retour ramène d'où l'on venait, sans repasser
          par chaque série parcourue. */}
      {!rosaire && (
        <section className="seuil-section" aria-labelledby="seuil-autres">
          <h2 id="seuil-autres">Prier d’autres mystères</h2>
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
        <Link
          className="lien-discret"
          to="/reglages/chapelet/prieres"
          state={{ revenir: true, rosaire } satisfies DepuisParente}
        >
          {rosaire ? 'Prières du Rosaire' : 'Prières du chapelet'}
          <span aria-hidden="true">{'\u00a0›'}</span>
        </Link>
      </p>

      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee} />
    </main>
  )
}
