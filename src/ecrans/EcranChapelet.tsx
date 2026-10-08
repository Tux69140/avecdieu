import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { usePincement } from '../affichage/usePincement'
import { AideGestes } from '../chapelet/AideGestes'
import { Annonce } from '../chapelet/Annonce'
import { ChapeletDessine } from '../chapelet/ChapeletDessine'
import { CHAPELET_MARIAL } from '../chapelet/definition'
import { derouler, type Pas } from '../chapelet/deroule'
import { disposer } from '../chapelet/disposition'
import { aideAMontrer, compterLecture, lireLectures } from '../chapelet/memoire'
import { avancer, classerGeste, reculer } from '../chapelet/navigation'
import { MystereEnCours } from '../chapelet/MystereEnCours'
import { Priere } from '../chapelet/Priere'
import { lireReglages, optionsDuDeroule } from '../chapelet/reglages'
import { effacerEnCours, lireEnCours, retenirEnCours, retrouver } from '../chapelet/reprise'
import { dizaineCommencee, rangDuPassage } from '../chapelet/rotation'
import { Seuil } from '../chapelet/Seuil'
import { serieDuJour } from '../chapelet/serieDuJour'
import { deciderToucher } from '../chapelet/toucher'
import { vibrationEntre } from '../chapelet/vibration'
import { BoutonAide } from '../composants/BoutonAide'
import { glissement } from '../composants/defilement'
import { avecExposants } from '../composants/Exposants'
import { IndiceSuite } from '../composants/IndiceSuite'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour, useRetourAccueil } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateDuJour, dateLisible } from '../office/dates'
import { Repere } from '../office/Repere'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { PASSAGES } from '../recueil/passages'
import type { PriereId } from '../recueil/prieres'
import { retirerNotification } from '../telephone/notifications'
import { garderEcranAllume, vibrer } from '../telephone/retours'
import './EcranChapelet.css'

const TOUCHES_AVANCER = new Set([' ', 'Enter', 'ArrowRight', 'ArrowDown', 'PageDown'])
const TOUCHES_RECULER = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'])

const estSerie = (valeur: string): valeur is SerieId => valeur in SERIES
const estInteractif = (cible: EventTarget) =>
  cible instanceof Element && cible.closest('button, a, input, label, dialog') !== null
const estPriere = (pas: Pas): pas is Pas & { priere: PriereId | 'litanies' } =>
  pas.priere !== 'annonce'

// Ce que l'écran montre au moment d'un toucher, pour décider s'il descend ou
// avance (chapelet/toucher.ts). Les bandes sous les barres d'Android et le
// signal « Plus bas » cachent le haut et le bas de la fenêtre.
function mesurerPage(depuisDefilement: number) {
  const haut = document.querySelector('.voile-barre-haut')?.getBoundingClientRect().bottom ?? 0
  const bas = document.querySelector('.voile-barre-bas')?.getBoundingClientRect().top
  const basVisible = bas ?? window.innerHeight
  const indice = document.querySelector('.indice-suite-flottant')?.getBoundingClientRect().top
  const texte = document.querySelector('[data-testid="priere"] .priere-texte')
  return {
    depuisDefilement,
    basContenu: texte?.getBoundingClientRect().bottom ?? -Infinity,
    hautVisible: haut,
    basVisible,
    recouvert: indice === undefined ? 0 : Math.max(basVisible - indice, 0),
    // Une ligne et l'écart qui la sépare de la suivante (TextePriere.css).
    ligne: parseFloat(getComputedStyle(texte ?? document.body).fontSize) * 1.75,
  }
}

// Le chapelet s'ouvre sur son seuil ; « Commencer » ajoute une entrée à
// l'historique, si bien que le retour d'Android y ramène.
export function EcranChapelet() {
  const { serie: serieChoisie } = useParams()
  const { pathname, state } = useLocation()
  const naviguer = useNavigate()
  const [aujourdhui] = useState(() => new Date())
  const duJour = serieDuJour(aujourdhui)
  const prier = (state as { prier?: boolean } | null)?.prier === true
  const enCours = lireEnCours(aujourdhui)
  // Le chapelet ouvert, son rappel n'a plus à rester affiché.
  useEffect(() => void retirerNotification('/chapelet'), [])

  if (serieChoisie !== undefined && !estSerie(serieChoisie))
    return <Navigate to="/chapelet" replace />
  const serie = serieChoisie ?? duJour
  const commencer = () => naviguer(pathname, { state: { prier: true } })
  if (!prier)
    return (
      <Seuil
        key={serie}
        serie={serie}
        duJour={duJour}
        date={aujourdhui}
        enCours={enCours?.serie === serie ? enCours : null}
        onCommencer={commencer}
        onRecommencer={() => {
          effacerEnCours()
          commencer()
        }}
      />
    )
  return <Chapelet key={serie} serie={serie} date={aujourdhui} />
}

