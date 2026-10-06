import type { Bloc, Ligne, Strophe } from './modele'

// Passage entre le format des recueils (un vers par ligne, '' entre deux
// strophes, « V/ » ou « R/ » en tête) et celui de l'office (strophes, lignes,
// segments), pour que les ajouts s'affichent comme le texte de l'AELF.

export function strophesDe(lignes: string[]): Strophe[] {
  const strophes: Strophe[] = [[]]
  for (const vers of lignes) {
    if (vers === '') {
      strophes.push([])
      continue
    }
    const marque = /^([VR])\/ (.*)$/.exec(vers)
    const ligne: Ligne = marque
      ? [{ texte: `${marque[1]}/`, signe: marque[1] as 'V' | 'R' }, { texte: marque[2] }]
      : [{ texte: vers }]
    strophes[strophes.length - 1].push(ligne)
  }
  return strophes.filter((strophe) => strophe.length > 0)
}

// Le texte suivi, sans repères : pour reconnaître une fin d'oraison ou un verset.
export const texteDe = (strophes: Strophe[]) =>
  strophes
    .flat()
    .map((ligne) => ligne.map((segment) => segment.texte).join(''))
    .join(' ')

export const texteDesBlocs = (blocs: Bloc[]) => texteDe(blocs.flatMap((bloc) => bloc.strophes))

// Les strophes privées de leurs derniers caractères (une abréviation, un
// « Amen »), segments vidés et lignes vides retirés.
export function retrancherFin(strophes: Strophe[], longueur: number): Strophe[] {
  const copie: Strophe[] = strophes.map((strophe) =>
    strophe.map((ligne) => ligne.map((segment) => ({ ...segment }))),
  )
  let reste = longueur
  while (reste > 0 && copie.length > 0) {
    const strophe = copie[copie.length - 1]
    const ligne = strophe[strophe.length - 1]
    const segment = ligne[ligne.length - 1]
    const coupe = Math.min(reste, segment.texte.length)
    segment.texte = segment.texte.slice(0, segment.texte.length - coupe)
    reste -= coupe
    if (segment.texte === '') ligne.pop()
    if (ligne.length === 0) strophe.pop()
    if (strophe.length === 0) copie.pop()
    // Entre deux lignes, le texte suivi compte une espace.
    else if (ligne.length === 0 && reste > 0) reste -= 1
  }
  const derniere = copie.at(-1)?.at(-1)?.at(-1)
  if (derniere) derniere.texte = derniere.texte.trimEnd()
  return copie
}
