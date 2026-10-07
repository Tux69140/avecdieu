import { effacer, ecrire, lire } from '../chapelet/stockage'
import { decaler } from '../office/dates'
import { OFFICES, type NomOffice } from '../office/modele'

// Les réponses de l'AELF, gardées telles quelles dans la mémoire du téléphone :
// relues par le module frontière, elles profitent de chaque correction de sa
// lecture du HTML. Rangées par zone, ressource et date (docs/PLAN.md).
export const ZONE = 'france'

// Ce que l'AELF peut donner : le jour liturgique (« informations »), ou un office.
export type Ressource = 'informations' | NomOffice
export const RESSOURCES: readonly Ressource[] = ['informations', ...OFFICES]

// L'AELF ne propose pas cet office ce jour-là (404) : c'est aussi une réponse.
export const ABSENT = 'absent'

const PREFIXE = `avec-dieu.aelf.${ZONE}.`
const cle = (ressource: string, date: string) => `${PREFIXE}${ressource}.${date}`

export function lireEnregistre(ressource: Ressource, date: string): unknown {
  const valeur = lire(cle(ressource, date))
  if (valeur === null) return undefined
  if (valeur === ABSENT) return ABSENT
  try {
    return JSON.parse(valeur)
  } catch {
    return undefined
  }
}

export const contient = (ressource: Ressource, date: string) =>
  lireEnregistre(ressource, date) !== undefined

export function enregistrer(ressource: Ressource, date: string, reponse: unknown) {
  ecrire(cle(ressource, date), reponse === ABSENT ? ABSENT : JSON.stringify(reponse))
}

export const oublier = (ressource: Ressource, date: string) => effacer(cle(ressource, date))

// Les entrées enregistrées, lues dans les clés : [ressource, date].
function entrees(): [string, string][] {
  try {
    const trouvees: [string, string][] = []
    for (let i = 0; i < localStorage.length; i++) {
      const nom = localStorage.key(i)
      if (!nom?.startsWith(PREFIXE)) continue
      const [ressource, date] = nom.slice(PREFIXE.length).split('.')
      trouvees.push([ressource, date])
    }
    return trouvees
  } catch {
    return []
  }
}

export function effacerAvant(date: string) {
  for (const [ressource, jour] of entrees()) if (jour < date) effacer(cle(ressource, jour))
}

export interface Etendue {
  debut: string
  fin: string
}

// Les jours qu'on peut prier sans réseau : ceux dont le jour liturgique et les
// sept offices sont enregistrés, d'affilée. Parmi les suites de jours complets,
// celle qui contient aujourd'hui, sinon la dernière.
export function etendue(aujourdhui: string): Etendue | undefined {
  const parJour = new Map<string, number>()
  for (const [, date] of entrees()) parJour.set(date, (parJour.get(date) ?? 0) + 1)
  const complets = [...parJour]
    .filter(([date]) => RESSOURCES.every((r) => contient(r, date)))
    .map(([date]) => date)
    .sort()

  const suites: Etendue[] = []
  for (const date of complets) {
    const derniere = suites.at(-1)
    if (derniere && decaler(derniere.fin, 1) === date) derniere.fin = date
    else suites.push({ debut: date, fin: date })
  }
  return suites.find((s) => s.debut <= aujourdhui && aujourdhui <= s.fin) ?? suites.at(-1)
}
