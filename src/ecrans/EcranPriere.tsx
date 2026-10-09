import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { usePincement } from '../affichage/usePincement'
import { TextePriere } from '../chapelet/TextePriere'
import { avecExposants } from '../composants/Exposants'
import { FinDePriere } from '../composants/FinDePriere'
import { IndiceSuite } from '../composants/IndiceSuite'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour, useRetourAccueil } from '../composants/retour'
import { useSuiteCachee } from '../composants/suiteCachee'
import { dateDuJour, dateLisible } from '../office/dates'
import { estPriereSeule, PRIERES_SEULES } from '../prieres/seules'
import { lireReglages } from '../reglages/reglages'
import './EcranPriere.css'

// Une prière seule, ouverte par le menu : comme une prière du chapelet, sans
// chapelet ni compteur, puis la fin d'un office (choix du porteur du projet,
// 2026-10-08). La taille se règle au pincement ; à plusieurs, ℣ et ℟.
export function EcranPriere() {
  const { priere: id = '' } = useParams()
  const [reglages] = useState(lireReglages)
  const pincer = usePincement<HTMLElement>()
  const { fin, cachee } = useSuiteCachee()
  const retour = useRetour()
  const revenirAccueil = useRetourAccueil()
  if (!estPriereSeule(id)) return <Navigate to="/" replace />
  const priere = PRIERES_SEULES[id]
  return (
    <main ref={pincer} className="priere-seule">
      <LigneFermer onFermer={retour}>
        <p className="ligne-date">{avecExposants(dateLisible(dateDuJour()))}</p>
      </LigneFermer>
      <h1>{priere.titre}</h1>
      <TextePriere priere={priere} plusieurs={reglages.plusieurs} />
      <FinDePriere libelle="Fin de la prière" onAccueil={revenirAccueil} />
      <div ref={fin} className="fin-ecran" />
      <IndiceSuite visible={cachee} />
    </main>
  )
}
