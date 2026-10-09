import type { SerieId } from '../recueil/mysteres'
import { INTENTIONS, type PriereId } from '../recueil/prieres'
import { AUX_INTENTIONS_DU_SAINT_PERE } from './intentionsDuPape'

// Ce qui porte la prière sur le chapelet : la croix, un gros ou un petit grain,
// un nœud du fil entre deux grains (le Gloire au Père se dit sur le fil), ou
// la médaille qui ferme la boucle.
export type TypeGrain = 'croix' | 'gros' | 'petit' | 'noeud' | 'medaille'

// Ce qui se dit ou se médite à une étape : une prière du recueil, les Litanies
// de la Sainte Vierge, ou l'annonce du mystère de la dizaine (titre, fruit,
// passage).
export type Moment = PriereId | 'litanies' | 'annonce'

// Ce que les réglages peuvent retirer du déroulé.
export type OptionDeroule =
  | 'annonce'
  | 'oMonJesus'
  | 'intentions'
  | 'saintPere'
  | 'salveRegina'
  | 'litanies'
  | 'oraisonRosaire'
  | 'sousLAbri'
  | 'saintJoseph'

export interface Etape {
  priere: Moment
  grain: TypeGrain
  // Chaque répétition occupe son propre grain.
  repetitions?: number
  // La prière se dit sur le même grain que l'étape précédente.
  memeGrain?: boolean
  // L'étape n'est dite que si cette option est active.
  option?: OptionDeroule
  // Une intention annoncée avant chaque répétition, dans l'ordre, si son
  // option est active.
  intentions?: { textes: readonly string[]; option: OptionDeroule }
  // Le verset marial (« Priez pour nous, sainte Mère de Dieu ») ne se dit
  // qu'une fois : à la dernière étape dite qui peut le porter, avant ou après
  // sa prière.
  verset?: 'avant' | 'apres'
  // Une prière d'usage, que « L’essentiel seulement » retire : l'écran la
  // dit « Facultatif » (phase 18).
  facultative?: true
  // Sous l'intention, l'intention de prière du pape pour le mois (phase 18).
  intentionDuMois?: true
}

// Définition déclarative d'un chapelet : ajouter un autre chapelet, c'est
// ajouter une définition, sans toucher au code d'affichage.
export interface DefinitionChapelet {
  ouverture: Etape[]
  dizaine: Etape[]
  nombreDeDizaines: number
  // Les séries dites l'une après l'autre sur la même boucle (le Rosaire) ;
  // absentes, la boucle se dit une fois, sur la série choisie au seuil.
  series?: readonly SerieId[]
  cloture: Etape[]
}

export const CHAPELET_MARIAL: DefinitionChapelet = {
  // Seul le signe de croix est de l'essentiel (phase 18, d'après Rosarium
  // Virginis Mariae) ; le reste de l'ouverture est d'usage.
  ouverture: [
    { priere: 'signe-de-croix', grain: 'croix' },
    { priere: 'credo', grain: 'croix', memeGrain: true, facultative: true },
    { priere: 'notre-pere', grain: 'gros', facultative: true },
    {
      priere: 'je-vous-salue-marie',
      grain: 'petit',
      repetitions: 3,
      intentions: { textes: INTENTIONS, option: 'intentions' },
      facultative: true,
    },
    { priere: 'gloire-au-pere', grain: 'noeud', facultative: true },
  ],
  // L'annonce se fait sur le gros grain, juste avant le Notre Père ; le « Ô mon
  // Jésus » suit le Gloire au Père, sur le même nœud du fil.
  dizaine: [
    { priere: 'annonce', grain: 'gros', option: 'annonce' },
    { priere: 'notre-pere', grain: 'gros', memeGrain: true },
    { priere: 'je-vous-salue-marie', grain: 'petit', repetitions: 10 },
    { priere: 'gloire-au-pere', grain: 'noeud' },
    {
      priere: 'o-mon-jesus',
      grain: 'noeud',
      memeGrain: true,
      option: 'oMonJesus',
      facultative: true,
    },
  ],
  nombreDeDizaines: 5,
  // La fin se dit en revenant à la médaille, la boucle achevée, toute d'usage.
  // D'abord la prière aux intentions du Saint-Père, chacune sur son écran,
  // la ligne rouge et l'intention du mois sur le Notre Père (phase 18,
  // 2026-10-09) ; puis la clôture dans l'ordre validé par le porteur du
  // projet (2026-10-08). Le verset marial finit le Salve Regina, sauf quand
  // l'oraison du Rosaire est dite : il passe alors juste avant elle.
  cloture: (
    [
      {
        priere: 'notre-pere',
        grain: 'medaille',
        option: 'saintPere',
        intentions: { textes: [AUX_INTENTIONS_DU_SAINT_PERE], option: 'saintPere' },
        intentionDuMois: true,
      },
      { priere: 'je-vous-salue-marie', grain: 'medaille', memeGrain: true, option: 'saintPere' },
      { priere: 'gloire-au-pere', grain: 'medaille', memeGrain: true, option: 'saintPere' },
      {
        priere: 'salve-regina',
        grain: 'medaille',
        memeGrain: true,
        option: 'salveRegina',
        verset: 'apres',
      },
      { priere: 'litanies', grain: 'medaille', memeGrain: true, option: 'litanies' },
      {
        priere: 'oraison-rosaire',
        grain: 'medaille',
        memeGrain: true,
        option: 'oraisonRosaire',
        verset: 'avant',
      },
      { priere: 'sous-l-abri', grain: 'medaille', memeGrain: true, option: 'sousLAbri' },
      { priere: 'saint-joseph', grain: 'medaille', memeGrain: true, option: 'saintJoseph' },
    ] satisfies Etape[]
  ).map((etape): Etape => ({ ...etape, facultative: true })),
}

// Le Rosaire (phase 17) : l'ouverture une fois, la boucle des cinq dizaines
// parcourue quatre fois, des mystères joyeux aux glorieux, la clôture une
// fois. Le reste est celui du chapelet.
export const ROSAIRE: DefinitionChapelet = {
  ...CHAPELET_MARIAL,
  series: ['joyeux', 'lumineux', 'douloureux', 'glorieux'],
}
