import type { PriereId } from '../recueil/prieres'

// Ce qui porte la prière sur le chapelet : la croix, un gros ou un petit grain,
// ou un nœud du fil entre deux grains (le Gloire au Père se dit sur le fil).
export type TypeGrain = 'croix' | 'gros' | 'petit' | 'noeud'

export interface Etape {
  priere: PriereId
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
  dizaine: [
    { priere: 'notre-pere', grain: 'gros' },
    { priere: 'je-vous-salue-marie', grain: 'petit', repetitions: 10 },
    { priere: 'gloire-au-pere', grain: 'noeud' },
  ],
  nombreDeDizaines: 5,
}
