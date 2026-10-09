import type { Partie } from './modele'

// Une clé qui ne bouge pas quand l'invitatoire s'insère en tête : une prière
// dépliée reste celle que l'on a dépliée.
export const clesDesParties = (parties: readonly Partie[]) => {
  const vues = new Map<string, number>()
  return parties.map((p) => {
    const n = (vues.get(p.libelle) ?? 0) + 1
    vues.set(p.libelle, n)
    return `${p.libelle}·${n}`
  })
}
