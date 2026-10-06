import type { Bloc, Ligne, Partie, Segment, Signe, Strophe } from './modele'

// R11 : le répons bref, dont l'AELF abrège les reprises. Un « R/ » en fin de
// ligne reprend tout le répons ; un « * » en fin de ligne, sa seconde partie,
// celle qui suit l'astérisque. L'app les écrit en entier, et le signe abrégé
// disparaît.

const estSigneDeReprise = (signe?: Signe) => signe === 'R' || signe === 'mediante'
// Entre deux signes accolés, l'AELF laisse un blanc.
const finDeReprise = (segment: Segment) =>
  estSigneDeReprise(segment.signe) || (!segment.signe && segment.texte.trim() === '')

// Les signes de reprise en fin de ligne ; l'AELF en met parfois deux
// (« * R/ », « R/ * ») : le R/ l'emporte, tout le répons est repris.
function repriseDe(ligne: Ligne): 'entiere' | 'seconde' | undefined {
  const signes: Signe[] = []
  for (let i = ligne.length - 1; i >= 0 && finDeReprise(ligne[i]); i--)
    if (ligne[i].signe) signes.push(ligne[i].signe!)
  if (signes.length === 0) return undefined
  return signes.includes('R') ? 'entiere' : 'seconde'
}

const estVerset = (ligne: Ligne) =>
  ligne[0]?.signe === 'V' || /^Gloire au Père/.test(ligne[0]?.texte ?? '')

// Le répons tel que l'AELF l'écrit en tête : de son R/ jusqu'au premier verset.
function reponsDe(strophes: Strophe[]): Ligne[] | undefined {
  const lignes = strophes.flat()
  if (lignes[0]?.[0]?.signe !== 'R') return undefined
  const fin = lignes.findIndex((ligne, i) => i > 0 && estVerset(ligne))
  return fin < 0 ? undefined : lignes.slice(0, fin)
}

// Ce qui suit l'astérisque, précédé du R/ ; sans astérisque, tout le répons.
function secondePartie(repons: Ligne[]): Ligne[] {
  const i = repons.findIndex((ligne) => ligne.some((s) => s.signe === 'mediante'))
  if (i < 0) return repons
  const ligne = repons[i]
  const apres = ligne
    .slice(ligne.findIndex((s) => s.signe === 'mediante') + 1)
    .map((s) => ({ ...s }))
  // Après le R/, la marque porte son propre espace à l'affichage.
  if (apres[0]) apres[0].texte = apres[0].texte.trimStart()
  const marque: Segment = { texte: 'R/', signe: 'R' }
  const lignes: Ligne[] = [[marque, ...apres], ...repons.slice(i + 1)]
  return lignes.filter((l) => l.length > 1 || l[0]?.signe !== 'R')
}

// La ligne sans ses signes de reprise, ni le blanc qui les précédait.
function sansSigne(ligne: Ligne): Ligne {
  const reste = ligne.map((s) => ({ ...s }))
  while (reste.length > 0 && finDeReprise(reste[reste.length - 1])) reste.pop()
  const fin = reste[reste.length - 1]
  if (fin) fin.texte = fin.texte.trimEnd()
  return reste.filter((s) => s.texte !== '')
}

export function reprendreRepons(partie: Partie): Partie {
  const strophes = partie.blocs.flatMap((b) => b.strophes)
  const repons = reponsDe(strophes)
  if (!repons) return partie
  const lignes = strophes.flat()
  if (!lignes.some((l) => repriseDe(l))) return partie

  const blocs: Bloc[] = []
  let texte: Strophe[] = []
  let strophe: Ligne[] = []
  const fermerStrophe = () => {
    if (strophe.length > 0) texte.push(strophe)
    strophe = []
  }
  const fermerTexte = () => {
    fermerStrophe()
    if (texte.length > 0) blocs.push({ strophes: texte })
    texte = []
  }
  for (const s of strophes) {
    for (const ligne of s) {
      const sorte = repriseDe(ligne)
      const reprise =
        sorte === 'entiere' ? repons : sorte === 'seconde' ? secondePartie(repons) : undefined
      if (!reprise) {
        strophe.push(ligne)
        continue
      }
      const reste = sansSigne(ligne)
      if (reste.length > 0) strophe.push(reste)
      fermerTexte()
      blocs.push({ strophes: [reprise], ajoute: true })
    }
    fermerStrophe()
  }
  fermerTexte()
  return { ...partie, blocs }
}
