import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useNavigationType, useParams } from 'react-router'
import { chargerOffice, ErreurAelf, type OfficeDuJour } from '../aelf/api'
import type { Etendue } from '../aelf/cache'
import { textesEnregistres } from '../aelf/reserve'
import { usePincement } from '../affichage/usePincement'
import { lireReglages } from '../chapelet/reglages'
import { saintDuJour } from '../accueil/bandeau'
import { positionRetenue } from '../composants/defilement'
import { avecExposants } from '../composants/Exposants'
import { BoutonFermer, LienMenu } from '../composants/Icones'
import { IndiceSuite } from '../composants/IndiceSuite'
import { useRetour, useRetourAccueil } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateLisible, estDate, paques } from '../office/dates'
import { deplacerInvitatoire, ouvrirOffice } from '../office/journee'
import { estNomOffice, NOMS_OFFICES, type NomOffice, type Partie } from '../office/modele'
import { aideOfficeAMontrer } from '../office/aide'
import { AideOffice } from '../office/AideOffice'
import { AvisOffice } from '../office/AvisOffice'
import { BandeauOffice } from '../office/BandeauOffice'
import { etapesDe } from '../office/etapes'
import { FilDePerles } from '../office/FilDePerles'
import { PartieOffice } from '../office/PartieOffice'
import { Repere } from '../office/Repere'
import { invitatoireDe, reconstituer } from '../office/rubriques'
import { SommaireOffice } from '../office/SommaireOffice'
import { useReperage } from '../office/useReperage'
import { useSommaire } from '../office/useSommaire'
import { retirerNotification } from '../telephone/notifications'
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

// Au-delà, le priant a commencé à lire.
const DEBUT_DE_LECTURE = 48

