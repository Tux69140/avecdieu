import type { SerieId } from '../recueil/mysteres'
import { effacer, ecrire, lire, lireObjet } from '../reglages/stockage'

// Ce que l'app retient d'un chapelet à l'autre, en dehors des réglages :
// les lectures de chaque mystère et l'aide aux gestes.

const CLES = {
  lectures: 'avec-dieu.lectures',
  aide: 'avec-dieu.aide-gestes',
}

export function lireLectures(serie: SerieId, rang: number): number {
  const n = lireObjet(CLES.lectures)[`${serie}-${rang}`]
  return typeof n === 'number' && Number.isInteger(n) && n > 0 ? n : 0
}

// Nombre de lectures de chaque mystère, par clé « série-rang » (rang de 1 à 5).
export function compterLecture(serie: SerieId, rang: number) {
  const lectures = lireObjet(CLES.lectures)
  lectures[`${serie}-${rang}`] = lireLectures(serie, rang) + 1
  ecrire(CLES.lectures, JSON.stringify(lectures))
}

export function aideAMontrer(): boolean {
  return lire(CLES.aide) !== 'masquee'
}

export function masquerAide() {
  ecrire(CLES.aide, 'masquee')
}

// Rétablie depuis les réglages : elle revient au prochain chapelet.
export function montrerAide() {
  effacer(CLES.aide)
}
