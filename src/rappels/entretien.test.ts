import { beforeEach, describe, expect, it, vi } from 'vitest'
import { telephoneSimule } from '../telephone/simulation'
import { ouvrirLesNotifications, reprogrammer } from './entretien'
import { choisirLieu } from '../lieu/lieu'
import { modifierRappel } from './reglages'
import { modifierSolaire } from './solaire'

const MAINTENANT = new Date(2026, 9, 7, 10, 0)

beforeEach(() => {
  localStorage.clear()
  delete window.__telephone
  window.__telephoneInitial = { accord: 'granted' }
})

describe('reprogrammation des rappels', () => {
  it('programme le mois à venir dans les canaux nécessaires', async () => {
    modifierRappel('laudes', { actif: true })
    modifierRappel('vepres', { actif: true })
    await reprogrammer(MAINTENANT)
    const telephone = telephoneSimule()
    expect(telephone.programmees).toHaveLength(61)
    expect(telephone.programmees[0]).toMatchObject({
      titre: 'C’est l’heure des vêpres',
      route: '/office/vepres/2026-10-07',
      exacte: true,
    })
    expect(telephone.canaux.sort()).toEqual([
      'rappel-bourdon_notre_dame-vibreur',
      'rappel-cloche_marcel-vibreur',
    ])
  })

  it('en heures solaires, chaque jour sonne à l’heure du soleil de ce jour-là', async () => {
    choisirLieu({ nom: 'Lyon', pres: false, latitude: 45.76, longitude: 4.84 })
    modifierSolaire({ actives: true })
    modifierRappel('sexte', { actif: true })
    await reprogrammer(MAINTENANT)
    const heures = telephoneSimule().programmees.map((n) => {
      const quand = new Date(n.quand)
      return quand.getHours() * 60 + quand.getMinutes()
    })
    // Midi solaire de Lyon : vers 13 h 23 début octobre, 12 h 30 début novembre
    // (heure d'hiver) ; jamais midi pile, l'heure fixe.
    expect(heures[0]).toBeGreaterThan(13 * 60 + 15)
    expect(heures.at(-1)).toBeLessThan(12 * 60 + 40)
    expect(new Set(heures).size).toBeGreaterThan(2)
  })

  it('remplace les anciennes et retire les canaux inutiles', async () => {
    modifierRappel('laudes', { actif: true })
    await reprogrammer(MAINTENANT)
    modifierRappel('laudes', { actif: false })
    modifierRappel('complies', { actif: true, vibreur: false })
    await reprogrammer(MAINTENANT)
    const telephone = telephoneSimule()
    expect(new Set(telephone.programmees.map((n) => n.titre))).toEqual(
      new Set(['C’est l’heure des complies']),
    )
    expect(telephone.canaux).toEqual(['rappel-bourdon_notre_dame-sans-vibreur'])
  })

  it('tout est retiré quand plus aucun rappel n’est actif', async () => {
    modifierRappel('laudes', { actif: true })
    await reprogrammer(MAINTENANT)
    modifierRappel('laudes', { actif: false })
    await reprogrammer(MAINTENANT)
    expect(telephoneSimule().programmees).toEqual([])
    expect(telephoneSimule().canaux).toEqual([])
  })

  it('attend l’accord d’Android', async () => {
    window.__telephoneInitial = { accord: 'prompt' }
    modifierRappel('laudes', { actif: true })
    await reprogrammer(MAINTENANT)
    expect(telephoneSimule().programmees).toEqual([])
  })

  it('sans « Alarmes et rappels », les rappels sont programmés sans exactitude', async () => {
    window.__telephoneInitial = { accord: 'granted', exacte: false }
    modifierRappel('laudes', { actif: true })
    await reprogrammer(MAINTENANT)
    expect(telephoneSimule().programmees.every((n) => !n.exacte)).toBe(true)
  })
})

describe('notification touchée', () => {
  it('ouvre la route de sa prière, et rien d’autre', () => {
    const naviguer = vi.fn()
    ouvrirLesNotifications(naviguer)
    const telephone = telephoneSimule()
    telephone.toucher('/office/laudes/2026-10-08')
    telephone.toucher('/chapelet')
    // Un rappel du Rosaire encore affiché, programmé avant les deux seuils.
    telephone.toucher('/rosaire')
    telephone.toucher('https://ailleurs.example/')
    telephone.toucher('/reglages')
    expect(naviguer.mock.calls).toEqual([
      ['/office/laudes/2026-10-08'],
      ['/chapelet'],
      ['/rosaire'],
    ])
  })
})

// Le Rosaire n'a pas d'heure, donc pas de rappel : celui du chapelet ouvre
// toujours le chapelet, même si l'ancien commutateur du seuil avait retenu le
// Rosaire (révisé le 2026-10-09).
describe('rappel du chapelet', () => {
  const chapelet = () => telephoneSimule().programmees.map((n) => [n.titre, n.route])[0]

  it('annonce et ouvre toujours le chapelet', async () => {
    modifierRappel('chapelet', { actif: true })
    await reprogrammer(MAINTENANT)
    expect(chapelet()).toEqual(['C’est l’heure du chapelet', '/chapelet'])
    localStorage.setItem('avec-dieu.reglages', JSON.stringify({ forme: 'rosaire' }))
    await reprogrammer(MAINTENANT)
    expect(chapelet()).toEqual(['C’est l’heure du chapelet', '/chapelet'])
  })
})
