import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { chargerJour } from '../aelf/api'
import { textesEnregistres } from '../aelf/reserve'
import { avecExposants } from '../composants/Exposants'
import { dateLisible } from '../office/dates'
import { presenterJour, type Bandeau } from './bandeau'
import '../styles/perle-liturgique.css'

// « premiere » : aucun texte enregistré, l'app n'a encore jamais eu de réseau.
type Etat =
  | { sorte: 'chargement' }
  | { sorte: 'erreur'; premiere: boolean }
  | { sorte: 'pret'; bandeau: Bandeau }

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1)

// Sous l'arc du cadran : la date, que l'app connaît toujours, puis ce que
// l'AELF dit du jour (temps, fête ou saint, couleur). Un jour qui n'est pas
// enregistré, sans réseau, garde la date seule et dit pourquoi (textes validés
// le 2026-10-07).
export function BandeauJour({
  date,
  onSansTextes,
}: {
  date: string
  // Prévenu quand aucun texte des offices n'est disponible (premier lancement
  // sans réseau), puis quand ils le redeviennent.
  onSansTextes?: (sansTextes: boolean) => void
}) {
  const [etat, setEtat] = useState<Etat>({ sorte: 'chargement' })
  const [essai, setEssai] = useState(0)

  useEffect(() => {
    const abandon = new AbortController()
    chargerJour(date, abandon.signal).then(
      (jour) => setEtat({ sorte: 'pret', bandeau: presenterJour(jour) }),
      () => {
        if (!abandon.signal.aborted)
          setEtat({ sorte: 'erreur', premiere: textesEnregistres() === undefined })
      },
    )
    return () => abandon.abort()
  }, [date, essai])

  const reessayer = () => {
    setEtat({ sorte: 'chargement' })
    setEssai((n) => n + 1)
  }

  const sansTextes = etat.sorte === 'erreur' && etat.premiere
  useEffect(() => onSansTextes?.(sansTextes), [sansTextes, onSansTextes])

  // Le réseau revenu, le jour se charge de lui-même.
  const enPanne = etat.sorte === 'erreur'
  useEffect(() => {
    if (!enPanne) return
    window.addEventListener('online', reessayer)
    return () => window.removeEventListener('online', reessayer)
  }, [enPanne])

  const bandeau = etat.sorte === 'pret' ? etat.bandeau : {}
  return (
    <div data-testid="bandeau">
      <h1 className="bandeau-date">{avecExposants(majuscule(dateLisible(date)))}</h1>
      {bandeau.temps && <p className="bandeau-temps">{avecExposants(bandeau.temps)}</p>}
      {bandeau.titre && <p className="bandeau-titre">{avecExposants(bandeau.titre)}</p>}
      {bandeau.couleur && (
        <span
          className="bandeau-pastille repere-perle"
          data-couleur={bandeau.couleur}
          role="img"
          aria-label={`Couleur liturgique : ${bandeau.couleur}`}
        />
      )}
      {etat.sorte === 'erreur' && etat.premiere && (
        <div className="bandeau-erreur" role="alert">
          <p>
            <span aria-hidden="true">⚠ </span>Les offices demandent une première connexion à
            internet. Une fois connecté, l’app enregistre une semaine de textes d’avance. Le
            chapelet, lui, se prie dès maintenant.
          </p>
          <Link className="btn btn-secondaire" to="/chapelet">
            Prier le chapelet
          </Link>
        </div>
      )}
      {etat.sorte === 'erreur' && !etat.premiere && (
        <p className="bandeau-erreur" role="alert">
          <span aria-hidden="true">⚠ </span>Ce jour n’est pas enregistré. Connectez-vous à internet,
          puis réessayez.{' '}
          <button className="lien-discret" type="button" onClick={reessayer}>
            Réessayer
          </button>
        </p>
      )}
    </div>
  )
}
