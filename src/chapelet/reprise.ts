import { SERIES, type SerieId } from '../recueil/mysteres'
import type { Moment } from './definition'
import type { Deroule, Pas } from './deroule'
import { effacer, ecrire, lireObjet } from './stockage'

// Le chapelet en cours, pour reprendre au grain exact après une interruption
// (appel, changement d'app). Il ne vaut que pour le jour où il a été commencé :
// passé minuit, il est abandonné. La position est retenue par la prière
// (dizaine, prière, rang) plutôt que par son rang dans le déroulé, qui change
// si les réglages changent entre-temps.
export interface ChapeletEnCours {
  // AAAA-MM-JJ, à l'heure du téléphone.
  jour: string
  serie: SerieId
  dizaine?: number
  priere: Moment
  rang: number
}

const CLE = 'avec-dieu.en-cours'

export function jourDe(date: Date): string {
  const deux = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}`
}

export function retenirEnCours(date: Date, serie: SerieId, { dizaine, priere, rang }: Pas) {
  const enCours: ChapeletEnCours = { jour: jourDe(date), serie, dizaine, priere, rang }
  ecrire(CLE, JSON.stringify(enCours))
}

export function effacerEnCours() {
  effacer(CLE)
}

// Le chapelet en cours s'il a été commencé ce jour-là, sinon rien.
export function lireEnCours(date: Date): ChapeletEnCours | null {
  const { jour, serie, dizaine, priere, rang } = lireObjet(CLE)
  if (jour !== jourDe(date)) return null
  if (typeof serie !== 'string' || !(serie in SERIES)) return null
  if (typeof priere !== 'string' || typeof rang !== 'number') return null
  if (dizaine !== undefined && typeof dizaine !== 'number') return null
  return { jour, serie: serie as SerieId, dizaine, priere: priere as Moment, rang }
}

// Index du pas où reprendre. Une prière retirée par les réglages entre-temps
// cède la place au début de sa dizaine ; le Salve Regina retiré, à la fin.
export function retrouver(deroule: Deroule, enCours: ChapeletEnCours): number {
  const { pas } = deroule
  const exact = pas.findIndex(
    (p) => p.dizaine === enCours.dizaine && p.priere === enCours.priere && p.rang === enCours.rang,
  )
  if (exact >= 0) return exact
  if (enCours.dizaine === undefined) return enCours.priere === 'salve-regina' ? pas.length : 0
  return Math.max(
    pas.findIndex((p) => p.dizaine === enCours.dizaine),
    0,
  )
}

export function libelleReprise({ dizaine }: ChapeletEnCours): string {
  if (dizaine === undefined) return 'Reprendre le chapelet'
  return `Reprendre à la ${dizaine}${dizaine === 1 ? 're' : 'e'} dizaine`
}
