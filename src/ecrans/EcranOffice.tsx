import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { usePincement } from '../affichage/usePincement'
import { saintDuJour } from '../accueil/bandeau'
import { IndiceSuite } from '../composants/IndiceSuite'
import { useRetour, useRetourAccueil } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { estDate, estPaques } from '../office/dates'
import { cheminOffice, estNomOffice, type NomOffice, NOMS_OFFICES } from '../office/modele'
import { aideOfficeAMontrer } from '../office/aide'
import { AideOffice } from '../office/AideOffice'
import { AvisOffice } from '../office/AvisOffice'
import { BandeauOffice } from '../office/BandeauOffice'
import { CorpsOffice } from '../office/CorpsOffice'
import { EnteteOffice } from '../office/EnteteOffice'
import { etapesDe } from '../office/etapes'
import { SommaireOffice } from '../office/SommaireOffice'
import { useACommence } from '../office/useACommence'
import { useChargementOffice } from '../office/useChargementOffice'
import { useInvitatoireRecu } from '../office/useInvitatoireRecu'
import { useLectureRetrouvee } from '../office/useLectureRetrouvee'
import { useReperage } from '../office/useReperage'
import { useSommaire } from '../office/useSommaire'
import { lireReglages } from '../reglages/reglages'
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

function LectureOffice({ nom, date }: { nom: NomOffice; date: string }) {
  const [{ accents, plusieurs, prieresEntieres, signalerAjouts, consignes }] =
    useState(lireReglages)
  const { etat, office, reessayer, lienInvitatoire, prendreInvitatoire } = useChargementOffice(
    nom,
    date,
    { plusieurs, consignes },
  )
  const retour = useRetour()
  const revenirAccueil = useRetourAccueil()
  const naviguer = useNavigate()
  const [aideOuverte, setAideOuverte] = useState(aideOfficeAMontrer)
  const { fin, cachee } = useSuiteCachee()
  const aCommence = useACommence()
  const texte = useRef<HTMLDivElement>(null)
  const pincer = usePincement<HTMLElement>()
  // Comme au chapelet : le téléphone ne se verrouille pas en pleine lecture.
  useEffect(() => garderEcranAllume(), [])
  // L'office ouvert, son rappel n'a plus à rester affiché.
  useEffect(() => void retirerNotification(cheminOffice(nom, date)), [nom, date])

  const saint = etat.sorte === 'pret' ? saintDuJour(etat.lu.jour) : undefined

  useLectureRetrouvee(office)

  // Phase 7 : l'étape en cours, dans le bandeau et le sommaire.
  const etapes = useMemo(() => etapesDe(office?.parties ?? []), [office])
  const titre = useRef<HTMLHeadingElement>(null)
  const bandeau = useRef<HTMLElement>(null)
  const { bandeauVisible, courante, allerA } = useReperage({ titre, texte, bandeau }, etapes.length)
  const sommaire = useSommaire(allerA)

  const recevoirInvitatoire = useInvitatoireRecu(texte, office, prendreInvitatoire)

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
        <EnteteOffice
          nom={nom}
          date={date}
          titre={titre}
          saint={saint}
          perles={office && { etapes, courante }}
          onFermer={retour}
          onAide={() => setAideOuverte(true)}
          onSommaire={sommaire.ouvrir}
          onRecevoirInvitatoire={lienInvitatoire ? recevoirInvitatoire : undefined}
        />

        {etat.sorte === 'chargement' && (
          <p className="office-chargement" role="status">
            Chargement de l’office…
          </p>
        )}

        {etat.sorte === 'erreur' && (
          <AvisOffice
            absent={etat.absent}
            paques={etat.absent && nom === 'lectures' && estPaques(date)}
            enregistres={etat.enregistres}
            onReessayer={reessayer}
            onAccueil={revenirAccueil}
            onLaudes={() => naviguer(cheminOffice('laudes', date))}
          />
        )}

        {etat.sorte === 'pret' && office && (
          <CorpsOffice
            ref={texte}
            parties={office.parties}
            etapes={etapes}
            couleur={etat.lu.jour.couleurs[0]}
            replier={!prieresEntieres}
            onAccueil={revenirAccueil}
          />
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
