import { HEURE_PROPOSEE_LECTURES, type Rappel } from './reglages'

// L'interrupteur d'un rappel, sur sa ligne comme sur sa page. Activé, l'app
// demande ce qu'il lui faut (`onActiver`). L'office des lectures n'a pas
// d'heure : on lui propose 6 h 30, que l'horloge ouverte aussitôt (`champ`)
// permet de changer.
export function basculerRappel(
  { actif, heure }: Rappel,
  onChanger: (changement: Partial<Rappel>) => void,
  onActiver: () => void,
  champ?: HTMLInputElement | null,
) {
  if (actif) return onChanger({ actif: false })
  if (!heure) {
    onChanger({ actif: true, heure: HEURE_PROPOSEE_LECTURES })
    try {
      champ?.showPicker()
    } catch {
      // Sans horloge (navigateur ancien), l'heure se règle en touchant « 6 h 30 ».
    }
  } else onChanger({ actif: true })
  onActiver()
}

// « 07:05 » pour le champ d'heure, rien sans heure.
export const versChamp = (heure?: { heures: number; minutes: number }) =>
  heure ? `${String(heure.heures).padStart(2, '0')}:${String(heure.minutes).padStart(2, '0')}` : ''

// L'heure choisie dans l'horloge d'Android, ou rien si le champ est vide.
export function versHeure(valeur: string) {
  const [heures, minutes] = valeur.split(':').map(Number)
  return Number.isInteger(heures) && Number.isInteger(minutes) ? { heures, minutes } : undefined
}
