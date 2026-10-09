import { decaler } from '../office/dates'
import { OFFICES, type NomOffice } from '../office/modele'
import { lireReglages } from '../reglages/reglages'
import { clesCommencantPar, ecrire, effacer, lire, RACINE } from '../reglages/stockage'

// Les réponses de l'AELF, gardées telles quelles dans la mémoire du téléphone :
// relues par le module frontière, elles profitent de chaque correction de sa
// lecture du HTML. Rangées par zone, ressource et date (docs/PLAN.md) ; seules
// celles de la zone choisie dans les réglages comptent.
export const zoneChoisie = () => lireReglages().zone

// Ce que l'AELF peut donner : le jour liturgique (« informations »), ou un office.
export type Ressource = 'informations' | NomOffice
export const RESSOURCES: readonly Ressource[] = ['informations', ...OFFICES]

// L'AELF ne propose pas cet office ce jour-là (404) : c'est aussi une réponse.
export const ABSENT = 'absent'

const RACINE_AELF = `${RACINE}aelf.`
// Le début des clés d'une zone : la réinitialisation garde celles de la France.
export const prefixeDeZone = (zone: string) => `${RACINE_AELF}${zone}.`
const prefixe = () => prefixeDeZone(zoneChoisie())
const cle = (ressource: string, date: string) => `${prefixe()}${ressource}.${date}`

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

// Les entrées enregistrées pour la zone choisie, lues dans les clés : [ressource, date].
function entrees(): [string, string][] {
  const debut = prefixe()
  return clesCommencantPar(debut).map(
    (nom) => nom.slice(debut.length).split('.') as [string, string],
  )
}

export function effacerAvant(date: string) {
  for (const [ressource, jour] of entrees()) if (jour < date) effacer(cle(ressource, jour))
}

// Un changement de zone : les textes des autres zones n'ont plus d'usage.
export function oublierTout() {
  for (const nom of clesCommencantPar(RACINE_AELF)) effacer(nom)
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
