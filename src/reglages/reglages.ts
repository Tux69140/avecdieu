import { estZone, type Zone } from '../aelf/zones'
import { ecrireEtSignaler, lire, lireObjet, RACINE } from './stockage'

export type Affichage = 'complet' | 'compact'

// La taille du texte à prier, en pixels : 5 crans de 2 en 2 (phase 10).
export const TAILLES = [16, 18, 20, 22, 24] as const
export type TailleTexte = (typeof TAILLES)[number]

// « automatique » : nuit si Android est en mode sombre ou après le coucher du soleil.
export type Theme = 'automatique' | 'jour' | 'nuit'
const THEMES: readonly Theme[] = ['automatique', 'jour', 'nuit']

// Les Litanies et la prière à saint Joseph : dites en octobre, mois du
// Rosaire, ou toujours, ou jamais (décision du porteur du projet, 2026-10-08).
export type Frequence = 'octobre' | 'toujours' | 'jamais'
const FREQUENCES: readonly Frequence[] = ['octobre', 'toujours', 'jamais']

// Un seul enregistrement pour tous les réglages, ceux du chapelet et ceux des
// offices.
export interface Reglages {
  annonce: boolean
  oMonJesus: boolean
  // Chapelet : la foi, l'espérance, la charité, avant les trois premiers Je
  // vous salue Marie.
  intentions: boolean
  // Chapelet : la prière aux intentions du Saint-Père, après la dernière
  // dizaine (phase 18).
  saintPere: boolean
  // Chapelet : les textes de la clôture, dans leur ordre.
  salveRegina: boolean
  litanies: Frequence
  oraisonRosaire: boolean
  sousLAbri: boolean
  saintJoseph: Frequence
  // À plusieurs : ℣ et ℟ marquent la part de celui qui mène et la réponse,
  // le demi-gras ce que disent tous.
  plusieurs: boolean
  affichage: Affichage
  vibrations: boolean
  // Offices : syllabes accentuées de la psalmodie soulignées.
  accents: boolean
  // Offices : Notre Père, Gloire au Père et Je confesse à Dieu écrits en entier,
  // au lieu d'être repliés sur leur première ligne.
  prieresEntieres: boolean
  // Offices : un filet rouge le long de ce que l'app ajoute selon les rubriques.
  signalerAjouts: boolean
  // Offices : les consignes en rouge pour qui débute (R13).
  consignes: boolean
  // Offices : la zone liturgique, dont l'AELF donne le calendrier propre.
  zone: Zone
  // Offices et chapelet : la taille du texte à prier.
  tailleTexte: TailleTexte
  theme: Theme
  // « L’essentiel seulement » (phase 18) : le signe de croix et les
  // dizaines ; il l'emporte sur les réglages fins, gardés intacts.
  essentiel: boolean
}

// Ceux du PRD.
export const REGLAGES_PAR_DEFAUT: Reglages = {
  annonce: true,
  oMonJesus: true,
  intentions: true,
  saintPere: true,
  salveRegina: true,
  litanies: 'octobre',
  oraisonRosaire: true,
  sousLAbri: false,
  saintJoseph: 'octobre',
  plusieurs: false,
  affichage: 'complet',
  vibrations: true,
  accents: true,
  prieresEntieres: false,
  signalerAjouts: true,
  consignes: true,
  zone: 'france',
  tailleTexte: 18,
  theme: 'automatique',
  essentiel: false,
}

const BASCULES = [
  'annonce',
  'oMonJesus',
  'intentions',
  'saintPere',
  'salveRegina',
  'oraisonRosaire',
  'sousLAbri',
  'plusieurs',
  'vibrations',
  'accents',
  'prieresEntieres',
  'signalerAjouts',
  'consignes',
  'essentiel',
] as const

const CLE = `${RACINE}reglages`
// Avant les réglages (phase 3), seul l'affichage était retenu, sous sa propre clé.
const CLE_AFFICHAGE_PHASE_3 = `${RACINE}affichage`

const estAffichage = (valeur: unknown): valeur is Affichage =>
  valeur === 'complet' || valeur === 'compact'
const estTaille = (valeur: unknown): valeur is TailleTexte =>
  TAILLES.some((taille) => taille === valeur)
const estFrequence = (valeur: unknown): valeur is Frequence =>
  FREQUENCES.some((frequence) => frequence === valeur)
const estTheme = (valeur: unknown): valeur is Theme => THEMES.some((theme) => theme === valeur)

// Chaque valeur enregistrée n'est reprise que si elle a le bon type ; une
// valeur absente (réglages enregistrés avant qu'elle existe) garde celle de
// départ.
export function lireReglages(): Reglages {
  const enregistres = lireObjet(CLE)
  const reglages = { ...REGLAGES_PAR_DEFAUT }
  for (const cle of BASCULES) {
    const valeur = enregistres[cle]
    if (typeof valeur === 'boolean') reglages[cle] = valeur
  }
  const affichage = enregistres.affichage ?? lire(CLE_AFFICHAGE_PHASE_3)
  if (estAffichage(affichage)) reglages.affichage = affichage
  if (estZone(enregistres.zone)) reglages.zone = enregistres.zone
  if (estTaille(enregistres.tailleTexte)) reglages.tailleTexte = enregistres.tailleTexte
  if (estTheme(enregistres.theme)) reglages.theme = enregistres.theme
  if (estFrequence(enregistres.litanies)) reglages.litanies = enregistres.litanies
  if (estFrequence(enregistres.saintJoseph)) reglages.saintJoseph = enregistres.saintJoseph
  return reglages
}

// Signalé à la page : le thème et la taille du texte s'appliquent aussitôt.
export const REGLAGES_CHANGES = 'avec-dieu:reglages-changes'

export function modifierReglages(changement: Partial<Reglages>): Reglages {
  const reglages = { ...lireReglages(), ...changement }
  ecrireEtSignaler(CLE, reglages, REGLAGES_CHANGES)
  return reglages
}
