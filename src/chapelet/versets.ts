import type { Priere } from '../recueil/prieres'

// V/ : celui qui mène ou le verset ; R/ : la réponse des autres.
export type Marque = 'V' | 'R'

export interface Vers {
  texte: string
  marque?: Marque
}

const PREFIXE = /^([VR])\/ /

// À plusieurs, une prière sans réponse se dit ensemble : elle passe en
// demi-gras, comme la part de tous dans l'office (2026-10-08). Pour le Salve
// Regina, jusqu'au verset, qui garde ses ℣. et ℟.
export function ditEnsemble({ reponse }: Priere, plusieurs: boolean): boolean {
  return plusieurs && reponse === undefined
}

// Les strophes d'une prière, prêtes à afficher. Dans le recueil, une ligne vide
// sépare deux strophes et « V/ » ou « R/ » ouvre un verset. À plusieurs, la
// réponse ouvre sa propre strophe, pour que chacun voie où commence sa part.
// La part de celui qui mène s'ouvre sur le premier vers sans marque : après
// le verset, pour l'oraison du Rosaire.
export function strophes({ lignes, reponse }: Priere, plusieurs: boolean): Vers[][] {
  const groupes: Vers[][] = [[]]
  let premier = true
  lignes.forEach((ligne) => {
    if (ligne === '') return groupes.push([])
    const prefixe = PREFIXE.exec(ligne)
    if (prefixe)
      return groupes.at(-1)!.push({ texte: ligne.slice(3), marque: prefixe[1] as Marque })
    if (plusieurs && reponse !== undefined) {
      if (premier) {
        premier = false
        return groupes.at(-1)!.push({ texte: ligne, marque: 'V' })
      }
      if (ligne === reponse) {
        if (groupes.at(-1)!.length > 0) groupes.push([])
        return groupes.at(-1)!.push({ texte: ligne, marque: 'R' })
      }
    }
    groupes.at(-1)!.push({ texte: ligne })
  })
  return groupes
}
