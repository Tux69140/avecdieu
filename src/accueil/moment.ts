import type { Heure } from '../office/heures'
import { OFFICES, type NomOffice } from '../office/modele'

// Où en est la journée de prière. « libre » : l'office des lectures, sans
// heure, qui se dit à toute heure et n'est jamais du moment.
export type EtatOffice = 'passe' | 'moment' | 'a-venir' | 'libre'

export interface Journee {
  moment?: NomOffice
  etats: Record<NomOffice, EtatOffice>
}

// Un office reste « du moment » une heure après son heure (choix du porteur du
// projet, 2026-10-06) : à 18 h 40, on veut encore dire les vêpres de 18 h 30.
export const HEURE_DE_GRACE = 60

const enMinutes = ({ heures, minutes }: Heure) => heures * 60 + minutes

// La prière du moment : le dernier office commencé depuis moins d'une heure,
// sinon le prochain ; passé le dernier, les complies le restent jusqu'à minuit.
// « maintenant » : minutes écoulées depuis minuit.
export function situerOffices(
  heures: Record<NomOffice, Heure | undefined>,
  maintenant: number,
): Journee {
  const dates = OFFICES.flatMap((nom) => {
    const heure = heures[nom]
    return heure ? [{ nom, debut: enMinutes(heure) }] : []
  }).sort((x, y) => x.debut - y.debut)
  const commences = dates.filter((o) => o.debut <= maintenant)
  const dernier = commences.at(-1)
  const moment =
    dernier && maintenant < dernier.debut + HEURE_DE_GRACE
      ? dernier
      : (dates.find((o) => o.debut > maintenant) ?? dernier)

  const etats = {} as Record<NomOffice, EtatOffice>
  for (const nom of OFFICES) {
    const heure = heures[nom]
    if (!heure) etats[nom] = 'libre'
    else if (nom === moment?.nom) etats[nom] = 'moment'
    else etats[nom] = enMinutes(heure) <= maintenant ? 'passe' : 'a-venir'
  }
  return { moment: moment?.nom, etats }
}
