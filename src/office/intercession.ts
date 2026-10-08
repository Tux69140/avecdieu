import type { Bloc, Partie, Strophe } from './modele'

// R12 : l'intercession, dont l'AELF ne donne le répons qu'une fois, après
// l'invitation à prier. L'app le redit après chaque intention : à plusieurs,
// personne n'a à le retenir. Chaque strophe qui suit le répons est une
// intention ; sans répons, l'intercession reste telle quelle.

const estRepons = (strophe: Strophe) => strophe[0]?.[0]?.signe === 'R'

// « consigne » (R13) : la phrase rouge qui précède le premier répons.
export function redireRepons(partie: Partie, consigne?: string): Partie {
  const strophes = partie.blocs.flatMap((b) => b.strophes)
  const i = strophes.findIndex(estRepons)
  const intentions = strophes.slice(i + 1)
  if (i < 0 || intentions.length === 0) return partie
  const repons = strophes[i]
  const blocs: Bloc[] = [
    ...(i > 0 ? [{ strophes: strophes.slice(0, i) }] : []),
    { strophes: [repons], ...(consigne && { rubrique: consigne }) },
    ...intentions.flatMap((intention): Bloc[] => [
      { strophes: [intention] },
      { strophes: [repons], ajoute: true, reprise: true },
    ]),
  ]
  return { ...partie, blocs }
}
