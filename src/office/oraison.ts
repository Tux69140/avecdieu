import { CONCLUSIONS, type FormeConclusion } from '../recueil/office'
import type { Bloc, Partie, Strophe } from './modele'
import { retrancherFin, texteDe } from './textes'

// R7 : la conclusion de l'oraison, que l'AELF donne entière, abrégée ou pas du
// tout. Longue à l'office des lectures, aux laudes et aux vêpres ; brève
// ailleurs.

// « Lui qui règne. », « Toi qui règnes. » : la forme est dite, le texte abrégé.
const ABREGEE = /\b(Lui qui règne|Toi qui règnes)\s*\.(\s*Amen\s*[.!]?)?$/
// Déjà conclue : l'AELF la garde telle quelle.
const CONCLUE = /(siècles des siècles|notre Seigneur|Dieu,? à jamais)\s*[.!]?(\s*Amen\s*[.!]?)?$/
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

// Une strophe qui s'ouvre sur « V/ Bénissons le Seigneur » : l'envoi que
// l'AELF joint parfois à l'oraison (octave de Pâques, Pentecôte).
const estEnvoi = (strophe: Strophe) =>
  strophe[0]?.[0]?.signe === 'V' && /^Bénissons/.test(strophe[0][1]?.texte ?? '')

export interface OraisonConclue {
  oraison: Partie
  // L'envoi donné par l'AELF, qui tient lieu de fin de l'office (R8).
  envoi?: Strophe[]
}

export function conclureOraison(partie: Partie, longue: boolean): OraisonConclue {
  const strophes = partie.blocs.flatMap((b) => b.strophes)
  const debutEnvoi = strophes.findIndex(estEnvoi)
  const priere = debutEnvoi > 0 ? strophes.slice(0, debutEnvoi) : strophes
  const envoi = debutEnvoi > 0 ? strophes.slice(debutEnvoi) : undefined

  const texte = texteDe(priere).trim()
  const conclusions = CONCLUSIONS[longue ? 'longue' : 'breve']
  let texteAelf = priere
  let ajout: Bloc | undefined
  const abregee = ABREGEE.exec(texte)
  if (abregee) {
    texteAelf = retrancherFin(priere, texte.length - abregee.index)
    const forme = abregee[1].startsWith('Lui') ? 'fils-a-la-fin' : 'au-fils'
    ajout = bloc([conclusions[forme], 'Amen.'])
  } else if (CONCLUE.test(texte)) {
    if (!AMEN.test(texte)) ajout = bloc(['Amen.'])
  } else {
    ajout = bloc([conclusions[formeDe(texte)], 'Amen.'])
  }

  const blocs: Bloc[] = [{ strophes: texteAelf }, ...(ajout ? [ajout] : [])]
  return { oraison: { ...partie, blocs }, ...(envoi && { envoi }) }
}
