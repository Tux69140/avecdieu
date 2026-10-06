import { useEffect, useState } from 'react'
import { chargerJour } from '../aelf/api'
import { dateLisible } from '../office/dates'
import '../office/Repere.css'
import { presenterJour, type Bandeau } from './bandeau'

type Etat = { sorte: 'chargement' } | { sorte: 'erreur' } | { sorte: 'pret'; bandeau: Bandeau }

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1)

// « 27e semaine » : la terminaison de l'ordinal en exposant.
function avecExposants(texte: string) {
  return texte
    .split(/(?<=\d)(er|re|e)(?=\s|$)/)
    .map((morceau, i) => (i % 2 === 1 ? <sup key={i}>{morceau}</sup> : morceau))
}

// Sous l'arc du cadran : la date, que l'app connaît toujours, puis ce que
// l'AELF dit du jour (temps, fête ou saint, couleur). Sans réponse de l'AELF,
// seule la date reste, avec de quoi réessayer (textes validés le 2026-10-06).
export function BandeauJour({ date }: { date: string }) {
  const [etat, setEtat] = useState<Etat>({ sorte: 'chargement' })
  const [essai, setEssai] = useState(0)

  useEffect(() => {
    const abandon = new AbortController()
    chargerJour(date, abandon.signal).then(
      (jour) => setEtat({ sorte: 'pret', bandeau: presenterJour(jour) }),
      () => {
        if (!abandon.signal.aborted) setEtat({ sorte: 'erreur' })
      },
    )
    return () => abandon.abort()
  }, [date, essai])

  const bandeau = etat.sorte === 'pret' ? etat.bandeau : {}
  return (
    <div className="bandeau-jour" data-testid="bandeau">
      <h1 className="bandeau-date">{majuscule(dateLisible(date))}</h1>
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
      {etat.sorte === 'erreur' && (
        <p className="bandeau-erreur" role="alert">
          <span aria-hidden="true">⚠ </span>Le jour liturgique n’a pas pu être récupéré.{' '}
          <button
            className="lien-discret"
            type="button"
            onClick={() => {
              setEtat({ sorte: 'chargement' })
              setEssai((n) => n + 1)
            }}
          >
            Réessayer
          </button>
        </p>
      )}
    </div>
  )
}
