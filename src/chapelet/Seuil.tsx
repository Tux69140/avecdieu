import { useState } from 'react'
import { Link } from 'react-router'
import { IndiceSuite } from '../composants/IndiceSuite'
import { useSuiteCachee } from '../composants/suiteCachee'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { lireAffichage, retenirAffichage, type Affichage } from './memoire'
import { joursDeLaSerie } from './serieDuJour'
import './Seuil.css'

interface Props {
  serie: SerieId
  duJour: SerieId
  date: Date
  onCommencer: () => void
}

const AFFICHAGES: [Affichage, string][] = [
  ['complet', 'Texte complet'],
  ['compact', 'Compact'],
]

// Le seuil du chapelet, entre le menu et le signe de croix : la série et ses
// mystères, puis les choix qui se font avant de prier (autre série, affichage).
export function Seuil({ serie, duJour, date, onCommencer }: Props) {
  const [affichage, setAffichage] = useState(lireAffichage)
  const { fin, cachee } = useSuiteCachee()
  const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const autres = (Object.keys(SERIES) as SerieId[]).filter((s) => s !== serie)

  const choisir = (choix: Affichage) => {
    setAffichage(choix)
    retenirAffichage(choix)
  }

  return (
    <main className="seuil">
      <header className="seuil-entete">
        <p className="etiquette">
          {serie === duJour ? `Chapelet du jour · ${jour}` : `Chapelet · ${jour}`}
        </p>
        <h1>{SERIES[serie].titre}</h1>
      </header>
      <ol className="seuil-mysteres" aria-label="Les cinq mystères">
        {SERIES[serie].mysteres.map((titre) => (
          <li key={titre}>{titre}</li>
        ))}
      </ol>
      <button className="btn btn-principal seuil-commencer" type="button" onClick={onCommencer}>
        Commencer le chapelet
      </button>

      <section className="seuil-section" aria-labelledby="seuil-autres">
        <h2 id="seuil-autres">Prier d’autres mystères</h2>
        <ul className="seuil-series">
          {autres.map((autre) => (
            <li key={autre}>
              <Link to={autre === duJour ? '/chapelet' : `/chapelet/${autre}`}>
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
        <div className="bascule" role="radiogroup" aria-labelledby="seuil-affichage">
          {AFFICHAGES.map(([valeur, libelle]) => (
            <button
              key={valeur}
              type="button"
              role="radio"
              aria-checked={affichage === valeur}
              onClick={() => choisir(valeur)}
            >
              {libelle}
            </button>
          ))}
        </div>
        <p className="seuil-aide">
          Compact : le nom de la prière et le compteur, pour qui la sait par cœur.
        </p>
      </section>
      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee} />
    </main>
  )
}
