import { beforeEach, describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL } from './definition'
import { derouler } from './deroule'
import {
  effacerEnCours,
  libelleReprise,
  lireEnCours,
  retenirEnCours,
  retrouver,
  type ChapeletEnCours,
} from './reprise'

const LUNDI = new Date(2026, 9, 5, 10, 0)
const LUNDI_SOIR = new Date(2026, 9, 5, 23, 59)
const MARDI = new Date(2026, 9, 6, 0, 1)
const COMPLET = derouler(CHAPELET_MARIAL)
// 3e dizaine, 4e Je vous salue Marie.
const AVE_3_4 = COMPLET.pas.findIndex(
  (p) => p.dizaine === 3 && p.priere === 'je-vous-salue-marie' && p.rang === 4,
)

beforeEach(() => localStorage.clear())

describe('chapelet en cours', () => {
  it('se retrouve le jour même, jusqu’à minuit', () => {
    retenirEnCours(LUNDI, 'joyeux', COMPLET.pas[AVE_3_4])
    expect(lireEnCours(LUNDI_SOIR)).toEqual({
      jour: '2026-10-05',
      serie: 'joyeux',
      dizaine: 3,
      priere: 'je-vous-salue-marie',
      rang: 4,
    })
  })

  it('est abandonné passé minuit', () => {
    retenirEnCours(LUNDI, 'joyeux', COMPLET.pas[AVE_3_4])
    expect(lireEnCours(MARDI)).toBeNull()
  })

  it('s’oublie quand on l’efface, ou si la mémoire est illisible', () => {
    retenirEnCours(LUNDI, 'joyeux', COMPLET.pas[0])
    effacerEnCours()
    expect(lireEnCours(LUNDI)).toBeNull()
    localStorage.setItem('avec-dieu.en-cours', '{"jour":"2026-10-05","serie":"inconnue"}')
    expect(lireEnCours(LUNDI)).toBeNull()
  })
})

describe('retrouver le grain', () => {
  const repere = (pas: (typeof COMPLET.pas)[number]): ChapeletEnCours => ({
    jour: '2026-10-05',
    serie: 'joyeux',
    dizaine: pas.dizaine,
    priere: pas.priere,
    rang: pas.rang,
  })

  it('reprend exactement au même pas, à chaque pas du chapelet', () => {
    COMPLET.pas.forEach((pas, i) => expect(retrouver(COMPLET, repere(pas))).toBe(i))
  })

  it('suit la même prière quand les réglages ont changé entre-temps', () => {
    const sansAnnonce = derouler(CHAPELET_MARIAL, { annonce: false })
    const i = retrouver(sansAnnonce, repere(COMPLET.pas[AVE_3_4]))
    expect(sansAnnonce.pas[i]).toMatchObject({ dizaine: 3, priere: 'je-vous-salue-marie', rang: 4 })
  })

  it('une prière retirée entre-temps cède la place au début de sa dizaine', () => {
    const annonce = COMPLET.pas.find((p) => p.dizaine === 2 && p.priere === 'annonce')!
    const sansAnnonce = derouler(CHAPELET_MARIAL, { annonce: false })
    const i = retrouver(sansAnnonce, repere(annonce))
    expect(sansAnnonce.pas[i]).toMatchObject({ dizaine: 2, priere: 'notre-pere' })
  })

  it('un Salve Regina retiré entre-temps mène à la fin du chapelet', () => {
    const sansSalve = derouler(CHAPELET_MARIAL, { salveRegina: false })
    expect(retrouver(sansSalve, repere(COMPLET.pas.at(-1)!))).toBe(sansSalve.pas.length)
  })
})

describe('libellé du bouton de reprise', () => {
  it('nomme la dizaine, ou le chapelet hors des dizaines', () => {
    const libelle = (pas: (typeof COMPLET.pas)[number]) =>
      libelleReprise({ jour: '2026-10-05', serie: 'joyeux', ...pas })
    expect(libelle(COMPLET.pas[AVE_3_4])).toBe('Reprendre à la 3e dizaine')
    expect(libelle(COMPLET.pas.find((p) => p.dizaine === 1)!)).toBe('Reprendre à la 1re dizaine')
    expect(libelle(COMPLET.pas[2])).toBe('Reprendre le chapelet')
    expect(libelle(COMPLET.pas.at(-1)!)).toBe('Reprendre le chapelet')
  })
})
