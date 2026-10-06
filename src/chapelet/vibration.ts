import type { Deroule } from './deroule'

export type Vibration = 'courte' | 'marquee'

// Pour prier sans regarder l'écran : chaque prière vibre court, et l'entrée
// dans une nouvelle partie vibre plus fort : chaque dizaine, ce qui annonce
// aussi le nouveau mystère, puis le Salve Regina et l'écran de fin.
export function vibrationEntre(deroule: Deroule, avant: number, apres: number): Vibration | null {
  if (avant === apres) return null
  if (apres < avant) return 'courte'
  // Au-delà de la dernière prière, l'écran de fin compte comme une partie à lui seul.
  const partie = (index: number) =>
    index < deroule.pas.length ? deroule.pas[index].dizaine : 'fin'
  return partie(avant) === partie(apres) ? 'courte' : 'marquee'
}
