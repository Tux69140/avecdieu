import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Navigate, useParams } from 'react-router'
import { ChapeletDessine } from '../chapelet/ChapeletDessine'
import { CHAPELET_MARIAL } from '../chapelet/definition'
import { derouler, type Pas } from '../chapelet/deroule'
import { disposer } from '../chapelet/disposition'
import { avancer, classerGeste, reculer } from '../chapelet/navigation'
import { serieDuJour } from '../chapelet/serieDuJour'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { PRIERES } from '../recueil/prieres'
import './EcranChapelet.css'

const DEROULE = derouler(CHAPELET_MARIAL)
const PLAN = disposer(DEROULE)
const ORDINAUX = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième']

const TOUCHES_AVANCER = new Set([' ', 'Enter', 'ArrowRight', 'ArrowDown', 'PageDown'])
const TOUCHES_RECULER = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'])

const estSerie = (valeur: string): valeur is SerieId => valeur in SERIES
const estInteractif = (cible: EventTarget) => cible instanceof Element && cible.closest('button, a') !== null

export function EcranChapelet() {
  const { serie: serieChoisie } = useParams()
  const [aujourdhui] = useState(() => new Date())
  if (serieChoisie !== undefined && !estSerie(serieChoisie)) return <Navigate to="/chapelet" replace />
  const serie = serieChoisie ?? serieDuJour(aujourdhui)
  return <Chapelet key={serie} serie={serie} date={aujourdhui} choisie={serieChoisie !== undefined} />
}

function Chapelet({ serie, date, choisie }: { serie: SerieId; date: Date; choisie: boolean }) {
  const [index, setIndex] = useState(0)
  const debutGeste = useRef<{ id: number; x: number; y: number; surBouton: boolean } | null>(null)
  const nombre = DEROULE.pas.length
  const termine = index === nombre

  useEffect(() => {
    const auClavier = (e: KeyboardEvent) => {
      if (e.target instanceof Element && estInteractif(e.target)) return
      if (TOUCHES_AVANCER.has(e.key)) setIndex((i) => avancer(i, nombre))
      else if (TOUCHES_RECULER.has(e.key)) setIndex(reculer)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', auClavier)
    return () => window.removeEventListener('keydown', auClavier)
  }, [nombre])

  const appui = (e: PointerEvent) => {
    if (!e.isPrimary || e.button !== 0) return
    debutGeste.current = { id: e.pointerId, x: e.clientX, y: e.clientY, surBouton: estInteractif(e.target) }
  }
  const relachement = (e: PointerEvent) => {
    const debut = debutGeste.current
    debutGeste.current = null
    if (!debut || debut.id !== e.pointerId) return
    const geste = classerGeste({ dx: e.clientX - debut.x, dy: e.clientY - debut.y })
    // Un toucher sur un bouton appartient au bouton ; un glissement, lui, recule partout.
    if (geste === 'avancer' && !debut.surBouton) setIndex((i) => avancer(i, nombre))
    else if (geste === 'reculer') setIndex(reculer)
  }

  const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <main
      className="chapelet"
      onPointerDown={appui}
      onPointerUp={relachement}
      onPointerCancel={() => (debutGeste.current = null)}
    >
      <header className="chapelet-entete">
        <p className="etiquette">{choisie ? 'Chapelet' : `Chapelet du jour · ${jour}`}</p>
        <h1>{SERIES[serie].titre}</h1>
      </header>

      <ChapeletDessine plan={PLAN} grainCourant={termine ? PLAN.points.length : DEROULE.pas[index].grain} />

      {termine ? (
        <section className="fin" data-testid="priere">
          <h2>Chapelet terminé</h2>
          <p className="fin-texte">
            {SERIES[serie].titre} · cinq dizaines
          </p>
          <button className="btn btn-secondaire" type="button" onClick={() => setIndex(0)}>
            Recommencer
          </button>
        </section>
      ) : (
        <Priere key={index} pas={DEROULE.pas[index]} serie={serie} />
      )}

      {index === 0 && <p className="consigne">Touchez l’écran pour avancer, glissez pour revenir.</p>}
    </main>
  )
}

function Priere({ pas, serie }: { pas: Pas; serie: SerieId }) {
  const priere = PRIERES[pas.priere]
  return (
    <section className="priere" data-testid="priere" aria-live="polite">
      {pas.dizaine !== undefined && (
        <p className="mystere" data-testid="mystere">
          <span className="etiquette">{ORDINAUX[pas.dizaine - 1]} mystère</span>{' '}
          <span className="mystere-titre">{SERIES[serie].mysteres[pas.dizaine - 1]}</span>
        </p>
      )}
      <div className="priere-tete">
        <h2>{priere.titre}</h2>
        {pas.total > 1 && (
          <span className="compteur" data-testid="compteur">
            {pas.rang} / {pas.total}
          </span>
        )}
      </div>
      <p className="priere-texte">
        {priere.lignes.map((ligne, i) => (
          <span key={i}>{ligne}</span>
        ))}
      </p>
    </section>
  )
}
