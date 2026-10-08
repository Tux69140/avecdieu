import { useState } from 'react'
import { Link } from 'react-router'
import { avecExposants } from '../composants/Exposants'
import { IndiceSuite } from '../composants/IndiceSuite'
import { Interrupteur } from '../composants/Interrupteur'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateDuJour, dateLisible } from '../office/dates'
import { usePeutVibrer } from '../telephone/retours'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { ChoixAffichage } from './ChoixAffichage'
import { AIDE_VIBRATIONS } from './libelles'
import { lireReglages, modifierReglages, type Reglages } from './reglages'
import { libelleReprise, type ChapeletEnCours } from './reprise'
import { joursDeLaSerie } from './serieDuJour'
import './Seuil.css'

interface Props {
  serie: SerieId
  duJour: SerieId
  date: Date
  // Le chapelet de cette série commencé aujourd'hui, s'il y en a un.
  enCours: ChapeletEnCours | null
  onCommencer: () => void
  onRecommencer: () => void
}

// Le seuil du chapelet, entre l'accueil et le signe de croix : la série et ses
// mystères, puis les choix qui se font avant de prier (autre série, affichage,
// vibrations). Les habitudes qu'on règle une fois sont dans les réglages.
export function Seuil({ serie, duJour, date, enCours, onCommencer, onRecommencer }: Props) {
  const [reglages, setReglages] = useState(lireReglages)
  const retour = useRetour()
  // Sans vibreur (tablette), le réglage n'a pas lieu d'être.
  const vibreur = usePeutVibrer()
  const { fin, cachee } = useSuiteCachee()
  const autres = (Object.keys(SERIES) as SerieId[]).filter((s) => s !== serie)
  const modifier = (changement: Partial<Reglages>) => setReglages(modifierReglages(changement))

  return (
    <main className="seuil">
      <header className="seuil-entete">
        {/* La croix sur la ligne de la date, comme dans un office : le titre
            de la série garde sa place, juste dessous. */}
        <LigneFermer onFermer={retour}>
          <p className="ligne-date">{avecExposants(dateLisible(dateDuJour(date)))}</p>
        </LigneFermer>
        <h1>{SERIES[serie].titre}</h1>
      </header>
      <ol className="seuil-mysteres" aria-label="Les cinq mystères">
        {SERIES[serie].mysteres.map((titre) => (
          <li key={titre}>{titre}</li>
        ))}
      </ol>
      <button className="btn btn-principal seuil-commencer" type="button" onClick={onCommencer}>
        {enCours ? libelleReprise(enCours) : 'Commencer le chapelet'}
      </button>
      {enCours && (
        <p className="seuil-recommencer">
          <button className="lien-discret" type="button" onClick={onRecommencer}>
            Recommencer du début
          </button>
        </p>
      )}

      <section className="seuil-section" aria-labelledby="seuil-autres">
        <h2 id="seuil-autres">Prier d’autres mystères</h2>
        <ul className="seuil-series">
          {autres.map((autre) => (
            <li key={autre}>
              {/* Changer de mystères remplace le seuil : le retour ramène d'où l'on
                  venait, sans repasser par chaque série parcourue. */}
              <Link to={autre === duJour ? '/chapelet' : `/chapelet/${autre}`} replace>
                <span className="seuil-serie-nom">{SERIES[autre].titre}</span>
                <span className="seuil-serie-jours">
                  {joursDeLaSerie(autre)}
                  {autre === duJour && ' · aujourd’hui'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="seuil-section" aria-labelledby="seuil-affichage">
        <h2 id="seuil-affichage">Affichage des prières</h2>
        <ChoixAffichage
          titre="seuil-affichage"
          affichage={reglages.affichage}
          onChoisir={(affichage) => modifier({ affichage })}
        />
      </section>

      {vibreur && (
        <div className="seuil-section">
          <Interrupteur
            libelle="Vibrations"
            aide={AIDE_VIBRATIONS}
            actif={reglages.vibrations}
            onBasculer={(vibrations) => modifier({ vibrations })}
          />
        </div>
      )}

      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee} />
    </main>
  )
}
