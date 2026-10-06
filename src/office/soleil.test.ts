import { describe, expect, it } from 'vitest'
import { CENTRE_FRANCE, leverEtCoucher } from './soleil'

// Heures publiées pour Paris (UTC), à la minute près.
const PARIS = { latitude: 48.8566, longitude: 2.3522 }
const utc = (iso: string) => new Date(iso).getTime()
const ecartMinutes = (date: Date, iso: string) => Math.abs(date.getTime() - utc(iso)) / 60000

describe('leverEtCoucher', () => {
  it.each([
    ['au solstice d’été', new Date(2026, 5, 21), '2026-06-21T03:47Z', '2026-06-21T19:58Z'],
    ['au solstice d’hiver', new Date(2026, 11, 21), '2026-12-21T07:42Z', '2026-12-21T15:56Z'],
    ['à l’équinoxe de printemps', new Date(2026, 2, 20), '2026-03-20T05:56Z', '2026-03-20T18:04Z'],
  ])('à Paris, %s, à trois minutes près', (_, jour, lever, coucher) => {
    const soleil = leverEtCoucher(jour, PARIS)
    expect(ecartMinutes(soleil.lever, lever)).toBeLessThan(3)
    expect(ecartMinutes(soleil.coucher, coucher)).toBeLessThan(3)
  })

  it('au centre de la France, les jours d’été sont plus courts qu’à Paris', () => {
    const juin = new Date(2026, 5, 21)
    const duree = (s: { lever: Date; coucher: Date }) => s.coucher.getTime() - s.lever.getTime()
    expect(duree(leverEtCoucher(juin, CENTRE_FRANCE))).toBeLessThan(
      duree(leverEtCoucher(juin, PARIS)),
    )
  })
})
