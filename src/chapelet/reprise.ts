import { dateDuJour } from '../office/dates'
import { SERIES, type SerieId } from '../recueil/mysteres'
import { effacer, ecrire, lireObjet } from '../reglages/stockage'
import { CHAPELET_MARIAL, type Forme, type Moment } from './definition'
import type { Deroule, Pas } from './deroule'
import { rangDeSerie } from './libelles'

// Le chapelet en cours, pour reprendre au grain exact après une interruption
// (appel, changement d'app). Il ne vaut que pour le jour où il a été commencé :
// passé minuit, il est abandonné. La position est retenue par la prière
// (dizaine, prière, rang) plutôt que par son rang dans le déroulé, qui change
// si les réglages changent entre-temps. Le chapelet et le Rosaire en cours
// sont retenus chacun à part : commencer l'un n'efface pas l'autre.
export interface ChapeletEnCours {
  // AAAA-MM-JJ, à l'heure du téléphone.
  jour: string
  forme: Forme
  // Au Rosaire, la série atteinte.
  serie: SerieId
  dizaine?: number
  priere: Moment
  rang: number
  // Dans la fin (prière aux intentions du Saint-Père, clôture) : son Notre
  // Père n'est pas celui de l'ouverture (phase 18).
  fin?: true
}

const CLES: Record<Forme, string> = {
  chapelet: 'avec-dieu.en-cours',
  rosaire: 'avec-dieu.rosaire-en-cours',
}

// Au Rosaire, la série retenue est celle de la dizaine, ou à défaut (ouverture,
// clôture) celle que l'écran montre.
export function retenirEnCours(
  date: Date,
  serie: SerieId,
  { dizaine, priere, rang, serie: serieDuPas, fin }: Pas,
  forme: Forme,
) {
  const enCours: ChapeletEnCours = {
    jour: dateDuJour(date),
    forme,
    serie: serieDuPas ?? serie,
    dizaine,
    priere,
    rang,
    ...(fin && { fin }),
  }
  ecrire(CLES[forme], JSON.stringify(enCours))
}

export function effacerEnCours(forme: Forme) {
  effacer(CLES[forme])
}

// Le chapelet (ou le Rosaire) en cours s'il a été commencé ce jour-là, sinon
// rien. Un chapelet retenu avant le Rosaire n'a pas de forme : c'en est un.
export function lireEnCours(date: Date, forme: Forme): ChapeletEnCours | null {
  const {
    jour,
    forme: retenue = 'chapelet',
    serie,
    dizaine,
    priere,
    rang,
    fin,
  } = lireObjet(CLES[forme])
  if (jour !== dateDuJour(date) || retenue !== forme) return null
  if (typeof serie !== 'string' || !Object.hasOwn(SERIES, serie)) return null
  if (typeof priere !== 'string' || typeof rang !== 'number') return null
  if (dizaine !== undefined && typeof dizaine !== 'number') return null
  const enCours = { jour, forme, serie: serie as SerieId, dizaine, priere: priere as Moment, rang }
  return fin === true ? { ...enCours, fin } : enCours
}

// L'ordre des textes de la fin, et ceux de l'ouverture.
const FIN: Moment[] = CHAPELET_MARIAL.cloture.map((etape) => etape.priere)
const OUVERTURE: Moment[] = CHAPELET_MARIAL.ouverture.map((etape) => etape.priere)

// Retenu avant la phase 18, un texte de la clôture n'a pas la marque de la
// fin : il est le seul hors des dizaines à ne pas être de l'ouverture.
const dansLaFin = ({ fin, dizaine, priere }: ChapeletEnCours) =>
  fin === true || (dizaine === undefined && !OUVERTURE.includes(priere))

// Index du pas où reprendre. Une prière retirée par les réglages entre-temps
// cède la place au début de sa dizaine ; un texte de la fin retiré, au texte
// suivant de la fin, ou à l'écran de fin. Au Rosaire, la dizaine est celle
// de la série retenue (les pas du chapelet n'ont pas de série).
export function retrouver(deroule: Deroule, enCours: ChapeletEnCours): number {
  const fin = dansLaFin(enCours)
  const memeDizaine = (p: Pas) =>
    p.dizaine === enCours.dizaine &&
    (p.serie === undefined || p.serie === enCours.serie) &&
    (p.fin === true) === fin
  const { pas } = deroule
  const exact = pas.findIndex(
    (p) => memeDizaine(p) && p.priere === enCours.priere && p.rang === enCours.rang,
  )
  if (exact >= 0) return exact
  if (fin) {
    const rang = FIN.indexOf(enCours.priere)
    const suivant = pas.findIndex((p) => p.fin && FIN.indexOf(p.priere) > rang)
    return suivant >= 0 ? suivant : pas.length
  }
  if (enCours.dizaine === undefined) return 0
  return Math.max(pas.findIndex(memeDizaine), 0)
}

// « 1re », « 3e » : l'exposant se pose à l'affichage (avecExposants).
const ordinal = (n: number) => `${n}${n === 1 ? 're' : 'e'}`

export function libelleReprise({ forme, serie, dizaine }: ChapeletEnCours): string {
  const rosaire = forme === 'rosaire'
  if (dizaine === undefined) return rosaire ? 'Reprendre le Rosaire' : 'Reprendre le chapelet'
  if (rosaire)
    return `Reprendre à la ${ordinal(rangDeSerie(serie))} série, ${ordinal(dizaine)} dizaine`
  return `Reprendre à la ${ordinal(dizaine)} dizaine`
}
