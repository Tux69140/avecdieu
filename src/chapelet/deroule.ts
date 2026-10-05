import type { PriereId } from '../recueil/prieres'
import type { DefinitionChapelet, Etape, TypeGrain } from './definition'

// Une prière à dire, à sa place sur le chapelet.
export interface Pas {
  priere: PriereId
  // Index dans Deroule.grains.
  grain: number
  // 1 à 5 dans les dizaines, absent à l'ouverture.
  dizaine?: number
  // Rang de la répétition (3e Je vous salue Marie sur 10).
  rang: number
  total: number
}

export interface Deroule {
  pas: Pas[]
  grains: TypeGrain[]
}

export function derouler(definition: DefinitionChapelet): Deroule {
  const pas: Pas[] = []
  const grains: TypeGrain[] = []

  const ajouter = (etapes: Etape[], dizaine?: number) => {
    for (const etape of etapes) {
      const total = etape.repetitions ?? 1
      for (let rang = 1; rang <= total; rang++) {
        if (!(etape.memeGrain && rang === 1)) grains.push(etape.grain)
        pas.push({ priere: etape.priere, grain: grains.length - 1, dizaine, rang, total })
      }
    }
  }

  ajouter(definition.ouverture)
  for (let d = 1; d <= definition.nombreDeDizaines; d++) ajouter(definition.dizaine, d)
  return { pas, grains }
}
