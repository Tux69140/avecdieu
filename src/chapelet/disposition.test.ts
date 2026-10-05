import { describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL } from './definition'
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

  it('suspend la croix tout en bas, sous la médaille', () => {
    const croix = plan.points[0]
    expect(Math.max(...plan.points.map((p) => p.y))).toBe(croix.y)
    expect(croix.x).toBeCloseTo(plan.medaille.x)
    expect(croix.y).toBeGreaterThan(plan.medaille.y)
  })
})
