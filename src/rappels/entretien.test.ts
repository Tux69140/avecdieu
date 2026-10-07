import { beforeEach, describe, expect, it, vi } from 'vitest'
import { telephoneSimule } from '../telephone/simulation'
import { ouvrirLesNotifications, reprogrammer } from './entretien'
import { modifierRappel } from './reglages'

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
    telephone.toucher('https://ailleurs.example/')
    telephone.toucher('/reglages')
    expect(naviguer.mock.calls).toEqual([['/office/laudes/2026-10-08'], ['/chapelet']])
  })
})
