// La mémoire du téléphone, et rien d'autre : rien ne quitte l'appareil.
// Une mémoire indisponible (stockage bloqué, plein) ne doit jamais interrompre
// la prière : on retombe sur les valeurs par défaut et on oublie l'écriture.

// Toutes les clés de l'app commencent ainsi : la réinitialisation efface ce
// qui porte cette marque, et rien d'une autre app. Les clés ne changent
// jamais : les données des téléphones doivent se relire.
export const RACINE = 'avec-dieu.'

export function lire(cle: string): string | null {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}

export function ecrire(cle: string, valeur: string) {
  try {
    localStorage.setItem(cle, valeur)
  } catch {
    // Rien à faire : la prière continue sans mémoire.
  }
}

export function effacer(cle: string) {
  try {
    localStorage.removeItem(cle)
  } catch {
    // Idem : au pire, la valeur sera ignorée à la prochaine lecture.
  }
}

// Un objet lu en JSON (ni null, ni tableau), dont chaque valeur reste à vérifier.
export const estObjet = (valeur: unknown): valeur is Record<string, unknown> =>
  typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)

// Un objet enregistré en JSON, ou un objet vide s'il est absent ou illisible.
export function lireObjet(cle: string): Record<string, unknown> {
  try {
    const valeur: unknown = JSON.parse(lire(cle) ?? '{}')
    return estObjet(valeur) ? valeur : {}
  } catch {
    return {}
  }
}

// Les clés de la mémoire qui commencent par ce préfixe.
export function clesCommencantPar(prefixe: string): string[] {
  try {
    const trouvees: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const nom = localStorage.key(i)
      if (nom?.startsWith(prefixe)) trouvees.push(nom)
    }
    return trouvees
  } catch {
    return []
  }
}

// Un objet enregistré en JSON, puis signalé à la page, qui suit aussitôt.
export function ecrireEtSignaler(cle: string, valeur: unknown, evenement: string) {
  ecrire(cle, JSON.stringify(valeur))
  window.dispatchEvent(new Event(evenement))
}

// Une aide qui revient tant que « Ne plus afficher » n'est pas coché ; les
// réglages la rétablissent.
export function aideMasquable(cle: string) {
  return {
    aMontrer: () => lire(cle) !== 'masquee',
    masquer: () => ecrire(cle, 'masquee'),
    montrer: () => effacer(cle),
  }
}