function LectureOffice({ nom, date }: { nom: NomOffice; date: string }) {
  const [etat, setEtat] = useState<Etat>({ sorte: 'chargement' })
  const [essai, setEssai] = useState(0)
  const [{ accents, plusieurs, prieresEntieres, signalerAjouts, consignes }] =
    useState(lireReglages)
  const retour = useRetour()
  const revenirAccueil = useRetourAccueil()
  const naviguer = useNavigate()
  const [aideOuverte, setAideOuverte] = useState(aideOfficeAMontrer)
  const { fin, cachee } = useSuiteCachee()
  // « Plus bas » ne sert qu'avant de commencer : dès qu'on lit, il ne ferait
  // qu'estomper la dernière ligne (choix du porteur du projet, 2026-10-07).
  const [aCommence, setACommence] = useState(false)
  useEffect(() => {
    if (aCommence) return
    const lire = () => {
      if (scrollY > DEBUT_DE_LECTURE) setACommence(true)
    }
    addEventListener('scroll', lire, { passive: true })
    return () => removeEventListener('scroll', lire)
  }, [aCommence])
  const texte = useRef<HTMLDivElement>(null)
  const versInvitatoire = useRef(false)
  const pincer = usePincement<HTMLElement>()
  // Comme au chapelet : le téléphone ne se verrouille pas en pleine lecture.
  useEffect(() => garderEcranAllume(), [])
  // L'office ouvert, son rappel n'a plus à rester affiché.
  useEffect(() => void retirerNotification(`/office/${nom}/${date}`), [nom, date])

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
    return reconstituer(lu.office, { premier, plusieurs, invitatoire, consignes })
  }, [etat, plusieurs, consignes])

  const saint = etat.sorte === 'pret' ? saintDuJour(etat.lu.jour) : undefined

  const clesDesParties = useMemo(() => cles(office?.parties ?? []), [office])

  // Revenu du menu par le retour d'Android : la lecture reprend où on l'avait
  // laissée, une fois le texte affiché.
  const { key } = useLocation()
  const revenu = useNavigationType() === 'POP'
  const aRetrouver = useRef(revenu ? positionRetenue(key) : undefined)
  useLayoutEffect(() => {
    if (!office || aRetrouver.current === undefined) return
    scrollTo(0, aRetrouver.current)
    aRetrouver.current = undefined
  }, [office])

  // Phase 7 : l'étape en cours, dans le bandeau et le sommaire.
  const etapes = useMemo(() => etapesDe(office?.parties ?? []), [office])
  const debuts = useMemo(() => new Map(etapes.map((e, k) => [e.debut, k])), [etapes])
  const titre = useRef<HTMLHeadingElement>(null)
  const bandeau = useRef<HTMLElement>(null)
  const { bandeauVisible, courante, allerA } = useReperage({ titre, texte, bandeau }, etapes.length)
  const sommaire = useSommaire(allerA)

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
    <>
      {office && (
        <BandeauOffice
          ref={bandeau}
          etapes={etapes}
          courante={courante}
          visible={bandeauVisible}
          onOuvrir={sommaire.ouvrir}
          onFermer={retour}
          date={date}
          office={nom}
        />
      )}
      <main
        ref={pincer}
        className="office"
        data-accents={accents ? 'oui' : 'non'}
        data-ajouts={signalerAjouts ? 'oui' : 'non'}
      >
        <header className="office-entete">
          {/* Une seule ligne pour sortir, se repérer dans la journée et ouvrir
              le menu : la prière commence haut sur l'écran. */}
          <div className="office-barre">
            <BoutonFermer onClick={retour} />
            <p className="office-date">{avecExposants(dateLisible(date))}</p>
            <LienMenu depuis={date} office={nom} />
          </div>
          {/* Le saint du jour en petit à gauche du titre, qui reste centré, et
              « ? » à droite, qui rouvre l'aide ; sous le titre long de l'office
              des lectures (2026-10-08). */}
          <div className="office-titre" data-office={nom}>
            <h1 ref={titre}>{NOMS_OFFICES[nom]}</h1>
            {saint && (
              <p className="office-saint" data-testid="saint-du-jour">
                {saint}
              </p>
            )}
            {office && (
              <button
                className="office-aide"
                type="button"
                aria-haspopup="dialog"
                aria-label="Aide à la lecture"
                onClick={() => setAideOuverte(true)}
              >
                <span aria-hidden="true">?</span>
              </button>
            )}
          </div>
          {/* Les perles, comme dans le bandeau : un toucher ouvre le sommaire. */}
          {office && (
            <button
              className="office-perles"
              type="button"
              aria-haspopup="dialog"
              aria-label={`${etapes[courante]?.libelle ?? ''}, étape ${courante + 1} sur ${etapes.length}. Ouvrir le sommaire`}
              onClick={sommaire.ouvrir}
            >
              <FilDePerles nombre={etapes.length} courante={courante} />
            </button>
          )}
          {/* La raison avant l'action : seuls les derniers mots se touchent
              (choix du porteur du projet, 2026-10-08). */}
          {peutRecevoirInvitatoire && (
            <p className="office-invitatoire">
              L’invitatoire était {nom === 'laudes' ? 'à l’office des lectures' : 'aux laudes'}.{' '}
              <button className="lien-discret" type="button" onClick={recevoirInvitatoire}>
                Le dire ici
              </button>
            </p>
          )}
        </header>

        {etat.sorte === 'chargement' && (
          <p className="office-chargement" role="status">
            Chargement de l’office…
          </p>
        )}

        {etat.sorte === 'erreur' && (
          <AvisOffice
            absent={etat.absent}
            paques={etat.absent && nom === 'lectures' && date === paques(Number(date.slice(0, 4)))}
            enregistres={etat.enregistres}
            onReessayer={reessayer}
            onAccueil={revenirAccueil}
            onLaudes={() => naviguer(`/office/laudes/${date}`)}
          />
        )}

        {etat.sorte === 'pret' && office && (
          <div ref={texte} className="office-texte" data-testid="office">
            {office.parties.map((partie, i) => (
              <Fragment key={clesDesParties[i]}>
                {/* Un repère entre deux étapes seulement : l'antienne reste
                    avec le psaume qu'elle ouvre (2026-10-08). */}
                {i > 0 && debuts.has(i) && <Repere couleur={etat.lu.jour.couleurs[0]} />}
                {debuts.has(i) && <div className="ancre-etape" data-etape={debuts.get(i)} />}
                <PartieOffice partie={partie} replier={!prieresEntieres} />
              </Fragment>
            ))}
            {/* La fin : une perle d'or qui ferme, puis le chemin de l'accueil,
                sans mot de plus ; l'écran reste allumé (2026-10-08). */}
            <div className="repere office-cloture" aria-hidden="true" data-testid="cloture">
              <span className="repere-perle" data-couleur="or" />
            </div>
            <p className="office-revenir">
              <button className="lien-discret" type="button" onClick={revenirAccueil}>
                Revenir à l’accueil
              </button>
            </p>
          </div>
        )}

        <div ref={fin} className="fin-ecran" />
        <IndiceSuite visible={cachee && !aCommence && etat.sorte === 'pret' && !sommaire.ouvert} />
      </main>
      {office && aideOuverte && (
        <AideOffice
          couleur={etat.sorte === 'pret' ? etat.lu.jour.couleurs[0] : undefined}
          accents={accents}
          ajouts={signalerAjouts}
          repliees={!prieresEntieres}
          plusieurs={plusieurs}
          onFermer={() => setAideOuverte(false)}
        />
      )}
      {office && sommaire.ouvert && (
        <SommaireOffice
          office={NOMS_OFFICES[nom]}
          etapes={etapes}
          courante={courante}
          onChoisir={sommaire.choisir}
          onFermer={sommaire.fermer}
        />
      )}
    </>
  )
}
