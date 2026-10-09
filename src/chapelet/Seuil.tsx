import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bascule } from '../composants/Bascule'
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
import { AIDE_PLUSIEURS, AIDE_VIBRATIONS, CHAPELET_OU_ROSAIRE } from './libelles'
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

// Chaque forme avec sa durée sous le mot : « Chapelet, vingt minutes » au
// lecteur d'écran (US-59).
const FORMES = (['chapelet', 'rosaire'] as const).map(
  (forme) =>
    [
      forme,
      <>
        <span className="seuil-forme-nom">{forme === 'chapelet' ? 'Chapelet' : 'Rosaire'}</span>
        <Duree priere={forme} className="seuil-forme-duree" />
      </>,
    ] as const,
)

// Le seuil du chapelet, entre l'accueil et le signe de croix (phase 17,
// organisation validée par le porteur du projet, 2026-10-08) : le choix du
// chapelet ou du Rosaire et ce qu'on va prier, le bouton, puis, plus calmes,
// les choix qui se font avant de prier, les autres séries et les prières dites.
export function Seuil({ forme, serie, duJour, date, enCours, onCommencer, onRecommencer }: Props) {
  const [reglages, setReglages] = useState(lireReglages)
  const retour = useRetour()
  const naviguer = useNavigate()
  // Sans vibreur (tablette), le réglage n'a pas lieu d'être.
  const vibreur = usePeutVibrer()
  const { fin, cachee } = useSuiteCachee()
  const modifier = (changement: Partial<Reglages>) => setReglages(modifierReglages(changement))
  const rosaire = forme === 'rosaire'
  // Le choix est retenu ; le seuil passe de /chapelet à /rosaire sans
  // s'empiler dans l'historique.
  const choisirForme = (choisie: Forme) => {
    if (choisie === forme) return
    modifier({ forme: choisie })
    void naviguer(choisie === 'rosaire' ? '/rosaire' : '/chapelet', { replace: true })
  }

  return (
    <main className="seuil" data-forme={forme}>
      <header className="seuil-entete">
        <LigneFermer onFermer={retour}>
          <p className="ligne-date">{avecExposants(dateLisible(dateDuJour(date)))}</p>
        </LigneFermer>
        <Bascule
          className="seuil-forme"
          nom="Chapelet ou Rosaire"
          choix={FORMES}
          valeur={forme}
          onChoisir={choisirForme}
        />
        <p className="seuil-aide">
          <Link className="lien-discret" to="/chapelet-ou-rosaire">
            {CHAPELET_OU_ROSAIRE.titre}
            <span aria-hidden="true">{'\u00a0›'}</span>
          </Link>
        </p>
      </header>

      <h1>{rosaire ? 'Rosaire' : SERIES[serie].titre}</h1>
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
