import type { SerieId } from '../recueil/mysteres'

// Ce que l'app retient d'un chapelet à l'autre, sur le téléphone seulement.
// Une mémoire indisponible (stockage bloqué, plein) ne doit jamais interrompre
// la prière : on retombe sur les valeurs par défaut et on oublie l'écriture.
// Les réglages de la phase 4 reprendront l'affichage.

export type Affichage = 'complet' | 'compact'

const CLES = {
  lectures: 'avec-dieu.lectures',
  affichage: 'avec-dieu.affichage',
  aide: 'avec-dieu.aide-gestes',
}

function lire(cle: string): string | null {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}

function ecrire(cle: string, valeur: string) {
  try {
    localStorage.setItem(cle, valeur)
  } catch {
    // Rien à faire : la prière continue sans mémoire.
  }
}

// Nombre de lectures de chaque mystère, par clé « série-rang » (rang de 1 à 5).
function toutesLesLectures(): Record<string, number> {
  try {
    const valeur: unknown = JSON.parse(lire(CLES.lectures) ?? '{}')
    return typeof valeur === 'object' && valeur !== null ? (valeur as Record<string, number>) : {}
  } catch {
    return {}
  }
}

export function lireLectures(serie: SerieId, rang: number): number {
  const n = toutesLesLectures()[`${serie}-${rang}`]
  return Number.isInteger(n) && n > 0 ? n : 0
}

export function compterLecture(serie: SerieId, rang: number) {
  const lectures = toutesLesLectures()
  lectures[`${serie}-${rang}`] = lireLectures(serie, rang) + 1
  ecrire(CLES.lectures, JSON.stringify(lectures))
}

export function lireAffichage(): Affichage {
  return lire(CLES.affichage) === 'compact' ? 'compact' : 'complet'
}

export function retenirAffichage(affichage: Affichage) {
  ecrire(CLES.affichage, affichage)
}

export function aideAMontrer(): boolean {
  return lire(CLES.aide) !== 'masquee'
}

export function masquerAide() {
  ecrire(CLES.aide, 'masquee')
}
