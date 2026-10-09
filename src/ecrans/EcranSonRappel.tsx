import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { ChoixSon } from '../rappels/ChoixSon'
import { estPriere, lireRappels, modifierRappel, type Priere } from '../rappels/reglages'
import { NOMS_PRIERES } from '../rappels/textes'
import { PageReglages } from '../reglages/PageReglages'
import '../rappels/Rappels.css'

// Réglages › Rappels › une prière › Son (/reglages/rappels/<prière>/son) :
// les cloches à écouter, le son du téléphone, un MP3 (2026-10-09). Le choix
// s'enregistre aussitôt ; la croix remonte à la page de la prière.
export function EcranSonRappel() {
  const { priere } = useParams()
  if (!estPriere(priere)) return <Navigate to="/reglages/rappels" replace />
  return <PageSon key={priere} priere={priere} />
}

function PageSon({ priere }: { priere: Priere }) {
  const [rappel, setRappel] = useState(() => lireRappels()[priere])
  return (
    <PageReglages titre="Son">
      <ChoixSon
        id={`son-${priere}`}
        nom={NOMS_PRIERES[priere]}
        rappel={rappel}
        onChanger={(changement) => setRappel(modifierRappel(priere, changement)[priere])}
      />
    </PageReglages>
  )
}
