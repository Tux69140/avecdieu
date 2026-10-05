import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { SERIES } from './mysteres'
import { PRIERES } from './prieres'

// Les textes sacrés sont validés ligne par ligne par le porteur du projet.
// Si ce test échoue, un texte a changé : faire valider la nouvelle version
// par le porteur du projet AVANT de mettre à jour l'empreinte ci-dessous.
// Validation : 5 prières et 20 titres de mystères, le 2026-10-05.
const empreinte = (donnees: unknown) => createHash('sha256').update(JSON.stringify(donnees)).digest('hex')

describe('recueil de textes figés', () => {
  it('les prières sont celles validées par le porteur du projet', () => {
    expect(empreinte(PRIERES)).toBe('d1e54ab8dd57c52808531196df83403d5af9dd502d0a68e50382755ed311325e')
  })

  it('les titres des mystères sont ceux validés par le porteur du projet', () => {
    expect(empreinte(SERIES)).toBe('f20110c4c7cbb63dd050dfdd154df59e5977cfd148353bd6816ff17d1b74db6a')
  })
})
