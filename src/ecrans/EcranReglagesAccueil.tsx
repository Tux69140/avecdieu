import { useState } from 'react'
import { lireAffichees, modifierAffichee, PRIERES_AFFICHABLES } from '../accueil/affichees'
import { Interrupteur } from '../composants/Interrupteur'
import { NOMS_PRIERES } from '../rappels/textes'
import { PageReglages } from '../reglages/PageReglages'

const NOMS = { ...NOMS_PRIERES, rosaire: 'Rosaire' }

// Réglages › Accueil (phase 19, libellés validés le 2026-10-20) : un
// interrupteur par prière, dans l'ordre de l'accueil ; tout est affiché au
// départ. Un office masqué perd aussi sa perle du cadran.
export function EcranReglagesAccueil() {
  const [affichees, setAffichees] = useState(lireAffichees)
  return (
    <PageReglages titre="Accueil">
      <h2 className="petit-titre" id="prieres-affichees">
        Prières affichées
      </h2>
      <div className="reglages-liste" role="group" aria-labelledby="prieres-affichees">
        {PRIERES_AFFICHABLES.map((priere) => (
          <Interrupteur
            key={priere}
            libelle={NOMS[priere]}
            actif={affichees[priere]}
            onBasculer={(affichee) => setAffichees(modifierAffichee(priere, affichee))}
          />
        ))}
      </div>
    </PageReglages>
  )
}
