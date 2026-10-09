import { enMinutes, type Heure } from '../office/heure'
import { PRIERES_RAPPELEES, type Priere } from '../rappels/reglages'

// Où en est la journée de prière, chapelet compris (à son heure, il est la
// prière du moment comme un office : choix du porteur du projet, 2026-10-08).
// « libre » : une prière sans heure, comme l'office des lectures, qui se dit à
// toute heure et n'est jamais du moment.
type EtatOffice = 'passe' | 'moment' | 'a-venir' | 'libre'

export interface Journee {
  moment?: Priere
  etats: Record<Priere, EtatOffice>
}

// Une prière est « du moment » de 30 minutes avant son heure à une heure
// après (choix du porteur du projet, 2026-10-06 et 2026-10-08) : à 18 h 40, on
// veut encore dire les vêpres de 18 h 30 ; à 10 h, sexte de midi est encore
// loin. Hors de ces créneaux, aucune.
const AVANCE = 30
const HEURE_DE_GRACE = 60

// La prière du moment : celle dont le créneau contient l'heure qu'il est ; si
// deux créneaux se chevauchent, la plus proche de son heure (à égalité, celle
// déjà commencée). « maintenant » : minutes écoulées depuis minuit.
// « candidates » : les prières qui peuvent l'être ; sans aucun texte des
// offices (premier lancement sans réseau), aucune : un badge y serait
// trompeur (2026-10-08).
export function situerOffices(
  heures: Partial<Record<Priere, Heure>>,
  maintenant: number,
  candidates: readonly Priere[] = PRIERES_RAPPELEES,
): Journee {
  const ecart = (debut: number) => Math.abs(maintenant - debut)
  const moment = candidates
    .flatMap((nom) => {
      const heure = heures[nom]
      return heure ? [{ nom, debut: enMinutes(heure) }] : []
    })
    .filter(({ debut }) => maintenant >= debut - AVANCE && maintenant < debut + HEURE_DE_GRACE)
    .sort((x, y) => ecart(x.debut) - ecart(y.debut) || x.debut - y.debut)[0]

  const etats = {} as Record<Priere, EtatOffice>
  for (const nom of PRIERES_RAPPELEES) {
    const heure = heures[nom]
    if (!heure) etats[nom] = 'libre'
    else if (nom === moment?.nom) etats[nom] = 'moment'
    else etats[nom] = enMinutes(heure) <= maintenant ? 'passe' : 'a-venir'
  }
  return { moment: moment?.nom, etats }
}
