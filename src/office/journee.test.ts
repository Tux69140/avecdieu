import { beforeEach, describe, expect, it } from 'vitest'
import { deplacerInvitatoire, ouvrirOffice } from './journee'

describe('R1 : l’office qui ouvre la journée', () => {
  beforeEach(() => localStorage.clear())

  it('le premier des deux offices ouverts porte l’invitatoire, l’autre non', () => {
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(true)
    expect(ouvrirOffice('lectures', '2026-10-06')).toBe(false)
    // Rouvert plus tard dans la journée, il le garde.
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(true)
  })

  it('l’office des lectures ouvert d’abord le prend aux laudes', () => {
    expect(ouvrirOffice('lectures', '2026-10-06')).toBe(true)
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(false)
  })

  it('chaque jour a son premier office', () => {
    expect(ouvrirOffice('lectures', '2026-10-06')).toBe(true)
    expect(ouvrirOffice('laudes', '2026-10-07')).toBe(true)
  })

  it('les autres offices ne portent jamais l’invitatoire, et ne comptent pas', () => {
    expect(ouvrirOffice('tierce', '2026-10-06')).toBe(false)
    expect(ouvrirOffice('vepres', '2026-10-06')).toBe(false)
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(true)
  })

  it('le lien déplace l’invitatoire vers l’office où l’on est', () => {
    ouvrirOffice('lectures', '2026-10-06')
    deplacerInvitatoire('laudes', '2026-10-06')
    expect(ouvrirOffice('laudes', '2026-10-06')).toBe(true)
    expect(ouvrirOffice('lectures', '2026-10-06')).toBe(false)
  })

  it('n’encombre pas le téléphone : seules les dernières dates sont retenues', () => {
    for (let jour = 1; jour <= 20; jour++)
      ouvrirOffice('laudes', `2026-10-${String(jour).padStart(2, '0')}`)
    const retenues = Object.keys(JSON.parse(localStorage.getItem('avec-dieu.invitatoire')!))
    expect(retenues).toHaveLength(14)
    expect(retenues[0]).toBe('2026-10-07')
  })

  it('une date plus ancienne que les autres reste retenue une fois ouverte', () => {
    for (let jour = 10; jour <= 25; jour++) ouvrirOffice('laudes', `2026-10-${jour}`)
    expect(ouvrirOffice('lectures', '2026-10-01')).toBe(true)
    expect(ouvrirOffice('laudes', '2026-10-01')).toBe(false)
  })
})
