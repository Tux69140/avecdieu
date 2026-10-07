import { lireReglages, REGLAGES_CHANGES, type Reglages, type Theme } from '../chapelet/reglages'
import { lieuDuSoleil, LIEU_CHANGE } from '../lieu/lieu'
import { CENTRE_FRANCE, leverEtCoucher, type Lieu } from '../office/soleil'
import { accorderLesBarres } from '../telephone/barres'

// Le thème et la taille du texte à prier, posés sur la page entière : les
// jetons de nuit (jetons.css) suivent `data-theme`, le texte à prier des
// offices et du chapelet suit `--taille-priere` (décisions du 2026-10-07).

// « automatique » : nuit si Android est en mode sombre, ou entre le coucher et
// le lever du soleil, calculés comme pour le cadran : au lieu des heures
// solaires s'il est connu, sinon au centre de la France.
export function estNuit(
  theme: Theme,
  sombre: boolean,
  maintenant: Date,
  lieu: Lieu = CENTRE_FRANCE,
): boolean {
  if (theme !== 'automatique') return theme === 'nuit'
  if (sombre) return true
  const { lever, coucher } = leverEtCoucher(maintenant, lieu)
  return maintenant < lever || maintenant >= coucher
}

export function appliquerApparence(
  { theme, tailleTexte }: Pick<Reglages, 'theme' | 'tailleTexte'>,
  sombre: boolean,
  maintenant: Date,
  lieu?: Lieu,
) {
  const page = document.documentElement
  const nuit = estNuit(theme, sombre, maintenant, lieu)
  const avant = page.dataset.theme
  page.dataset.theme = nuit ? 'nuit' : 'jour'
  page.style.setProperty('--taille-priere', `${tailleTexte}px`)
  if (avant !== page.dataset.theme) accorderLesBarres(nuit)
}

// Au démarrage, puis à chaque réglage changé, à chaque bascule du mode sombre
// d'Android, chaque minute (le soleil se couche app ouverte) et au retour de
// l'app au premier plan (Android endort les minuteries en arrière-plan).
export function suivreApparence(): () => void {
  const sombre = window.matchMedia?.('(prefers-color-scheme: dark)')
  const appliquer = () =>
    appliquerApparence(lireReglages(), sombre?.matches ?? false, new Date(), lieuDuSoleil())
  appliquer()
  const minuterie = setInterval(appliquer, 60_000)
  sombre?.addEventListener('change', appliquer)
  window.addEventListener(REGLAGES_CHANGES, appliquer)
  window.addEventListener(LIEU_CHANGE, appliquer)
  document.addEventListener('visibilitychange', appliquer)
  return () => {
    clearInterval(minuterie)
    sombre?.removeEventListener('change', appliquer)
    window.removeEventListener(REGLAGES_CHANGES, appliquer)
    window.removeEventListener(LIEU_CHANGE, appliquer)
    document.removeEventListener('visibilitychange', appliquer)
  }
}
