import type { CouleurLiturgique, JourLiturgique } from '../office/modele'

// Ce que le bandeau de l'accueil dit du jour, sous la date : le temps (le rang
// du jour, toujours en petit), le titre (la fête ou le saint seul, en gros) et
// une seule pastille, la couleur du jour (choix du porteur du projet,
// 2026-10-06 et 2026-10-08 : un écran simple à lire, ni rang de la célébration,
// ni qualités du saint, ni couleur des mémoires possibles).
export interface Bandeau {
  temps?: string
  titre?: string
  couleur?: CouleurLiturgique
}

// La seconde ligne de l'AELF donne tantôt le saint, tantôt le seul rang du
// jour (« Solennité », « Fête », « de la férie »), déjà dit par le titre.
const RANG_SEUL = /^(solennité|fête|mémoire|de la férie)/i
const JOUR_DE_SEMAINE = /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche), /i
// Le jour n'est que sa place dans le temps (« 27e semaine du temps ordinaire »,
// « 28e dimanche… », « Lundi dans l'octave de Pâques ») : il va dans la petite
// ligne. Sinon, il porte le nom d'une fête (« Tous les Saints ») : en gros.
const RANG_DU_JOUR = /^\d+(e|er|re) (semaine|dimanche|jour)\b|dans l’octave|^\p{L}+ après l’/iu
// Ce qui suit le nom du saint : ses qualités (« , évêque », « , vierge et
// docteur… »), ses compagnons, le rang de la célébration (« . Mémoire… »).
const QUALITES =
  /,\s*(et (ses|leurs) compagnons|abbé|abbesse|apôtres?|archanges?|confesseurs?|diacres?|docteurs?|ermites?|évêques?|fondat(eur|rice)s?|martyrs?|missionnaires?|moines?|papes?|prêtres?|religieu(x|ses?)|vierges?)\b.*$|\.\s*(mémoire|fête|solennité)\b.*$/i

// Le saint seul, comme l'écrit l'AELF (« S. », « Ste » gardés : la place
// compte), les crochets changés en parenthèses.
const nommerSaint = (celebration: string) =>
  celebration
    .replace(QUALITES, '')
    .replace(/\[([^\]]*)\]/g, '($1)')
    .trim()

// La typographie de l'AELF corrigée, sans toucher à ses mots : « 27e », « 1re »,
// minuscules à « semaine » ou « temps ordinaire », apostrophe typographique ;
// la semaine du psautier et les notes pour la messe retirées.
function nettoyer(texte: string): string {
  return texte
    .replace(/\s*\(semaine [IV]+ du psautier\)/i, '')
    .replace(/\s*\[psautier semaine propre\]/i, '')
    .replace(/, on peut choisir .*$/, '')
    .replace(/(\d+)ème\b/g, '$1e')
    .replace(/(\d+)ère\b/g, '$1re')
    .replace(/Temps (Ordinaire|Pascal)/g, (_, temps: string) => `temps ${temps.toLowerCase()}`)
    .replace(/(?<!^)\b(Semaine|Dimanche|Octave)\b/g, (mot) => mot.toLowerCase())
    .replace(/'/g, '’')
}

export function presenterJour(jour: JourLiturgique): Bandeau {
  const couleur = jour.couleurs[0]
  const intitule = jour.intitule && nettoyer(jour.intitule.replace(JOUR_DE_SEMAINE, ''))
  const saint =
    jour.celebration && !RANG_SEUL.test(jour.celebration)
      ? nettoyer(nommerSaint(jour.celebration))
      : undefined
  if (saint) return { temps: intitule, titre: saint, couleur }
  if (intitule && RANG_DU_JOUR.test(intitule)) return { temps: intitule, titre: undefined, couleur }
  return { temps: undefined, titre: intitule, couleur }
}
