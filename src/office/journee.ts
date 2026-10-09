import { ecrire, lireObjet, RACINE } from '../reglages/stockage'
import type { NomOffice } from './modele'

// R1 : l'invitatoire ouvre la journée de prière, en tête du premier des deux
// offices ouverts ce jour-là (laudes ou office des lectures). Le téléphone
// retient, pour chaque date, lequel des deux le porte.

const CLE = `${RACINE}invitatoire`
// Assez pour une semaine priée d'avance ou en retard ; le reste s'oublie.
const DATES_RETENUES = 14

const ouvreLaJournee = (nom: NomOffice) => nom === 'laudes' || nom === 'lectures'

function retenir(date: string, nom: NomOffice) {
  const dates = lireObjet(CLE)
  // La date ouverte reste retenue, même plus ancienne que les autres.
  const autres = Object.keys(dates)
    .filter((d) => d !== date)
    .sort()
    .slice(-(DATES_RETENUES - 1))
  ecrire(
    CLE,
    JSON.stringify(Object.fromEntries([...autres.map((d) => [d, dates[d]]), [date, nom]])),
  )
}

// Ouvrir un office : le premier des deux ouverts dans la journée reçoit
// l'invitatoire. Vrai si cet office le porte.
export function ouvrirOffice(nom: NomOffice, date: string): boolean {
  if (!ouvreLaJournee(nom)) return false
  const porteur = lireObjet(CLE)[date]
  if (porteur === 'laudes' || porteur === 'lectures') return porteur === nom
  retenir(date, nom)
  return true
}

// Le lien « en tête de l'office » : l'invitatoire passe à cet office-ci.
export function deplacerInvitatoire(nom: NomOffice, date: string) {
  if (ouvreLaJournee(nom)) retenir(date, nom)
}

// Le lien « Le dire ici » : offert à l'office qui pourrait ouvrir la journée
// quand l'autre porte l'invitatoire, et seulement s'il y a un invitatoire à
// dire (sans les laudes, l'office des lectures n'en a pas).
export const peutRecevoirInvitatoire = (
  nom: NomOffice,
  { premier, invitatoire }: { premier: boolean; invitatoire: boolean },
) => ouvreLaJournee(nom) && !premier && invitatoire
