import type { SerieId } from './mysteres'
import { PASSAGES_DOULOUREUX } from './passages-aelf/douloureux'
import { PASSAGES_GLORIEUX } from './passages-aelf/glorieux'
import { PASSAGES_JOYEUX } from './passages-aelf/joyeux'
import { PASSAGES_LUMINEUX } from './passages-aelf/lumineux'

// Passages bibliques médités pendant les dizaines. Chaque mystère en a plusieurs,
// qui tournent (voir chapelet/rotation.ts). Les textes vivent dans un recueil par
// traduction : changer de traduction, c'est écrire un autre dossier du même
// format et le désigner ici, sans toucher au reste de l'app.
export interface Passage {
  reference: string
  // Numéro du verset → texte, dans l'ordre de lecture.
  versets: Record<number, string>
}

export type PassagesDUneSerie = [Passage[], Passage[], Passage[], Passage[], Passage[]]

// Traduction retenue : la Bible de la traduction liturgique (AELF), recopiée mot
// pour mot depuis aelf.org, validée par le porteur du projet le 2026-10-06.
export const PASSAGES: Record<SerieId, PassagesDUneSerie> = {
  joyeux: PASSAGES_JOYEUX,
  lumineux: PASSAGES_LUMINEUX,
  douloureux: PASSAGES_DOULOUREUX,
  glorieux: PASSAGES_GLORIEUX,
}
