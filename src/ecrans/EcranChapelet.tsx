import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { usePincement } from '../affichage/usePincement'
import { AideGestes } from '../chapelet/AideGestes'
import { ChapeletDessine } from '../chapelet/ChapeletDessine'
import { CHAPELET_MARIAL, ROSAIRE, type Forme } from '../chapelet/definition'
import { derouler, serieAtteinte } from '../chapelet/deroule'
import { disposer } from '../chapelet/disposition'
import { EnteteChapelet } from '../chapelet/EnteteChapelet'
import { intentionDuMois } from '../chapelet/intentionsDuPape'
import { aideAMontrer, lireLectures } from '../chapelet/memoire'
import { avancer } from '../chapelet/navigation'
import { optionsDuDeroule } from '../chapelet/options'
import { PasEnCours } from '../chapelet/PasEnCours'
import { effacerEnCours, lireEnCours, retrouver } from '../chapelet/reprise'
import { choisirPassages } from '../chapelet/rotation'
import { Seuil } from '../chapelet/Seuil'
import { estSerie, serieDuJour } from '../chapelet/serieDuJour'
import { useGestesChapelet } from '../chapelet/useGestesChapelet'
import { useSuiviDuChapelet } from '../chapelet/useSuiviDuChapelet'
import { IndiceSuite } from '../composants/IndiceSuite'
import { useRetour, useRetourAccueil } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import type { SerieId } from '../recueil/mysteres'
import { lireReglages } from '../reglages/reglages'
import { retirerNotification } from '../telephone/notifications'
import './EcranChapelet.css'

// Le chapelet s'ouvre sur son seuil, écran de passage : commencer (ou
// reprendre, ou recommencer) le remplace dans l'historique, si bien que la
// croix de la prière, comme le retour d'Android, ramène là d'où le seuil a été
// ouvert (décision du porteur du projet, 2026-10-09). Rouvrir le chapelet
// repasse par son seuil, qui propose la reprise.
export function EcranChapelet({ forme = 'chapelet' }: { forme?: Forme }) {
  const { serie: serieChoisie } = useParams()
  const { pathname, state } = useLocation()
  const naviguer = useNavigate()
  const [aujourdhui] = useState(() => new Date())
  const duJour = serieDuJour(aujourdhui)
  const prier = (state as { prier?: boolean } | null)?.prier === true
  const enCours = lireEnCours(aujourdhui, forme)
  // Le chapelet ouvert, son rappel n'a plus à rester affiché (le Rosaire n'a
  // plus de rappel, mais l'un programmé avant les deux seuils peut l'être).
  useEffect(() => {
    void retirerNotification(`/${forme}`)
  }, [forme])
  const commencer = () => naviguer(pathname, { replace: true, state: { prier: true } })
  const recommencer = () => {
    effacerEnCours(forme)
    commencer()
  }

  // Le Rosaire : les quatre séries à la suite, de la joyeuse à la glorieuse.
  if (forme === 'rosaire')
    return prier ? (
      <Chapelet key="rosaire" forme="rosaire" serie={duJour} date={aujourdhui} />
    ) : (
      <Seuil
        key="rosaire"
        forme="rosaire"
        serie={duJour}
        duJour={duJour}
        date={aujourdhui}
        enCours={enCours}
        onCommencer={commencer}
        onRecommencer={recommencer}
      />
    )
  if (serieChoisie !== undefined && !estSerie(serieChoisie))
    return <Navigate to="/chapelet" replace />
  const serie = serieChoisie ?? duJour
  if (!prier)
    return (
      <Seuil
        key={serie}
        forme="chapelet"
        serie={serie}
        duJour={duJour}
        date={aujourdhui}
        enCours={enCours?.serie === serie ? enCours : null}
        onCommencer={commencer}
        onRecommencer={recommencer}
      />
    )
  return <Chapelet key={serie} forme="chapelet" serie={serie} date={aujourdhui} />
}

function Chapelet({ forme, serie, date }: { forme: Forme; serie: SerieId; date: Date }) {
  const [reglages] = useState(lireReglages)
  const rosaire = forme === 'rosaire'
  const definition = rosaire ? ROSAIRE : CHAPELET_MARIAL
  // Les Litanies et saint Joseph « en octobre » suivent le jour du chapelet.
  const deroule = useMemo(
    () => derouler(definition, optionsDuDeroule(reglages, date)),
    [definition, reglages, date],
  )
  const plan = useMemo(() => disposer(deroule), [deroule])
  const [passages] = useState(() => choisirPassages(definition.series ?? [serie], lireLectures))
  // L'intention du pape pour le mois du chapelet (phase 18).
  const [duMois] = useState(() => intentionDuMois(date))
  // Reprend au grain exact un chapelet de cette série (ou le Rosaire)
  // commencé aujourd'hui.
  const [index, setIndex] = useState(() => {
    const enCours = lireEnCours(date, forme)
    return enCours && (rosaire || enCours.serie === serie) ? retrouver(deroule, enCours) : 0
  })
  const [aideOuverte, setAideOuverte] = useState(aideAMontrer)
  const { fin, cachee } = useSuiteCachee()
  const pincer = usePincement<HTMLElement>()
  const retour = useRetour()
  const revenirAccueil = useRetourAccueil()

  const nombre = deroule.pas.length
  const termine = index === nombre
  const pas = termine ? undefined : deroule.pas[index]
  // L'annonce ne s'avance que par la grosse perle.
  const surAnnonce = pas?.priere === 'annonce'
  // Au Rosaire, la série où l'on en est ; au chapelet, celle du seuil.
  const serieEnCours = serieAtteinte(deroule, index, serie)
  const nom = rosaire ? 'Rosaire' : 'Chapelet'

  useSuiviDuChapelet({
    deroule,
    index,
    date,
    forme,
    serie,
    serieEnCours,
    vibrations: reglages.vibrations,
  })
  const gestes = useGestesChapelet({ index, nombre, setIndex, surAnnonce, aideOuverte })

  return (
    <main ref={pincer} className="chapelet" data-pas={index} {...gestes}>
      <EnteteChapelet
        date={date}
        serie={serieEnCours}
        rosaire={rosaire}
        onFermer={retour}
        onAide={() => setAideOuverte(true)}
      />

      <ChapeletDessine
        plan={plan}
        grainCourant={pas ? pas.grain : plan.points.length}
        libelle={termine ? `${nom} terminé` : `${nom}, prière ${index + 1} sur ${nombre}`}
      />

      <PasEnCours
        pas={pas}
        index={index}
        serie={serieEnCours}
        passages={passages[serieEnCours]}
        reglages={reglages}
        rosaire={rosaire}
        intentionDuMois={duMois}
        onAvancer={() => setIndex((i) => avancer(i, nombre))}
        onAccueil={revenirAccueil}
      />

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
