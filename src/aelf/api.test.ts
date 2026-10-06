import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chargerOffice, ErreurAelf } from './api'

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

  it('échoue clairement si l’AELF répond une erreur', async () => {
    repondre('<!DOCTYPE HTML><html>introuvable</html>', 404)
    await expect(chargerOffice('lectures', '2026-04-05')).rejects.toBeInstanceOf(ErreurAelf)
  })

  it('échoue clairement si la réponse n’est pas un office', async () => {
    repondre('<!DOCTYPE HTML><html></html>')
    await expect(chargerOffice('laudes', '2026-10-06')).rejects.toBeInstanceOf(ErreurAelf)
    repondre('{"informations": {}}')
    await expect(chargerOffice('laudes', '2026-10-06')).rejects.toBeInstanceOf(ErreurAelf)
  })
})
