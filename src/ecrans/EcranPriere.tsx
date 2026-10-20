import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { usePincement } from '../affichage/usePincement'
import { avecExposants } from '../composants/Exposants'
import { FinDePriere } from '../composants/FinDePriere'
import { IndiceSuite } from '../composants/IndiceSuite'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour, useRetourAccueil } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateDuJour, dateLisible } from '../office/dates'
import { estPriereSeule, PRIERES_SEULES } from '../prieres/seules'
import { TextePriereComposee } from '../prieres/TextePriereComposee'
import { lireReglages } from '../reglages/reglages'
import { retirerNotification } from '../telephone/notifications'
import './EcranPriere.css'

// Une prière seule, ouverte par le menu : comme une prière du chapelet, sans
// chapelet ni compteur, puis la fin d'un office (choix du porteur du projet,
// 2026-10-08). La taille se règle au pincement ; à plusieurs, ℣ et ℟.
// L'Angélus s'ouvre aussi par l'accueil et par son rappel, que l'ouvrir retire.
export function EcranPriere() {
  const { priere: id = '' } = useParams()
  const [reglages] = useState(lireReglages)
  const pincer = usePincement<HTMLElement>()
  const { fin, cachee } = useSuiteCachee()
  const retour = useRetour()
  const revenirAccueil = useRetourAccueil()
  useEffect(() => void retirerNotification(`/priere/${id}`), [id])
  if (!estPriereSeule(id)) return <Navigate to="/" replace />
  const priere = PRIERES_SEULES[id]
  return (
    <main ref={pincer} className="priere-seule">
      <LigneFermer onFermer={retour}>
        <p className="ligne-date">{avecExposants(dateLisible(dateDuJour()))}</p>
      </LigneFermer>
      <h1>{priere.titre}</h1>
      <TextePriereComposee
        priere={priere}
        plusieurs={reglages.plusieurs}
        replier={!reglages.prieresEntieres}
      />
      <FinDePriere libelle="Fin de la prière" onAccueil={revenirAccueil} />
      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee} />
    </main>
  )
}
