import type { PriereId } from '../recueil/prieres'

// Ce qui porte la prière sur le chapelet : la croix, un gros ou un petit grain,
// ou un nœud du fil entre deux grains (le Gloire au Père se dit sur le fil).
export type TypeGrain = 'croix' | 'gros' | 'petit' | 'noeud'

// Ce qui se dit ou se médite à une étape : une prière du recueil, ou l'annonce
// du mystère de la dizaine (titre, fruit, passage).
export type Moment = PriereId | 'annonce'

export interface Etape {
  priere: Moment
  grain: TypeGrain
  // Chaque répétition occupe son propre grain.
  repetitions?: number
  // La prière se dit sur le même grain que l'étape précédente.
  memeGrain?: boolean
}

// Définition déclarative d'un chapelet : ajouter un autre chapelet, c'est
// ajouter une définition, sans toucher au code d'affichage.
export interface DefinitionChapelet {
  ouverture: Etape[]
  dizaine: Etape[]
  nombreDeDizaines: number
}

export const CHAPELET_MARIAL: DefinitionChapelet = {
  ouverture: [
    { priere: 'signe-de-croix', grain: 'croix' },
    { priere: 'credo', grain: 'croix', memeGrain: true },
    { priere: 'notre-pere', grain: 'gros' },
    { priere: 'je-vous-salue-marie', grain: 'petit', repetitions: 3 },
    { priere: 'gloire-au-pere', grain: 'noeud' },
  ],
  // L'annonce se fait sur le gros grain, juste avant le Notre Père.
  dizaine: [
    { priere: 'annonce', grain: 'gros' },
    { priere: 'notre-pere', grain: 'gros', memeGrain: true },
    { priere: 'je-vous-salue-marie', grain: 'petit', repetitions: 10 },
    { priere: 'gloire-au-pere', grain: 'noeud' },
  ],
  nombreDeDizaines: 5,
}
