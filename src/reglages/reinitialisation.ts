import { prefixeDeZone } from '../aelf/cache'
import { reprogrammer } from '../rappels/entretien'
import { lireReglages, REGLAGES_PAR_DEFAUT } from './reglages'
import { clesCommencantPar, effacer, RACINE } from './stockage'

// L'app revient comme au premier lancement : tout ce qu'elle a retenu est
// effacé, sauf les textes déjà enregistrés de la zone d'origine, que la
// réserve devrait sinon retélécharger (et qui manqueraient sans réseau).
// Mémoire indisponible : il n'y a rien à effacer.
export function effacerMemoire() {
  const garder = prefixeDeZone(REGLAGES_PAR_DEFAUT.zone)
  const textesGardes = lireReglages().zone === REGLAGES_PAR_DEFAUT.zone
  for (const cle of clesCommencantPar(RACINE))
    if (!(textesGardes && cle.startsWith(garder))) effacer(cle)
}

// Les notifications déjà confiées à Android sont annulées (plus aucun rappel
// n'est actif), puis l'app repart de l'accueil, toute mémoire de session oubliée.
export async function reinitialiserApp() {
  effacerMemoire()
  await reprogrammer().catch(() => {})
  window.location.replace('/')
}
