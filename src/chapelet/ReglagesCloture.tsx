import { Interrupteur } from '../composants/Interrupteur'
import type { Reglages } from '../reglages/reglages'
import { ChoixFrequence } from './ChoixFrequence'
import { finDe, PRIERE_SAINT_PERE } from './libelles'

interface Props {
  reglages: Reglages
  onModifier: (changement: Partial<Reglages>) => void
  // Ouverte du seuil du Rosaire : « Fin du Rosaire » (phase 18).
  rosaire?: boolean
}

// Les textes de la fin du chapelet, dans l'ordre où ils se disent (libellés
// validés par le porteur du projet, 2026-10-08), précédés de la prière aux
// intentions du Saint-Père (phase 18).
export function ReglagesCloture({ reglages, onModifier, rosaire = false }: Props) {
  return (
    <>
      <h2 className="petit-titre">{finDe(rosaire ? 'rosaire' : 'chapelet')}</h2>
      <Interrupteur
        libelle={PRIERE_SAINT_PERE}
        actif={reglages.saintPere}
        onBasculer={(saintPere) => onModifier({ saintPere })}
      />
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
        valeur={reglages.saintJoseph}
        onChoisir={(saintJoseph) => onModifier({ saintJoseph })}
      />
    </>
  )
}
