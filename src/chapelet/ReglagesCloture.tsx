import { Interrupteur } from '../composants/Interrupteur'
import { ChoixFrequence } from './ChoixFrequence'
import type { Reglages } from './reglages'

interface Props {
  reglages: Reglages
  onModifier: (changement: Partial<Reglages>) => void
}

// Les textes de la fin du chapelet, dans l'ordre où ils se disent (libellés
// validés par le porteur du projet, 2026-10-08).
export function ReglagesCloture({ reglages, onModifier }: Props) {
  return (
    <>
      <h3>Fin du chapelet</h3>
      <Interrupteur
        libelle="Salve Regina"
        actif={reglages.salveRegina}
        onBasculer={(salveRegina) => onModifier({ salveRegina })}
      />
      <ChoixFrequence
        libelle="Litanies de la Sainte Vierge"
        aide="Octobre est le mois du Rosaire."
        valeur={reglages.litanies}
        onChoisir={(litanies) => onModifier({ litanies })}
      />
      <Interrupteur
        libelle="Oraison du Rosaire"
        aide="Précédée du verset “Priez pour nous, sainte Mère de Dieu”."
        actif={reglages.oraisonRosaire}
        onBasculer={(oraisonRosaire) => onModifier({ oraisonRosaire })}
      />
      <Interrupteur
        libelle="Sous l’abri de votre miséricorde"
        actif={reglages.sousLAbri}
        onBasculer={(sousLAbri) => onModifier({ sousLAbri })}
      />
      <ChoixFrequence
        libelle="Prière à saint Joseph"
        aide="Demandée par Léon XIII pour le mois du Rosaire."
        valeur={reglages.saintJoseph}
        onChoisir={(saintJoseph) => onModifier({ saintJoseph })}
      />
    </>
  )
}
