import { Fragment, useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { chargerOffice, ErreurAelf, type OfficeDuJour } from '../aelf/api'
import { lireReglages } from '../chapelet/reglages'
import { IndiceSuite } from '../composants/IndiceSuite'
import { useRetour } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateLisible, estDate } from '../office/dates'
import { deplacerInvitatoire, ouvrirOffice } from '../office/journee'
import { estNomOffice, NOMS_OFFICES, type NomOffice } from '../office/modele'
import { PartieOffice } from '../office/PartieOffice'
import { Repere } from '../office/Repere'
import { invitatoireDe, reconstituer } from '../office/rubriques'
import { garderEcranAllume } from '../telephone/retours'
import './EcranOffice.css'

// Un office lu d'un trait : le texte de l'AELF, complété selon les rubriques
// validées par le porteur du projet (src/recueil/office.ts).
export function EcranOffice() {
  const { office, date } = useParams()
  if (!estNomOffice(office) || !estDate(date)) return <Navigate to="/offices" replace />
  return <LectureOffice key={`${office}/${date}`} nom={office} date={date} />
}

type Etat =
  | { sorte: 'chargement' }
  | { sorte: 'erreur'; absent: boolean }
  | { sorte: 'pret'; lu: OfficeDuJour; laudes?: OfficeDuJour }

function LectureOffice({ nom, date }: { nom: NomOffice; date: string }) {
  const [etat, setEtat] = useState<Etat>({ sorte: 'chargement' })
  const [essai, setEssai] = useState(0)
  const [{ accents, plusieurs, prieresEntieres, signalerAjouts }] = useState(lireReglages)
  // R1 : le premier des deux offices ouverts dans la journée porte l'invitatoire.
  const [premier, setPremier] = useState(() => ouvrirOffice(nom, date))
  const retour = useRetour()
  const { fin, cachee } = useSuiteCachee()
  // Comme au chapelet : le téléphone ne se verrouille pas en pleine lecture.
  useEffect(() => garderEcranAllume(), [])

  useEffect(() => {
    const abandon = new AbortController()
    // L'AELF ne donne l'invitatoire qu'aux laudes : l'office des lectures le
    // leur emprunte. Sans les laudes, il s'en passe.
    const laudes =
      nom === 'lectures'
        ? chargerOffice('laudes', date, abandon.signal).catch(() => undefined)
        : Promise.resolve(undefined)
    Promise.all([chargerOffice(nom, date, abandon.signal), laudes]).then(
      ([lu, laudes]) => setEtat({ sorte: 'pret', lu, laudes }),
      (erreur: unknown) => {
        if (abandon.signal.aborted) return
        setEtat({ sorte: 'erreur', absent: erreur instanceof ErreurAelf && erreur.absent })
      },
    )
    return () => abandon.abort()
  }, [nom, date, essai])

  const office = useMemo(() => {
    if (etat.sorte !== 'pret') return undefined
    const invitatoire = etat.laudes && invitatoireDe(etat.laudes.office)
    return reconstituer(etat.lu.office, { premier, plusieurs, invitatoire })
  }, [etat, premier, plusieurs])
  // Sur l'office des lectures, le lien n'a de sens que si les laudes sont là.
  const peutRecevoirInvitatoire =
    etat.sorte === 'pret' &&
    !premier &&
    (nom === 'laudes' || (nom === 'lectures' && etat.laudes !== undefined))

  const recevoirInvitatoire = () => {
    deplacerInvitatoire(nom, date)
    setPremier(true)
  }

  const reessayer = () => {
    setEtat({ sorte: 'chargement' })
    setEssai((n) => n + 1)
  }

  return (
    <main
      className="office"
      data-accents={accents ? 'oui' : 'non'}
      data-ajouts={signalerAjouts ? 'oui' : 'non'}
    >
      <button className="retour lien-discret" type="button" onClick={retour}>
        ‹ Retour
      </button>
      <header className="office-entete">
        <p className="office-date">{dateLisible(date)}</p>
        <h1>{NOMS_OFFICES[nom]}</h1>
        {peutRecevoirInvitatoire && (
          <button className="lien-discret" type="button" onClick={recevoirInvitatoire}>
            Dire l’invitatoire ici
          </button>
        )}
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

      {etat.sorte === 'pret' && office && (
        <div className="office-texte" data-testid="office">
          {office.parties.map((partie, i) => (
            <Fragment key={i}>
              {i > 0 && <Repere couleur={etat.lu.jour.couleurs[0]} />}
              <PartieOffice partie={partie} replier={!prieresEntieres} />
            </Fragment>
          ))}
        </div>
      )}

      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee && etat.sorte === 'pret'} />
    </main>
  )
}
