import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { FRUITS, SERIES } from './mysteres'
import { PASSAGES } from './passages'
import { PRIERES } from './prieres'

// Les textes sacrés sont validés ligne par ligne par le porteur du projet.
// Si ce test échoue, un texte a changé : faire valider la nouvelle version
// par le porteur du projet AVANT de mettre à jour l'empreinte ci-dessous.
// Validation : 5 prières et 20 titres de mystères, le 2026-10-05 ;
// découpage des prières en vers et en strophes, le 2026-10-06 ;
// fruits (tradition et aujourd'hui) et 60 passages AELF, le 2026-10-06.
const empreinte = (donnees: unknown) =>
  createHash('sha256').update(JSON.stringify(donnees)).digest('hex')

describe('recueil de textes figés', () => {
  it('les prières sont celles validées par le porteur du projet', () => {
    expect(empreinte(PRIERES)).toBe(
      '6803186459f2efcca3e9297f6b38d26f1c9b4c6221d5081da2cb41f72fd62437',
    )
  })

  it('les titres des mystères sont ceux validés par le porteur du projet', () => {
    expect(empreinte(SERIES)).toBe(
      'f20110c4c7cbb63dd050dfdd154df59e5977cfd148353bd6816ff17d1b74db6a',
    )
  })

  it('les fruits des mystères sont ceux validés par le porteur du projet', () => {
    expect(empreinte(FRUITS)).toBe(
      'f979d34059bd384f8a3c6c1e24546842d9660fd3b098648b6fcd4a7663936e61',
    )
  })

  it('les passages des mystères sont ceux validés par le porteur du projet', () => {
    expect(empreinte(PASSAGES)).toBe(
      '80f829a79a1ae2974ff7ea94e769034dcbe611a1d3f0e75063b120c636614404',
    )
  })
})
