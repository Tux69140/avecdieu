import type { DefinitionChapelet, Etape, Moment, OptionDeroule, TypeGrain } from './definition'

// Une prière à dire, à sa place sur le chapelet.
export interface Pas {
  priere: Moment
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

// Toutes les options sont actives par défaut. Sans annonce à part (mode
// compact, ou annonce coupée), la dizaine s'ouvre sur le Notre Père.
export type Options = Partial<Record<OptionDeroule, boolean>>

export function derouler(definition: DefinitionChapelet, options: Options = {}): Deroule {
  const pas: Pas[] = []
  const grains: TypeGrain[] = []

  const ajouter = (etapes: Etape[], dizaine?: number) => {
    // Une étape retirée laisse son grain à la suivante.
    let retiree = false
    for (const etape of etapes) {
      if (etape.option && options[etape.option] === false) {
        retiree = true
        continue
      }
      const total = etape.repetitions ?? 1
      for (let rang = 1; rang <= total; rang++) {
        if (!(etape.memeGrain && rang === 1 && !retiree)) grains.push(etape.grain)
        pas.push({ priere: etape.priere, grain: grains.length - 1, dizaine, rang, total })
      }
      retiree = false
    }
  }

  ajouter(definition.ouverture)
  for (let d = 1; d <= definition.nombreDeDizaines; d++) ajouter(definition.dizaine, d)
  ajouter(definition.cloture)
  return { pas, grains }
}
