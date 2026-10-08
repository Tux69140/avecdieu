import { PRIERES, VERSET_MARIAL, type Priere, type PriereId } from '../recueil/prieres'
import type { Pas } from './deroule'

// Le verset et la ligne vide qui le sépare de la prière.
const AVEC_BLANC = ['', ...VERSET_MARIAL]

const finitParLeVerset = (lignes: string[]) =>
  AVEC_BLANC.every((ligne, i) => lignes[lignes.length - AVEC_BLANC.length + i] === ligne)

// La prière telle qu'elle se dit à ce pas du chapelet. Le verset marial ne se
// dit qu'une fois (2026-10-08) : le Salve Regina le perd quand il passe avant
// l'oraison du Rosaire. Les textes restent ceux du recueil.
export function priereDuPas({
  priere,
  verset,
}: Pick<Pas, 'verset'> & { priere: PriereId }): Priere {
  const texte = PRIERES[priere]
  let lignes = texte.lignes
  if (verset !== 'apres' && finitParLeVerset(lignes)) lignes = lignes.slice(0, -AVEC_BLANC.length)
  if (verset === 'apres' && !finitParLeVerset(lignes)) lignes = [...lignes, ...AVEC_BLANC]
  if (verset === 'avant') lignes = [...VERSET_MARIAL, '', ...lignes]
  return lignes === texte.lignes ? texte : { ...texte, lignes }
}
