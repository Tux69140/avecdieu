import type { CouleurLiturgique, JourLiturgique } from '../office/modele'

// Ce que le bandeau de l'accueil dit du jour, sous la date : le temps (la
// semaine), le titre (la fête ou le saint, sinon le jour lui-même) et une seule
// pastille, la couleur du jour (choix du porteur du projet, 2026-10-06 : un
// écran simple à lire, ni rang ni couleur des mémoires possibles).
export interface Bandeau {
  temps?: string
  titre?: string
  couleur?: CouleurLiturgique
}

// La seconde ligne de l'AELF donne tantôt le saint, tantôt le seul rang du
// jour (« Solennité », « Fête », « de la férie »), déjà dit par le titre.
const RANG_SEUL = /^(solennité|fête|mémoire|de la férie)/i
const JOUR_DE_SEMAINE = /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche), /i

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
    jour.celebration && !RANG_SEUL.test(jour.celebration) ? nettoyer(jour.celebration) : undefined
  if (saint) return { temps: intitule, titre: saint, couleur }
  return { titre: intitule, couleur }
}
