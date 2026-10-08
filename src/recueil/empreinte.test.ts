import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { FRUITS, SERIES } from './mysteres'
import { CONCLUSIONS, CONSIGNES, REGLES_RUBRIQUES, RUBRIQUE_EXAMEN, TEXTES_OFFICE } from './office'
import { PASSAGES } from './passages'
import { PRIERES } from './prieres'

// Les textes sacrés sont validés ligne par ligne par le porteur du projet.
// Si ce test échoue, un texte a changé : faire valider la nouvelle version
// par le porteur du projet AVANT de mettre à jour l'empreinte ci-dessous.
// Validation : 5 prières et 20 titres de mystères, le 2026-10-05 ;
// découpage des prières en vers et en strophes, le 2026-10-06 ;
// fruits (tradition et aujourd'hui) et 60 passages AELF, le 2026-10-06 ;
// « Ô mon Jésus », Salve Regina avec son verset, et les coupures pour prier
// à plusieurs (Notre Père, Je vous salue Marie, Gloire au Père), le 2026-10-06 ;
// textes ajoutés aux offices et règles de rubriques R1 à R10, le 2026-10-06 ;
// R8 complétée (envoi de l’AELF dans l’octave de Pâques et à la Pentecôte) et
// R11 (reprises du répons bref), le 2026-10-06 ; R12 (répons de l’intercession
// redit), R13 et ses consignes pour débuter, validés d'avance par le porteur
// du projet le 2026-10-08 (« nous les corrigerons au besoin »).
const empreinte = (donnees: unknown) =>
  createHash('sha256').update(JSON.stringify(donnees)).digest('hex')

describe('recueil de textes figés', () => {
  it('les prières sont celles validées par le porteur du projet', () => {
    expect(empreinte(PRIERES)).toBe(
      '95272c8d0588de2087215055f0c3e7e715ad8c747b1db5ca058ba29dcca2b57e',
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

  it('les textes ajoutés aux offices sont ceux validés par le porteur du projet', () => {
    expect(empreinte({ TEXTES_OFFICE, RUBRIQUE_EXAMEN, CONCLUSIONS, CONSIGNES })).toBe(
      '9e305df5c0d660037babbd276fdb0d98c068d83def2e6e1a7b9b10798af43e35',
    )
  })

  it('les règles de rubriques sont celles validées par le porteur du projet', () => {
    expect(empreinte(REGLES_RUBRIQUES)).toBe(
      '9fa4309b39b2124ac7ed225ff72ceb84c4702e0f9f3e5d4634afe4e8ca031ff7',
    )
  })
})
