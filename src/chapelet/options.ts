import type { Frequence, Reglages } from '../reglages/reglages'
import type { Options } from './deroule'

// Ce que les réglages communs changent au déroulé du chapelet et du Rosaire.

// « En octobre » : du 1er au 31 octobre, selon la date du téléphone le jour du
// chapelet.
const ditCeJour = (frequence: Frequence, jour: Date) =>
  frequence === 'toujours' || (frequence === 'octobre' && jour.getMonth() === 9)

// En mode compact, l'annonce n'a pas d'écran à part : le Notre Père la porte.
export function optionsDuDeroule(reglages: Reglages, jour: Date): Options {
  return {
    annonce: reglages.annonce && reglages.affichage === 'complet',
    oMonJesus: reglages.oMonJesus,
    intentions: reglages.intentions,
    saintPere: reglages.saintPere,
    salveRegina: reglages.salveRegina,
    litanies: ditCeJour(reglages.litanies, jour),
    oraisonRosaire: reglages.oraisonRosaire,
    sousLAbri: reglages.sousLAbri,
    saintJoseph: ditCeJour(reglages.saintJoseph, jour),
    essentiel: reglages.essentiel,
  }
}
