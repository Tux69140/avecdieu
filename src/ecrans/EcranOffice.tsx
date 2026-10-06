import { Fragment, useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { chargerOffice, ErreurAelf, type OfficeDuJour } from '../aelf/api'
import { lireReglages } from '../chapelet/reglages'
import { IndiceSuite } from '../composants/IndiceSuite'
import { useRetour } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateLisible, estDate } from '../office/dates'
import { estNomOffice, NOMS_OFFICES, type NomOffice } from '../office/modele'
import { PartieOffice } from '../office/PartieOffice'
import { Repere } from '../office/Repere'
import './EcranOffice.css'

// Un office lu d'un trait, tel que l'AELF le fournit (phase 5) : la
// reconstitution selon les rubriques viendra en phase 6.
export function EcranOffice() {
  const { office, date } = useParams()
  if (!estNomOffice(office) || !estDate(date)) return <Navigate to="/offices" replace />
  return <LectureOffice key={`${office}/${date}`} nom={office} date={date} />
}

type Etat =
  | { sorte: 'chargement' }
  | { sorte: 'erreur'; absent: boolean }
  | { sorte: 'pret'; lu: OfficeDuJour }

function LectureOffice({ nom, date }: { nom: NomOffice; date: string }) {
  const [etat, setEtat] = useState<Etat>({ sorte: 'chargement' })
  const [essai, setEssai] = useState(0)
  const [{ accents }] = useState(lireReglages)
  const retour = useRetour()
  const { fin, cachee } = useSuiteCachee()

  useEffect(() => {
    const abandon = new AbortController()
    chargerOffice(nom, date, abandon.signal).then(
      (lu) => setEtat({ sorte: 'pret', lu }),
      (erreur: unknown) => {
        if (abandon.signal.aborted) return
        setEtat({ sorte: 'erreur', absent: erreur instanceof ErreurAelf && erreur.absent })
      },
    )
    return () => abandon.abort()
  }, [nom, date, essai])

  const reessayer = () => {
    setEtat({ sorte: 'chargement' })
    setEssai((n) => n + 1)
  }

  return (
    <main className="office" data-accents={accents ? 'oui' : 'non'}>
      <button className="retour lien-discret" type="button" onClick={retour}>
        ‹ Retour
      </button>
      <header className="office-entete">
        <p className="office-date">{dateLisible(date)}</p>
        <h1>{NOMS_OFFICES[nom]}</h1>
      </header>

      {etat.sorte === 'chargement' && (
        <p className="office-chargement" role="status">
          Chargement de l’office…
        </p>
      )}

      {etat.sorte === 'erreur' && (
        <div className="office-erreur" role="alert">
          <p className="office-erreur-titre">
            <span aria-hidden="true">⚠ </span>Impossible de récupérer l’office.
          </p>
          {etat.absent ? (
            // Réessayer n'y changerait rien : l'AELF n'a pas ce texte.
            <p>L’AELF ne propose pas cet office pour ce jour.</p>
          ) : (
            <>
              <p>
                Le site de l’AELF ne répond pas. Vérifiez votre connexion internet, puis réessayez.
              </p>
              <button className="btn btn-secondaire" type="button" onClick={reessayer}>
                Réessayer
              </button>
            </>
          )}
        </div>
      )}

      {etat.sorte === 'pret' && (
        <div className="office-texte" data-testid="office">
          {etat.lu.office.parties.map((partie, i) => (
            <Fragment key={i}>
              {i > 0 && <Repere couleur={etat.lu.jour.couleurs[0]} />}
              <PartieOffice partie={partie} />
            </Fragment>
          ))}
        </div>
      )}

      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee && etat.sorte === 'pret'} />
    </main>
  )
}
