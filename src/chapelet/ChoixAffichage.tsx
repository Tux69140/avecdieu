import { Bascule } from '../composants/Bascule'
import type { Affichage } from '../reglages/reglages'

interface Props {
  affichage: Affichage
  onChoisir: (affichage: Affichage) => void
  // Identifiant du titre qui nomme le choix.
  titre: string
}

const AFFICHAGES = [
  ['complet', 'Texte complet'],
  ['compact', 'Compact'],
] as const

// Texte complet ou compact : sur le seuil et dans les réglages, la même mémoire.
export function ChoixAffichage({ affichage, onChoisir, titre }: Props) {
  return (
    <>
      <Bascule choix={AFFICHAGES} valeur={affichage} onChoisir={onChoisir} titre={titre} />
      <p className="choix-aide">
        Compact : le nom de la prière et le compteur, pour qui la sait par cœur.
      </p>
    </>
  )
}
