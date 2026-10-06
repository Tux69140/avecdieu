import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chargerJour, chargerOffice, ErreurAelf } from './api'

const laudes = readFileSync('src/aelf/exemples/laudes-2026-10-06.json', 'utf8')

function repondre(corps: string, status = 200) {
  const espion = vi.fn<typeof fetch>(async () => new Response(corps, { status }))
  vi.stubGlobal('fetch', espion)
  return espion
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('chargerOffice', () => {
  it('interroge l’AELF pour la zone France et rend l’office et son jour', async () => {
    const espion = repondre(laudes)
    const { office, jour } = await chargerOffice('laudes', '2026-10-06')
    expect(espion).toHaveBeenCalledWith(
      'https://api.aelf.org/v1/laudes/2026-10-06/france',
      expect.anything(),
    )
    expect(office.nom).toBe('laudes')
    expect(office.parties[0].libelle).toBe('Introduction')
    expect(jour.couleurs[0]).toBe('vert')
  })

  it('échoue clairement si le réseau manque', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(chargerOffice('laudes', '2026-10-06')).rejects.toBeInstanceOf(ErreurAelf)
  })

  it('distingue l’office que l’AELF ne propose pas (404) d’une panne', async () => {
    repondre('<!DOCTYPE HTML><html>introuvable</html>', 404)
    const absent = await chargerOffice('lectures', '2026-04-05').catch((e) => e)
    expect(absent).toBeInstanceOf(ErreurAelf)
    expect(absent.absent).toBe(true)
    repondre('panne', 500)
    const panne = await chargerOffice('lectures', '2026-04-05').catch((e) => e)
    expect(panne).toBeInstanceOf(ErreurAelf)
    expect(panne.absent).toBe(false)
  })

  it('échoue clairement si la réponse n’est pas un office', async () => {
    repondre('<!DOCTYPE HTML><html></html>')
    await expect(chargerOffice('laudes', '2026-10-06')).rejects.toBeInstanceOf(ErreurAelf)
    repondre('{"informations": {}}')
    await expect(chargerOffice('laudes', '2026-10-06')).rejects.toBeInstanceOf(ErreurAelf)
  })
})

describe('chargerJour', () => {
  const informations = readFileSync('src/aelf/exemples/informations-2026-10-06.json', 'utf8')

  it('interroge l’AELF pour la zone France et rend le jour liturgique', async () => {
    const espion = repondre(informations)
    const jour = await chargerJour('2026-10-06')
    expect(espion).toHaveBeenCalledWith(
      'https://api.aelf.org/v1/informations/2026-10-06/france',
      expect.anything(),
    )
    expect(jour.celebration).toBe('S. Bruno, prêtre')
    expect(jour.couleurs[0]).toBe('vert')
  })

  it('échoue clairement si le réseau manque ou si la réponse n’est pas un jour', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(chargerJour('2026-10-06')).rejects.toBeInstanceOf(ErreurAelf)
    repondre('<!DOCTYPE HTML><html></html>')
    await expect(chargerJour('2026-10-06')).rejects.toBeInstanceOf(ErreurAelf)
    repondre('{"informations": "rien"}')
    await expect(chargerJour('2026-10-06')).rejects.toBeInstanceOf(ErreurAelf)
  })
})
