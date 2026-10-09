import { ecrire, lireObjet } from '../chapelet/stockage'
import type { Heure } from '../office/heures'
import {
  DECALAGE_MAX,
  HEURES_SOLAIRES_PAR_DEFAUT,
  OFFICES_SOLAIRES,
  PAS_DU_DECALAGE,
  type Limite,
  type OfficeSolaire,
  type ReglagesSolaires,
} from '../office/heuresSolaires'
import { RAPPELS_CHANGES } from './reglages'

// Le choix « Fixes | Solaires » et les réglages des heures solaires, à part
// des rappels : repasser aux heures fixes retrouve les heures d'avant.

const CLE = 'avec-dieu.heures-solaires'

const estObjet = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const lireHeure = (v: unknown): Heure | undefined => {
  if (!estObjet(v)) return undefined
  const { heures, minutes } = v
  const valide = (n: unknown, max: number): n is number =>
    typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < max
  return valide(heures, 24) && valide(minutes, 60) ? { heures, minutes } : undefined
}

const lireLimite = (v: unknown, defaut: Limite): Limite => {
  if (!estObjet(v)) return { ...defaut }
  return {
    active: typeof v.active === 'boolean' ? v.active : defaut.active,
    heure: lireHeure(v.heure) ?? defaut.heure,
  }
}

const lireDecalage = (v: unknown) =>
  typeof v === 'number' &&
  Number.isInteger(v) &&
  Math.abs(v) <= DECALAGE_MAX &&
  v % PAS_DU_DECALAGE === 0
    ? v
    : 0

// Chaque valeur enregistrée n'est reprise que si elle a le bon type.
export function lireSolaire(): ReglagesSolaires {
  const lu = lireObjet(CLE)
  const decalages = estObjet(lu.decalages) ? lu.decalages : {}
  const defaut = HEURES_SOLAIRES_PAR_DEFAUT
  return {
    actives: lu.actives === true,
    decalages: Object.fromEntries(
      OFFICES_SOLAIRES.map((office) => [office, lireDecalage(decalages[office])]),
    ) as Record<OfficeSolaire, number>,
    pasAvant: lireLimite(lu.pasAvant, defaut.pasAvant),
    pasApres: lireLimite(lu.pasApres, defaut.pasApres),
  }
}

// Les heures changent : l'accueil suit et les rappels se reprogramment.
export function modifierSolaire(changement: Partial<ReglagesSolaires>): ReglagesSolaires {
  const reglages = { ...lireSolaire(), ...changement }
  ecrire(CLE, JSON.stringify(reglages))
  window.dispatchEvent(new Event(RAPPELS_CHANGES))
  return reglages
}

// Le nouveau décalage d'un office, borné à une heure de part et d'autre.
export function decaler(
  decalages: Record<OfficeSolaire, number>,
  office: OfficeSolaire,
  decalage: number,
): Record<OfficeSolaire, number> {
  const borne = Math.max(-DECALAGE_MAX, Math.min(DECALAGE_MAX, decalage))
  return { ...decalages, [office]: borne }
}
