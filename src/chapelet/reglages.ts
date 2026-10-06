import type { Options } from './deroule'
import { ecrire, lire, lireObjet } from './stockage'

export type Affichage = 'complet' | 'compact'

// Un seul enregistrement pour tous les réglages, ceux du chapelet et ceux des
// offices.
export interface Reglages {
  annonce: boolean
  oMonJesus: boolean
  salveRegina: boolean
  // À plusieurs : V/ et R/ marquent la part de celui qui mène et la réponse.
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
}

// Ceux du PRD.
export const REGLAGES_PAR_DEFAUT: Reglages = {
  annonce: true,
  oMonJesus: true,
  salveRegina: true,
  plusieurs: false,
  affichage: 'complet',
  vibrations: true,
  accents: true,
  prieresEntieres: false,
  signalerAjouts: true,
}

const BASCULES = [
  'annonce',
  'oMonJesus',
  'salveRegina',
  'plusieurs',
  'vibrations',
  'accents',
  'prieresEntieres',
  'signalerAjouts',
] as const

const CLE = 'avec-dieu.reglages'
// Avant les réglages (phase 3), seul l'affichage était retenu, sous sa propre clé.
const CLE_AFFICHAGE_PHASE_3 = 'avec-dieu.affichage'

const estAffichage = (valeur: unknown): valeur is Affichage =>
  valeur === 'complet' || valeur === 'compact'

// Chaque valeur enregistrée n'est reprise que si elle a le bon type.
export function lireReglages(): Reglages {
  const enregistres = lireObjet(CLE)
  const reglages = { ...REGLAGES_PAR_DEFAUT }
  for (const cle of BASCULES) {
    const valeur = enregistres[cle]
    if (typeof valeur === 'boolean') reglages[cle] = valeur
  }
  const affichage = enregistres.affichage ?? lire(CLE_AFFICHAGE_PHASE_3)
  if (estAffichage(affichage)) reglages.affichage = affichage
  return reglages
}

export function modifierReglages(changement: Partial<Reglages>): Reglages {
  const reglages = { ...lireReglages(), ...changement }
  ecrire(CLE, JSON.stringify(reglages))
  return reglages
}

// En mode compact, l'annonce n'a pas d'écran à part : le Notre Père la porte.
export function optionsDuDeroule(reglages: Reglages): Options {
  return {
    annonce: reglages.annonce && reglages.affichage === 'complet',
    oMonJesus: reglages.oMonJesus,
    salveRegina: reglages.salveRegina,
  }
}
