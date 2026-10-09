import type { Deroule } from './deroule'

export type Vibration = 'courte' | 'marquee'

// Pour prier sans regarder l'écran : chaque prière vibre court, et l'entrée
// dans une nouvelle partie vibre plus fort : chaque dizaine, ce qui annonce
// aussi le nouveau mystère, puis le Salve Regina et l'écran de fin.
export function vibrationEntre(deroule: Deroule, avant: number, apres: number): Vibration | null {
  if (avant === apres) return null
  if (apres < avant) return 'courte'
  // Au-delà de la dernière prière, l'écran de fin compte comme une partie à
  // lui seul. Au Rosaire, la dizaine se lit dans sa série : le passage d'une
  // série à l'autre vibre fort, comme une annonce.
  const partie = (index: number) => {
    const pas = deroule.pas[index]
    return pas ? `${pas.serie ?? ''} ${pas.dizaine ?? ''}` : 'fin'
  }
  return partie(avant) === partie(apres) ? 'courte' : 'marquee'
}