function Chapelet({ serie, date }: { serie: SerieId; date: Date }) {
  const [reglages] = useState(lireReglages)
  const compact = reglages.affichage === 'compact'
  // Les Litanies et saint Joseph « en octobre » suivent le jour du chapelet.
  const deroule = useMemo(
    () => derouler(CHAPELET_MARIAL, optionsDuDeroule(reglages, date)),
    [reglages, date],
  )
  const plan = useMemo(() => disposer(deroule), [deroule])
  // Le passage de chaque mystère est choisi une fois pour tout le chapelet.
  const [passages] = useState(() =>
    PASSAGES[serie].map(
      (liste, i) => liste[rangDuPassage(lireLectures(serie, i + 1), liste.length)],
    ),
  )
  // Reprend au grain exact un chapelet de cette série commencé aujourd'hui.
  const [index, setIndex] = useState(() => {
    const enCours = lireEnCours(date)
    return enCours?.serie === serie ? retrouver(deroule, enCours) : 0
  })
  const [aideOuverte, setAideOuverte] = useState(aideAMontrer)
  const [passageDeplie, setPassageDeplie] = useState<number | null>(null)
  const debutGeste = useRef<{
    id: number
    x: number
    y: number
    surBouton: boolean
    depuisDefilement: number
  } | null>(null)
  // L'instant du dernier défilement, et le retour en haut de page que l'app
  // fait elle-même à chaque prière, qui ne compte pas comme un défilement.
  const dernierDefilement = useRef(-Infinity)
  const remiseEnHaut = useRef(false)
  const indexPrecedent = useRef(index)
  const dizainesLues = useRef(new Set<number>())
  const { fin, cachee } = useSuiteCachee()
  const pincer = usePincement<HTMLElement>()
  const retour = useRetour()
  const revenirAccueil = useRetourAccueil()

  const nombre = deroule.pas.length
  const termine = index === nombre
  const pas = termine ? undefined : deroule.pas[index]
  // L'annonce ne s'avance que par la grosse perle.
  const surAnnonce = pas?.priere === 'annonce'

  useEffect(() => {
    const avant = indexPrecedent.current
    indexPrecedent.current = index
    const vibration = vibrationEntre(deroule, avant, index)
    if (vibration && reglages.vibrations) vibrer(vibration)
    // Chaque dizaine commencée compte une lecture de son mystère, une fois par chapelet.
    const dizaine = dizaineCommencee(deroule, avant, index)
    if (dizaine !== null && !dizainesLues.current.has(dizaine)) {
      dizainesLues.current.add(dizaine)
      compterLecture(serie, dizaine)
    }
  }, [index, deroule, serie, reglages])

  // Chaque prière s'ouvre en haut, comme tout écran : après une annonce qu'on
  // a fait défiler, la suivante ne s'ouvre pas à mi-hauteur.
  // (Entre accolades : les navigateurs récents rendent une promesse, que React
  // prendrait pour un nettoyage.)
  useLayoutEffect(() => {
    if (window.scrollY === 0) return
    remiseEnHaut.current = true
    window.scrollTo(0, 0)
  }, [index])

  useEffect(() => {
    const defiler = () => {
      if (remiseEnHaut.current) remiseEnHaut.current = false
      else dernierDefilement.current = performance.now()
    }
    window.addEventListener('scroll', defiler, { passive: true })
    return () => window.removeEventListener('scroll', defiler)
  }, [])

  // Retenu à chaque pas, oublié une fois le chapelet terminé.
  useEffect(() => {
    if (index < deroule.pas.length) retenirEnCours(date, serie, deroule.pas[index])
    else effacerEnCours()
  }, [index, deroule, date, serie])

  // L'écran reste allumé du signe de croix à la fin du chapelet.
  useEffect(() => (termine ? undefined : garderEcranAllume()), [termine])

  useEffect(() => {
    const auClavier = (e: KeyboardEvent) => {
      if (aideOuverte || (e.target instanceof Element && estInteractif(e.target))) return
      if (TOUCHES_AVANCER.has(e.key)) {
        if (!surAnnonce) setIndex((i) => avancer(i, nombre))
      } else if (TOUCHES_RECULER.has(e.key)) setIndex(reculer)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', auClavier)
    return () => window.removeEventListener('keydown', auClavier)
  }, [nombre, surAnnonce, aideOuverte])

  const appui = (e: PointerEvent) => {
    // Un deuxième doigt : c'est un pincement (taille du texte), pas un toucher.
    if (!e.isPrimary) debutGeste.current = null
    if (aideOuverte || !e.isPrimary || e.button !== 0) return
    debutGeste.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      surBouton: estInteractif(e.target),
      depuisDefilement: performance.now() - dernierDefilement.current,
    }
  }
  // Un toucher sur une prière plus haute que l'écran la fait d'abord défiler.
  const toucherPriere = (depuisDefilement: number) => {
    const decision = deciderToucher(mesurerPage(depuisDefilement))
    if (decision.sorte === 'avancer') setIndex((i) => avancer(i, nombre))
    else if (decision.sorte === 'descendre')
      window.scrollBy({ top: decision.de, behavior: glissement() })
  }
  const relachement = (e: PointerEvent) => {
    const debut = debutGeste.current
    debutGeste.current = null
    if (aideOuverte || !debut || debut.id !== e.pointerId) return
    const geste = classerGeste({ dx: e.clientX - debut.x, dy: e.clientY - debut.y })
    // Un toucher sur un bouton appartient au bouton ; un glissement, lui, recule partout.
    if (geste === 'avancer' && !debut.surBouton && !surAnnonce)
      toucherPriere(debut.depuisDefilement)
    else if (geste === 'reculer') setIndex(reculer)
  }

  return (
    <main
      ref={pincer}
      className="chapelet"
      data-pas={index}
      onPointerDown={appui}
      onPointerUp={relachement}
      onPointerCancel={() => (debutGeste.current = null)}
    >
      <header className="chapelet-entete">
        {/* La croix ramène au seuil, comme le retour d'Android : on y change de
            série ou on reprend (décision du porteur du projet, 2026-10-08). Un
            toucher sur elle n'avance pas le chapelet (estInteractif). */}
        <LigneFermer onFermer={retour}>
          <p className="ligne-date">{avecExposants(dateLisible(dateDuJour(date)))}</p>
          {/* En face de la croix, « ? » rouvre l'aide aux gestes, comme dans
              l'office (2026-10-08). */}
          <BoutonAide libelle="Aide aux gestes" onClick={() => setAideOuverte(true)} />
        </LigneFermer>
        <h1>{SERIES[serie].titre}</h1>
      </header>

      <ChapeletDessine
        plan={plan}
        grainCourant={pas ? pas.grain : plan.points.length}
        libelle={termine ? 'Chapelet terminé' : `Chapelet, prière ${index + 1} sur ${nombre}`}
      />

      {/* Une seule région annonce chaque prière au lecteur d'écran : une
          région neuve à chaque pas resterait muette. Le mystère y entre aussi,
          lu quand il change : en compact, sans écran d'annonce, c'est lui qui
          dit le mystère qui commence. */}
      <div aria-live="polite">
        {/* Sans annonce, rien du mystère : des prières vocales seules. */}
        {pas && estPriere(pas) && pas.dizaine !== undefined && reglages.annonce && (
          <MystereEnCours
            serie={serie}
            dizaine={pas.dizaine}
            fruit={compact && pas.priere === 'notre-pere'}
          />
        )}
        {!pas ? (
          // La fin comme celle de l'office : une perle d'or qui ferme, puis le
          // chemin de l'accueil, sans mot de plus ni « Recommencer » qu'un
          // toucher machinal relancerait (choix du porteur du projet, 2026-10-08).
          <section className="fin" data-testid="fin-chapelet" aria-label="Fin du chapelet">
            <Repere />
            <button className="lien-discret" type="button" onClick={revenirAccueil}>
              Revenir à l’accueil
            </button>
          </section>
        ) : estPriere(pas) ? (
          <Priere
            key={index}
            pas={pas}
            compact={compact}
            plusieurs={reglages.plusieurs}
            annonce={reglages.annonce}
            passage={pas.dizaine ? passages[pas.dizaine - 1] : undefined}
            passageDeplie={passageDeplie === pas.dizaine}
            onBasculerPassage={() =>
              setPassageDeplie((d) => (d === pas.dizaine ? null : (pas.dizaine ?? null)))
            }
          />
        ) : (
          <Annonce
            key={index}
            serie={serie}
            dizaine={pas.dizaine!}
            passage={passages[pas.dizaine! - 1]}
            onCommencer={() => setIndex((i) => avancer(i, nombre))}
          />
        )}
      </div>

      {index === 0 && (
        <p className="consigne">Touchez l’écran pour avancer, glissez pour revenir.</p>
      )}
      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee && !surAnnonce} />
      {aideOuverte && (
        <AideGestes plusieurs={reglages.plusieurs} onFermer={() => setAideOuverte(false)} />
      )}
    </main>
  )
}
