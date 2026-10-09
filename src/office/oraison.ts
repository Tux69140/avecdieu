import { CONCLUSIONS, type FormeConclusion } from '../recueil/office'
import type { Bloc, Ligne, Partie, Strophe } from './modele'
import { retrancherFin, texteDe } from './textes'

// R7 : la conclusion de l'oraison, que l'AELF donne entière, abrégée ou pas du
// tout. Longue à l'office des lectures, aux laudes et aux vêpres ; brève
// ailleurs.

// « Lui qui règne. », « Toi qui règnes. », « Par Jésus Christ. » : la forme
// est dite, le texte abrégé.
const ABREGEE =
  /\b(Lui qui (?:vit et )?règne|Toi qui (?:vis et )?règnes|Par Jésus,? (?:le )?Christ)\s*\.(\s*Amen\s*[.!]?)?$/
// Déjà conclue : l'AELF la garde telle quelle. « notre Seigneur » seul ne
// suffit pas (« …la venue de notre Seigneur. ») : il faut le Christ nommé avant.
const CONCLUE =
  /(siècles des siècles|(Jésus|Christ),? (ton Fils,? )?(le Christ,? )?notre Seigneur|Dieu,? à jamais)\s*[.!]?(\s*Amen\s*[.!]?)?$/
const AMEN = /Amen\s*[.!]?$/
// Adressée au Christ dès ses premiers mots.
const AU_FILS = /^(Ô\s+)?(Seigneur\s+)?(Jésus|Christ)\b/
// Le Fils nommé dans les derniers mots.
const FILS_NOMME = /\b(ton Fils|Jésus|Christ)\b/

export function formeDe(texte: string): FormeConclusion {
  if (AU_FILS.test(texte)) return 'au-fils'
  if (FILS_NOMME.test(texte.slice(-80))) return 'fils-a-la-fin'
  return 'pere'
}

const bloc = (lignes: string[]): Bloc => ({
  strophes: [lignes.map((texte) => [{ texte }])],
  ajoute: true,
})

// Une ligne « V/ Bénissons le Seigneur » : l'envoi que l'AELF joint parfois à
// l'oraison (octave de Pâques, Pentecôte), en strophe à part ou non.
const estEnvoi = (ligne: Ligne) =>
  ligne[0]?.signe === 'V' && /^Bénissons/.test(ligne[1]?.texte ?? '')

// L'oraison d'un côté, l'envoi de l'autre.
function separerEnvoi(strophes: Strophe[]): [Strophe[], Strophe[] | undefined] {
  for (const [i, strophe] of strophes.entries()) {
    const j = strophe.findIndex(estEnvoi)
    if (j < 0 || (i === 0 && j === 0)) continue
    const avant = [...strophes.slice(0, i), strophe.slice(0, j)].filter((s) => s.length > 0)
    return [avant, [strophe.slice(j), ...strophes.slice(i + 1)]]
  }
  return [strophes, undefined]
}

interface OraisonConclue {
  oraison: Partie
  // L'envoi donné par l'AELF, qui suit l'oraison et tient lieu de fin de l'office.
  envoi?: Strophe[]
}

export function conclureOraison(partie: Partie, longue: boolean): OraisonConclue {
  const [priere, envoi] = separerEnvoi(partie.blocs.flatMap((b) => b.strophes))

  const texte = texteDe(priere).trim()
  const conclusions = CONCLUSIONS[longue ? 'longue' : 'breve']
  let texteAelf = priere
  let ajout: Bloc | undefined
  const abregee = ABREGEE.exec(texte)
  if (abregee) {
    texteAelf = retrancherFin(priere, texte.length - abregee.index)
    const forme: FormeConclusion = abregee[1].startsWith('Lui')
      ? 'fils-a-la-fin'
      : abregee[1].startsWith('Toi')
        ? 'au-fils'
        : 'pere'
    ajout = bloc([conclusions[forme], 'Amen.'])
  } else if (CONCLUE.test(texte)) {
    if (!AMEN.test(texte)) ajout = bloc(['Amen.'])
  } else {
    ajout = bloc([conclusions[formeDe(texte)], 'Amen.'])
  }

  const blocs: Bloc[] = [{ strophes: texteAelf }, ...(ajout ? [ajout] : [])]
  return { oraison: { ...partie, blocs }, ...(envoi && { envoi }) }
}
