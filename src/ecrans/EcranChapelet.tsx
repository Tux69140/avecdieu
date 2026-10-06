import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
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
import { vibrationEntre } from '../chapelet/vibration'
import { IndiceSuite } from '../composants/IndiceSuite'
import { useSuiteCachee } from '../composants/suiteCachee'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { PASSAGES } from '../recueil/passages'
import type { PriereId } from '../recueil/prieres'
import { garderEcranAllume, vibrer } from '../telephone/retours'
import './EcranChapelet.css'

const TOUCHES_AVANCER = new Set([' ', 'Enter', 'ArrowRight', 'ArrowDown', 'PageDown'])
const TOUCHES_RECULER = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'])

const estSerie = (valeur: string): valeur is SerieId => valeur in SERIES
const estInteractif = (cible: EventTarget) =>
  cible instanceof Element && cible.closest('button, a, input, label, dialog') !== null
const estPriere = (pas: Pas): pas is Pas & { priere: PriereId } => pas.priere !== 'annonce'

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
  return <Chapelet key={serie} serie={serie} date={aujourdhui} choisie={serie !== duJour} />
}

function Chapelet({ serie, date, choisie }: { serie: SerieId; date: Date; choisie: boolean }) {
  const [reglages] = useState(lireReglages)
  const compact = reglages.affichage === 'compact'
  const deroule = useMemo(() => derouler(CHAPELET_MARIAL, optionsDuDeroule(reglages)), [reglages])
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
  const debutGeste = useRef<{ id: number; x: number; y: number; surBouton: boolean } | null>(null)
  const indexPrecedent = useRef(index)
  const dizainesLues = useRef(new Set<number>())
  const { fin, cachee } = useSuiteCachee()

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
    if (aideOuverte || !e.isPrimary || e.button !== 0) return
    debutGeste.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      surBouton: estInteractif(e.target),
    }
  }
  const relachement = (e: PointerEvent) => {
    const debut = debutGeste.current
    debutGeste.current = null
    if (aideOuverte || !debut || debut.id !== e.pointerId) return
    const geste = classerGeste({ dx: e.clientX - debut.x, dy: e.clientY - debut.y })
    // Un toucher sur un bouton appartient au bouton ; un glissement, lui, recule partout.
    if (geste === 'avancer' && !debut.surBouton && !surAnnonce) setIndex((i) => avancer(i, nombre))
    else if (geste === 'reculer') setIndex(reculer)
  }

  const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <main
      className="chapelet"
      data-pas={index}
      onPointerDown={appui}
      onPointerUp={relachement}
      onPointerCancel={() => (debutGeste.current = null)}
    >
      <header className="chapelet-entete">
        <p className="etiquette">{choisie ? `Chapelet · ${jour}` : `Chapelet du jour · ${jour}`}</p>
        <h1>{SERIES[serie].titre}</h1>
      </header>

      <ChapeletDessine plan={plan} grainCourant={pas ? pas.grain : plan.points.length} />

      {/* Sans annonce, rien du mystère : des prières vocales seules. */}
      {pas && estPriere(pas) && pas.dizaine !== undefined && reglages.annonce && (
        <MystereEnCours
          serie={serie}
          dizaine={pas.dizaine}
          fruit={compact && pas.priere === 'notre-pere'}
        />
      )}

      {!pas ? (
        <section className="fin" data-testid="priere">
          <h2>Chapelet terminé</h2>
          <p className="fin-texte">{SERIES[serie].titre} · cinq dizaines</p>
          <button className="btn btn-secondaire" type="button" onClick={() => setIndex(0)}>
            Recommencer
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

      {index === 0 && (
        <p className="consigne">Touchez l’écran pour avancer, glissez pour revenir.</p>
      )}
      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee && !surAnnonce} />
      {aideOuverte && <AideGestes onFermer={() => setAideOuverte(false)} />}
    </main>
  )
}
