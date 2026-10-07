import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { chargerOffice, ErreurAelf, type OfficeDuJour } from '../aelf/api'
import type { Etendue } from '../aelf/cache'
import { textesEnregistres } from '../aelf/reserve'
import { lireReglages } from '../chapelet/reglages'
import { IndiceSuite } from '../composants/IndiceSuite'
import { useRetour } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateLisible, estDate, periodeLisible } from '../office/dates'
import { deplacerInvitatoire, ouvrirOffice } from '../office/journee'
import { estNomOffice, NOMS_OFFICES, type NomOffice, type Partie } from '../office/modele'
import { PartieOffice } from '../office/PartieOffice'
import { Repere } from '../office/Repere'
import { invitatoireDe, reconstituer } from '../office/rubriques'
import { garderEcranAllume } from '../telephone/retours'
import './EcranOffice.css'

// Un office lu d'un trait : le texte de l'AELF, complété selon les rubriques
// validées par le porteur du projet (src/recueil/office.ts).
export function EcranOffice() {
  const { office, date } = useParams()
  if (!estNomOffice(office) || !estDate(date)) return <Navigate to="/" replace />
  return <LectureOffice key={`${office}/${date}`} nom={office} date={date} />
}

type Etat =
  | { sorte: 'chargement' }
  // « enregistres » : les jours qu'on peut prier sans réseau, s'il y en a.
  | { sorte: 'erreur'; absent: boolean; enregistres?: Etendue }
  // « premier » (R1) : cet office ouvre la journée et porte l'invitatoire.
  | { sorte: 'pret'; lu: OfficeDuJour; invitatoire?: Partie[]; premier: boolean }

// Une clé qui ne bouge pas quand l'invitatoire s'insère en tête : une prière
// dépliée reste celle que l'on a dépliée.
const cles = (parties: Partie[]) => {
  const vues = new Map<string, number>()
  return parties.map((p) => {
    const n = (vues.get(p.libelle) ?? 0) + 1
    vues.set(p.libelle, n)
    return `${p.libelle}·${n}`
  })
}

function LectureOffice({ nom, date }: { nom: NomOffice; date: string }) {
  const [etat, setEtat] = useState<Etat>({ sorte: 'chargement' })
  const [essai, setEssai] = useState(0)
  const [{ accents, plusieurs, prieresEntieres, signalerAjouts }] = useState(lireReglages)
  const retour = useRetour()
  const { fin, cachee } = useSuiteCachee()
  const texte = useRef<HTMLDivElement>(null)
  const versInvitatoire = useRef(false)
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
      ([lu, laudes]) => {
        const invitatoire = invitatoireDe((laudes ?? lu).office)
        // R1 : seul un office affiché avec son invitatoire compte comme le
        // premier de la journée ; un office absent ou incomplet ne le prend pas.
        const premier = invitatoire !== undefined && ouvrirOffice(nom, date)
        setEtat({ sorte: 'pret', lu, invitatoire, premier })
      },
      (erreur: unknown) => {
        if (abandon.signal.aborted) return
        const absent = erreur instanceof ErreurAelf && erreur.absent
        setEtat({ sorte: 'erreur', absent, enregistres: textesEnregistres() })
      },
    )
    return () => abandon.abort()
  }, [nom, date, essai])

  const office = useMemo(() => {
    if (etat.sorte !== 'pret') return undefined
    const { lu, invitatoire, premier } = etat
    return reconstituer(lu.office, { premier, plusieurs, invitatoire })
  }, [etat, plusieurs])

  const clesDesParties = useMemo(() => cles(office?.parties ?? []), [office])

  const peutRecevoirInvitatoire =
    etat.sorte === 'pret' &&
    !etat.premier &&
    etat.invitatoire !== undefined &&
    (nom === 'laudes' || nom === 'lectures')

  const recevoirInvitatoire = () => {
    if (etat.sorte !== 'pret') return
    deplacerInvitatoire(nom, date)
    versInvitatoire.current = true
    setEtat({ ...etat, premier: true })
  }

  // Le lien disparaît une fois touché : la lecture reprend sur l'invitatoire.
  useEffect(() => {
    if (!versInvitatoire.current) return
    versInvitatoire.current = false
    const titre = texte.current?.querySelector<HTMLElement>('[data-type="invitatoire"] h2')
    if (!titre) return
    titre.tabIndex = -1
    titre.focus()
  }, [office])

  const reessayer = () => {
    setEtat({ sorte: 'chargement' })
    setEssai((n) => n + 1)
  }

  // Le réseau revenu, l'office se charge de lui-même.
  const enPanne = etat.sorte === 'erreur' && !etat.absent
  useEffect(() => {
    if (!enPanne) return
    window.addEventListener('online', reessayer)
    return () => window.removeEventListener('online', reessayer)
  }, [enPanne])

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
          {etat.absent ? (
            <>
              <p className="office-erreur-titre">
                <span aria-hidden="true">⚠ </span>Impossible de récupérer l’office.
              </p>
              {/* Réessayer n'y changerait rien : l'AELF n'a pas ce texte. */}
              <p>L’AELF ne propose pas cet office pour ce jour.</p>
            </>
          ) : (
            <>
              {/* Textes validés par le porteur du projet le 2026-10-07. */}
              {etat.enregistres ? (
                <>
                  <p className="office-erreur-titre">
                    <span aria-hidden="true">⚠ </span>Cet office n’est pas enregistré sur le
                    téléphone.
                  </p>
                  <p>
                    Les textes enregistrés vont{' '}
                    {periodeLisible(etat.enregistres.debut, etat.enregistres.fin)}. Pour ce jour-ci,
                    connectez-vous à internet, puis réessayez.
                  </p>
                </>
              ) : (
                <>
                  <p className="office-erreur-titre">
                    <span aria-hidden="true">⚠ </span>Les offices demandent une première connexion à
                    internet.
                  </p>
                  <p>
                    Une fois connecté, l’app enregistre une semaine de textes d’avance. Le chapelet,
                    lui, se prie dès maintenant.
                  </p>
                </>
              )}
              <button className="btn btn-secondaire" type="button" onClick={reessayer}>
                Réessayer
              </button>
            </>
          )}
        </div>
      )}

      {etat.sorte === 'pret' && office && (
        <div ref={texte} className="office-texte" data-testid="office">
          {office.parties.map((partie, i) => (
            <Fragment key={clesDesParties[i]}>
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
