// Ce que l'app sait d'un office et d'un jour liturgique. Le format de l'AELF
// s'arrête à la frontière (src/aelf/) : ici, plus aucun HTML, seulement du
// texte découpé en strophes, lignes et segments.

// Mêmes noms que l'API AELF et que les routes /office/<office>/<date>.
export type NomOffice = 'lectures' | 'laudes' | 'tierce' | 'sexte' | 'none' | 'vepres' | 'complies'

export const OFFICES: readonly NomOffice[] = [
  'lectures',
  'laudes',
  'tierce',
  'sexte',
  'none',
  'vepres',
  'complies',
]

// Libellés validés par le porteur du projet (2026-10-06).
export const NOMS_OFFICES: Record<NomOffice, string> = {
  lectures: 'Office des lectures',
  laudes: 'Laudes',
  tierce: 'Tierce',
  sexte: 'Sexte',
  none: 'None',
  vepres: 'Vêpres',
  complies: 'Complies',
}

export const estNomOffice = (valeur: string | undefined): valeur is NomOffice =>
  (OFFICES as readonly string[]).includes(valeur ?? '')

// Les repères que le livre imprime en rouge : numéro de verset, syllabe
// accentuée de la psalmodie, astérisque de médiante, croix de flexe, V/ et R/.
// « emphase » : un passage en italique ou en gras dans la source.
export type Signe = 'verset' | 'accent' | 'mediante' | 'flexe' | 'V' | 'R' | 'emphase'

export interface Segment {
  texte: string
  signe?: Signe
}

export type Ligne = Segment[]
export type Strophe = Ligne[]

export type TypePartie =
  | 'introduction'
  | 'invitatoire'
  | 'hymne'
  | 'antienne'
  | 'psaume'
  | 'cantique'
  | 'verset'
  | 'lecture'
  | 'repons'
  | 'te-deum'
  | 'intercession'
  | 'notre-pere'
  | 'oraison'
  | 'benediction'
  | 'antienne-mariale'
  | 'autre'

export interface Partie {
  type: TypePartie
  // « Antienne 1 », « Psaume 84 », « Lecture brève »…
  libelle: string
  // Après le libellé, sur la même ligne : « Hymne · Soleil levant ».
  precision?: string
  // Sous le libellé : le titre d'une lecture ou d'une antienne mariale.
  titre?: string
  // Auteur et éditeur d'une hymne.
  source?: string
  strophes: Strophe[]
  // Ajoutée par l'app selon les rubriques (phase 6) : jamais en phase 5.
  ajoutee: boolean
}

export interface Office {
  nom: NomOffice
  date: string
  zone: string
  parties: Partie[]
}

export type CouleurLiturgique = 'blanc' | 'vert' | 'violet' | 'rouge' | 'rose' | 'noir'

export interface JourLiturgique {
  date: string
  zone: string
  temps?: string
  semaine?: string
  fete?: string
  rang?: string
  // La première est celle du jour ; les suivantes, celles des mémoires possibles.
  couleurs: CouleurLiturgique[]
}
