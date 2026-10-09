import type { SerieId } from '../recueil/mysteres'
import type { DefinitionChapelet, Etape, Moment, OptionDeroule, TypeGrain } from './definition'

// Une prière à dire, à sa place sur le chapelet.
export interface Pas {
  priere: Moment
  // Index dans Deroule.grains.
  grain: number
  // 1 à 5 dans les dizaines, absent à l'ouverture.
  dizaine?: number
  // Au Rosaire, la série de la dizaine ; absente au chapelet, dont la série
  // est choisie au seuil.
  serie?: SerieId
  // Au Rosaire, le premier pas des séries 2 à 4 : la ligne qui marque le
  // passage d'une série à l'autre s'y affiche.
  nouvelleSerie?: boolean
  // Rang de la répétition (3e Je vous salue Marie sur 10).
  rang: number
  total: number
  // L'intention annoncée en rouge avant la prière (« Pour la foi. »).
  intention?: string
  // Le verset marial, dit avant ou après la prière.
  verset?: 'avant' | 'apres'
  // Une prière d'usage, que « L’essentiel seulement » retire (phase 18).
  facultatif?: true
  // L'intention de prière du pape pour le mois s'affiche sous l'intention.
  intentionDuMois?: true
  // La fin, après la dernière dizaine : la prière aux intentions du
  // Saint-Père et la clôture. Son Notre Père n'est pas celui de l'ouverture.
  fin?: true
}

export interface Deroule {
  pas: Pas[]
  grains: TypeGrain[]
}

// Toutes les options sont actives par défaut. Sans annonce à part (mode
// compact, ou annonce coupée), la dizaine s'ouvre sur le Notre Père. Les
// options qui dépendent du mois (Litanies, saint Joseph) arrivent ici déjà
// tranchées (reglages.ts). « L’essentiel seulement » (phase 18) l'emporte sur
// elles : il retire toutes les prières d'usage, quelles que soient les options.
export type Options = Partial<Record<OptionDeroule, boolean>> & { essentiel?: boolean }

interface Partie {
  dizaine?: number
  fin?: boolean
  grainsMuets?: boolean
}

export function derouler(definition: DefinitionChapelet, options: Options = {}): Deroule {
  const pas: Pas[] = []
  const grains: TypeGrain[] = []

  // Les pas qui peuvent porter le verset marial : seul le dernier le dit.
  const porteurs: { pas: Pas; verset: 'avant' | 'apres' }[] = []
  const active = (option?: OptionDeroule) => option === undefined || options[option] !== false

  // Une étape « sur le même grain » partage celui de la dernière étape dite
  // de la même suite ; si toutes celles d'avant sont retirées, elle le prend.
  // « grainsMuets » : retirée par « L’essentiel seulement », une étape garde
  // ses grains sans rien y dire, pour que le chapelet dessiné garde son
  // pendentif ; la médaille, elle, n'est un grain que si l'on y prie.
  const ajouter = (etapes: Etape[], { dizaine, fin, grainsMuets }: Partie = {}) => {
    let ditAvant = false
    for (const etape of etapes) {
      if (!active(etape.option)) continue
      const muette = options.essentiel === true && etape.facultative === true
      if (muette && !grainsMuets) continue
      const total = etape.repetitions ?? 1
      for (let rang = 1; rang <= total; rang++) {
        if (!(etape.memeGrain && rang === 1 && ditAvant)) grains.push(etape.grain)
        if (muette) continue
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
        if (etape.facultative) nouveau.facultatif = true
        if (etape.intentionDuMois) nouveau.intentionDuMois = true
        if (fin) nouveau.fin = true
        pas.push(nouveau)
      }
      ditAvant = true
    }
  }

  ajouter(definition.ouverture, { grainsMuets: true })
  const debutBoucle = pas.length
  for (let d = 1; d <= definition.nombreDeDizaines; d++) ajouter(definition.dizaine, { dizaine: d })
  // Au Rosaire, la même boucle se reprend pour chaque série, sur les mêmes
  // grains : les pas de la première série se répètent pour les suivantes.
  const [premiere, ...suivantes] = definition.series ?? []
  if (premiere) {
    const boucle = pas.splice(debutBoucle)
    pas.push(...boucle.map((p) => ({ ...p, serie: premiere })))
    for (const serie of suivantes)
      pas.push(...boucle.map((p, i) => ({ ...p, serie, ...(i === 0 && { nouvelleSerie: true }) })))
  }
  ajouter(definition.cloture, { fin: true })
  const dernier = porteurs.at(-1)
  if (dernier) dernier.pas.verset = dernier.verset
  return { pas, grains }
}

// La série que l'écran montre à ce pas : au Rosaire, celle de la dizaine, ou
// la dernière commencée (clôture, fin), ou la première (ouverture) ; au
// chapelet, celle choisie au seuil.
export function serieAtteinte({ pas }: Deroule, index: number, choisie: SerieId): SerieId {
  const avant = pas.slice(0, index + 1).findLast((p) => p.serie !== undefined)
  return avant?.serie ?? pas.find((p) => p.serie !== undefined)?.serie ?? choisie
}
