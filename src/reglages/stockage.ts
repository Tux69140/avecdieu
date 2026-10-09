// La mémoire du téléphone, et rien d'autre : rien ne quitte l'appareil.
// Une mémoire indisponible (stockage bloqué, plein) ne doit jamais interrompre
// la prière : on retombe sur les valeurs par défaut et on oublie l'écriture.

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
