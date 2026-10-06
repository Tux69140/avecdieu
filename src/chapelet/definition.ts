import type { PriereId } from '../recueil/prieres'

// Ce qui porte la prière sur le chapelet : la croix, un gros ou un petit grain,
// un nœud du fil entre deux grains (le Gloire au Père se dit sur le fil), ou
// la médaille qui ferme la boucle.
export type TypeGrain = 'croix' | 'gros' | 'petit' | 'noeud' | 'medaille'

// Ce qui se dit ou se médite à une étape : une prière du recueil, ou l'annonce
// du mystère de la dizaine (titre, fruit, passage).
export type Moment = PriereId | 'annonce'

// Étapes que les réglages peuvent retirer du déroulé.
export type OptionDeroule = 'annonce' | 'oMonJesus' | 'salveRegina'

export interface Etape {
  priere: Moment
  grain: TypeGrain
  // Chaque répétition occupe son propre grain.
  repetitions?: number
  // La prière se dit sur le même grain que l'étape précédente.
  memeGrain?: boolean
  // L'étape n'est dite que si cette option est active.
  option?: OptionDeroule
}

// Définition déclarative d'un chapelet : ajouter un autre chapelet, c'est
// ajouter une définition, sans toucher au code d'affichage.
export interface DefinitionChapelet {
  ouverture: Etape[]
  dizaine: Etape[]
  nombreDeDizaines: number
  cloture: Etape[]
}

export const CHAPELET_MARIAL: DefinitionChapelet = {
  ouverture: [
    { priere: 'signe-de-croix', grain: 'croix' },
    { priere: 'credo', grain: 'croix', memeGrain: true },
    { priere: 'notre-pere', grain: 'gros' },
    { priere: 'je-vous-salue-marie', grain: 'petit', repetitions: 3 },
    { priere: 'gloire-au-pere', grain: 'noeud' },
  ],
  // L'annonce se fait sur le gros grain, juste avant le Notre Père ; le « Ô mon
  // Jésus » suit le Gloire au Père, sur le même nœud du fil.
  dizaine: [
    { priere: 'annonce', grain: 'gros', option: 'annonce' },
    { priere: 'notre-pere', grain: 'gros', memeGrain: true },
    { priere: 'je-vous-salue-marie', grain: 'petit', repetitions: 10 },
    { priere: 'gloire-au-pere', grain: 'noeud' },
    { priere: 'o-mon-jesus', grain: 'noeud', memeGrain: true, option: 'oMonJesus' },
  ],
  nombreDeDizaines: 5,
  // Le Salve Regina se dit en revenant à la médaille, la boucle achevée.
  cloture: [{ priere: 'salve-regina', grain: 'medaille', option: 'salveRegina' }],
}
