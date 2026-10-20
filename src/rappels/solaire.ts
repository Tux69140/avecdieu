import { lireHeure } from '../office/heure'
import {
  DECALAGE_MAX,
  HEURES_SOLAIRES_PAR_DEFAUT,
  PRIERES_SOLAIRES,
  PAS_DU_DECALAGE,
  type Limite,
  type PriereSolaire,
  type ReglagesSolaires,
} from '../office/heuresSolaires'
import { ecrireEtSignaler, estObjet, lireObjet, RACINE } from '../reglages/stockage'
import { RAPPELS_CHANGES } from './reglages'

// Le choix « Fixes | Solaires » et les réglages des heures solaires, à part
// des rappels : repasser aux heures fixes retrouve les heures d'avant.

const CLE = `${RACINE}heures-solaires`

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
      PRIERES_SOLAIRES.map((priere) => [priere, lireDecalage(decalages[priere])]),
    ) as Record<PriereSolaire, number>,
    pasAvant: lireLimite(lu.pasAvant, defaut.pasAvant),
    pasApres: lireLimite(lu.pasApres, defaut.pasApres),
    angelusPasAvant: lireLimite(lu.angelusPasAvant, defaut.angelusPasAvant),
    angelusPasApres: lireLimite(lu.angelusPasApres, defaut.angelusPasApres),
  }
}

// Les heures changent : l'accueil suit et les rappels se reprogramment.
export function modifierSolaire(changement: Partial<ReglagesSolaires>): ReglagesSolaires {
  const reglages = { ...lireSolaire(), ...changement }
  ecrireEtSignaler(CLE, reglages, RAPPELS_CHANGES)
  return reglages
}

// Le nouveau décalage d’une prière, borné à une heure de part et d'autre.
export function decaler(
  decalages: Record<PriereSolaire, number>,
  priere: PriereSolaire,
  decalage: number,
): Record<PriereSolaire, number> {
  const borne = Math.max(-DECALAGE_MAX, Math.min(DECALAGE_MAX, decalage))
  return { ...decalages, [priere]: borne }
}
