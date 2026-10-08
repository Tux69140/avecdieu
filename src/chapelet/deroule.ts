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
  // L'intention annoncée en rouge avant la prière (« Pour la foi. »).
  intention?: string
  // Le verset marial, dit avant ou après la prière.
  verset?: 'avant' | 'apres'
}

export interface Deroule {
  pas: Pas[]
  grains: TypeGrain[]
}

// Toutes les options sont actives par défaut. Sans annonce à part (mode
// compact, ou annonce coupée), la dizaine s'ouvre sur le Notre Père. Les
// options qui dépendent du mois (Litanies, saint Joseph) arrivent ici déjà
// tranchées (reglages.ts).
export type Options = Partial<Record<OptionDeroule, boolean>>

export function derouler(definition: DefinitionChapelet, options: Options = {}): Deroule {
  const pas: Pas[] = []
  const grains: TypeGrain[] = []

  // Les pas qui peuvent porter le verset marial : seul le dernier le dit.
  const porteurs: { pas: Pas; verset: 'avant' | 'apres' }[] = []
  const active = (option?: OptionDeroule) => option === undefined || options[option] !== false

  const ajouter = (etapes: Etape[], dizaine?: number) => {
    // Une étape « sur le même grain » partage celui de la dernière étape dite
    // de la même suite ; si toutes celles d'avant sont retirées, elle le prend.
    let ditAvant = false
    for (const etape of etapes) {
      if (!active(etape.option)) continue
      const total = etape.repetitions ?? 1
      for (let rang = 1; rang <= total; rang++) {
        if (!(etape.memeGrain && rang === 1 && ditAvant)) grains.push(etape.grain)
        const nouveau: Pas = {
          priere: etape.priere,
          grain: grains.length - 1,
          dizaine,
          rang,
          total,
        }
        const { intentions, verset } = etape
        if (intentions && active(intentions.option) && intentions.textes[rang - 1])
          nouveau.intention = intentions.textes[rang - 1]
        if (verset) porteurs.push({ pas: nouveau, verset })
        pas.push(nouveau)
      }
      ditAvant = true
    }
  }

  ajouter(definition.ouverture)
  for (let d = 1; d <= definition.nombreDeDizaines; d++) ajouter(definition.dizaine, d)
  ajouter(definition.cloture)
  const dernier = porteurs.at(-1)
  if (dernier) dernier.pas.verset = dernier.verset
  return { pas, grains }
}
