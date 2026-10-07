import { lireReglages, REGLAGES_PAR_DEFAUT } from '../chapelet/reglages'
import { reprogrammer } from '../rappels/entretien'

// L'app revient comme au premier lancement : tout ce qu'elle a retenu est
// effacé, sauf les textes déjà enregistrés de la zone d'origine, que la
// réserve devrait sinon retélécharger (et qui manqueraient sans réseau).
const RACINE = 'avec-dieu.'

export function effacerMemoire() {
  try {
    const garder = `${RACINE}aelf.${REGLAGES_PAR_DEFAUT.zone}.`
    const textesGardes = lireReglages().zone === REGLAGES_PAR_DEFAUT.zone
    const aEffacer: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i)
      if (cle?.startsWith(RACINE) && !(textesGardes && cle.startsWith(garder))) aEffacer.push(cle)
    }
    for (const cle of aEffacer) localStorage.removeItem(cle)
  } catch {
    // Mémoire indisponible : il n'y a rien à effacer.
  }
}

// Les notifications déjà confiées à Android sont annulées (plus aucun rappel
// n'est actif), puis l'app repart de l'accueil, toute mémoire de session oubliée.
export async function reinitialiserApp() {
  effacerMemoire()
  await reprogrammer().catch(() => {})
  window.location.replace('/')
}
