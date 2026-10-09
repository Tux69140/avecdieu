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

// La route d'un office un jour donné (AAAA-MM-JJ) : /office/vepres/2026-10-06.
export const cheminOffice = (nom: NomOffice, date: string) => `/office/${nom}/${date}`

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
  | 'examen'
  | 'conclusion'
  | 'autre'

// Un morceau du texte d'une partie : tel que l'AELF le donne, ou ajouté par
// l'app selon les rubriques (phase 6).
export interface Bloc {
  strophes: Strophe[]
  // Ajouté selon les rubriques : un filet rouge le signale, si le réglage le veut.
  ajoute?: boolean
  // Prière courante (Notre Père, Gloire au Père…), repliée sur sa première
  // ligne sauf réglage contraire : son nom.
  priere?: string
  // Rubrique en rouge au-dessus du bloc : « Tous », à plusieurs, ou une
  // consigne pour qui débute (R13).
  rubrique?: string
  // Un texte redit (antienne, répons) : en italique, il se distingue de sa
  // première fois (choix du porteur du projet, 2026-10-08).
  reprise?: boolean
  // À plusieurs, la part de tous : en demi-gras (R10).
  tous?: boolean
}

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
  blocs: Bloc[]
  // Partie entière ajoutée par l'app selon les rubriques.
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
  // Les deux lignes que l'AELF affiche en tête du jour : le jour lui-même
  // (« mardi, 27ème Semaine du Temps Ordinaire », « Tous les Saints ») puis le
  // saint ou le rang (« S. Bruno, prêtre », « Solennité »).
  intitule?: string
  celebration?: string
  // La première est celle du jour ; les suivantes, celles des mémoires possibles.
  couleurs: CouleurLiturgique[]
}
