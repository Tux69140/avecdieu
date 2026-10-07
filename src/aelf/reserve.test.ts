import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { contient, enregistrer, etendue, RESSOURCES } from './cache'
import { lireReglages } from '../chapelet/reglages'
import { changerDeZone, completerReserve, entretenirReserve, joursAGarder } from './reserve'

// L'AELF simulée : chaque ressource rend la réponse enregistrée du 6 octobre,
// datée du jour demandé (le jour liturgique doit porter la bonne date).
function aelf() {
  const espion = vi.fn<typeof fetch>(async (adresse) => {
    const [ressource, date] = new URL(String(adresse)).pathname.split('/').slice(2, 4)
    const corps = JSON.parse(readFileSync(`src/aelf/exemples/${ressource}-2026-10-06.json`, 'utf8'))
    corps.informations.date = date
    return new Response(JSON.stringify(corps))
  })
  vi.stubGlobal('fetch', espion)
  return espion
}

const demandees = (espion: ReturnType<typeof aelf>) =>
  espion.mock.calls.map(([adresse]) => new URL(String(adresse)).pathname.slice(3))

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('joursAGarder', () => {
  it('aujourd’hui d’abord, puis les 7 jours suivants, puis la veille', () => {
    expect(joursAGarder('2026-10-07')).toEqual([
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-06',
    ])
  })
})

describe('completerReserve', () => {
  it('enregistre la veille, aujourd’hui et 7 jours d’avance, aujourd’hui en premier', async () => {
    const espion = aelf()
    await completerReserve('2026-10-07')
    expect(espion).toHaveBeenCalledTimes(9 * 8)
    expect(demandees(espion).slice(0, 8).sort()).toEqual(
      RESSOURCES.map((r) => `/${r}/2026-10-07/france`).sort(),
    )
    expect(etendue('2026-10-07')).toEqual({ debut: '2026-10-06', fin: '2026-10-14' })
  })

  it('ne retélécharge pas ce qui est déjà enregistré', async () => {
    const espion = aelf()
    await completerReserve('2026-10-07')
    espion.mockClear()
    await completerReserve('2026-10-07')
    expect(espion).not.toHaveBeenCalled()
    // Le lendemain, seul le nouveau 7e jour manque.
    await completerReserve('2026-10-08')
    expect(demandees(espion).sort()).toEqual(
      RESSOURCES.map((r) => `/${r}/2026-10-15/france`).sort(),
    )
  })

  it('s’arrête à la première panne, sans insister', async () => {
    const espion = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', espion)
    await completerReserve('2026-10-07')
    expect(espion.mock.calls.length).toBeLessThanOrEqual(3)
    expect(etendue('2026-10-07')).toBeUndefined()
  })

  it('un office que l’AELF ne propose pas ne l’arrête pas', async () => {
    const espion = aelf()
    espion.mockImplementationOnce(async () => new Response('introuvable', { status: 404 }))
    await completerReserve('2026-10-07')
    expect(etendue('2026-10-07')).toEqual({ debut: '2026-10-06', fin: '2026-10-14' })
  })

  it('efface les jours d’avant la veille une fois la réserve complète', async () => {
    enregistrer('laudes', '2026-10-05', {})
    aelf()
    await completerReserve('2026-10-07')
    expect(contient('laudes', '2026-10-05')).toBe(false)
    expect(contient('laudes', '2026-10-06')).toBe(true)
  })

  it('sans réseau, garde les jours passés : ce sont les seuls textes disponibles', async () => {
    enregistrer('laudes', '2026-10-05', {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await completerReserve('2026-10-07')
    expect(contient('laudes', '2026-10-05')).toBe(true)
  })
})

describe('changerDeZone', () => {
  it('oublie les textes de l’ancienne zone et refait la réserve pour la nouvelle', async () => {
    const espion = aelf()
    await completerReserve('2026-10-07')
    espion.mockClear()
    const arret = entretenirReserve()
    changerDeZone('belgique')
    expect(lireReglages().zone).toBe('belgique')
    expect(localStorage.getItem('avec-dieu.aelf.france.laudes.2026-10-07')).toBeNull()
    await expect
      .poll(() => etendue('2026-10-07'))
      .toEqual({ debut: '2026-10-06', fin: '2026-10-14' })
    expect(demandees(espion).every((d) => d.endsWith('/belgique'))).toBe(true)
    arret()
  })
})
