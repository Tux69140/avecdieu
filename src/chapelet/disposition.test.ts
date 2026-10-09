import { describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL, ROSAIRE } from './definition'
import { derouler } from './deroule'
import { disposer } from './disposition'

const deroule = derouler(CHAPELET_MARIAL)
const plan = disposer(deroule)

describe('disposition du chapelet dessiné', () => {
  it('place chaque grain, nœud et croix du déroulé', () => {
    expect(plan.points).toHaveLength(deroule.grains.length)
    expect(plan.points.map((p) => p.type)).toEqual(deroule.grains)
  })

  it('ne fait se chevaucher aucun grain', () => {
    for (let i = 0; i < plan.points.length; i++) {
      for (let j = i + 1; j < plan.points.length; j++) {
        const a = plan.points[i]
        const b = plan.points[j]
        expect(Math.hypot(a.x - b.x, a.y - b.y), `grains ${i} et ${j}`).toBeGreaterThan(a.r + b.r)
      }
    }
  })

  it('garde tout le dessin dans le cadre', () => {
    for (const p of plan.points) {
      expect(p.x - p.r).toBeGreaterThanOrEqual(0)
      expect(p.x + p.r).toBeLessThanOrEqual(plan.largeur)
      expect(p.y - p.r).toBeGreaterThanOrEqual(0)
      expect(p.y + p.r).toBeLessThanOrEqual(plan.hauteur)
    }
  })

  it('couche la boucle ; le pendentif part à droite puis descend, la croix pend en bas', () => {
    const { cx, cy, rx } = plan.boucle
    expect(plan.medaille).toEqual({ x: cx + rx, y: cy })
    const finPendentif = deroule.pas.find((p) => p.dizaine === 1)!.grain
    const pendentif = plan.points.slice(0, finPendentif + 1)
    for (const p of pendentif) {
      expect(p.x).toBeGreaterThan(plan.medaille.x)
      expect(p.y).toBeGreaterThanOrEqual(plan.medaille.y - 0.01)
    }
    // Du grain le plus proche de la médaille à la croix, le fil ne remonte jamais.
    for (let i = 0; i < pendentif.length - 1; i++)
      expect(pendentif[i].y).toBeGreaterThanOrEqual(pendentif[i + 1].y - 0.01)
    const croix = plan.points[0]
    expect(croix.y).toBe(Math.max(...pendentif.map((p) => p.y)))
    expect(croix.y).toBeGreaterThan(cy)
    // La croix droite dépasse son rayon de 3,4 vers le bas : elle reste dans le cadre.
    expect(croix.y + 12.4).toBeLessThanOrEqual(plan.hauteur)
  })

  it('tient en moins d’un tiers de sa largeur en hauteur', () => {
    expect(plan.hauteur / plan.largeur).toBeLessThan(1 / 3)
  })

  it('pose la clôture sur la médaille, et sans elle le dessin reste le même', () => {
    expect(plan.points.at(-1)).toMatchObject({ type: 'medaille', ...plan.medaille })
    expect(plan.points.filter((p) => p.type === 'medaille')).toHaveLength(1)
    const sansCloture = disposer(
      derouler(CHAPELET_MARIAL, {
        salveRegina: false,
        litanies: false,
        oraisonRosaire: false,
        sousLAbri: false,
        saintJoseph: false,
      }),
    )
    expect(sansCloture.points).toEqual(plan.points.slice(0, -1))
  })

  it('tient dans un cadre au moins deux fois plus large que haut', () => {
    expect(plan.hauteur * 2).toBeLessThanOrEqual(plan.largeur)
  })
})

describe('disposition du Rosaire', () => {
  it('une seule boucle de cinq dizaines, le même dessin que le chapelet', () => {
    expect(disposer(derouler(ROSAIRE))).toEqual(plan)
  })
})
