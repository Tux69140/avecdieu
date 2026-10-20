import { Capacitor, registerPlugin } from '@capacitor/core'

// L'ouverture de l'app (choix du porteur du projet, 2026-10-20) : l'écran de
// démarrage d'Android reste jusqu'au premier écran dessiné, puis disparaît d'un
// coup (android/…/Demarrage.java), et ce premier écran paraît sans fondu. Les
// entretiens (réserve, rappels, voyages) attendent qu'il soit là : l'accueil
// d'abord.

const Demarrage = registerPlugin<{ pret(): Promise<void> }>('Demarrage')

const RACINE = document.documentElement
let affiche = false
const enAttente: (() => void)[] = []

// Le premier écran entre sans fondu (jetons.css) ; les suivants, en fondu.
export function ouvrirSansFondu(cleDuPremierEcran: string) {
  RACINE.dataset.ouverture = ''
  return (cleDeLEcran: string) => {
    if (cleDeLEcran !== cleDuPremierEcran) delete RACINE.dataset.ouverture
  }
}

export function apresPremierAffichage(tache: () => void) {
  if (affiche) tache()
  else enAttente.push(tache)
}

// Appelé une fois le premier écran rendu.
export function signalerPremierAffichage() {
  if (affiche) return
  affiche = true
  // Rien qui attende une image ici : tant que l'écran de démarrage est là, la
  // page n'est pas peinte, et une image décodée d'avance ne le serait jamais.
  if (Capacitor.isNativePlatform()) Demarrage.pret().catch(() => {})
  // Une tâche à part : le premier écran se peint avant les entretiens.
  setTimeout(() => enAttente.splice(0).forEach((tache) => tache()))
}
