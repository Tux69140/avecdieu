import { beforeEach, describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL, ROSAIRE } from './definition'
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
      forme: 'chapelet',
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
    forme: 'chapelet',
    serie: 'joyeux',
    dizaine: pas.dizaine,
    priere: pas.priere,
    rang: pas.rang,
    fin: pas.fin,
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

  it('un texte de la clôture retiré entre-temps cède la place au suivant, ou à la fin', () => {
    const dans = (priere: string) => COMPLET.pas.find((p) => p.priere === priere)!
    const sansSalve = derouler(CHAPELET_MARIAL, { salveRegina: false })
    expect(sansSalve.pas[retrouver(sansSalve, repere(dans('salve-regina')))].priere).toBe(
      'litanies',
    )
    const sansLitanies = derouler(CHAPELET_MARIAL, { litanies: false, oraisonRosaire: false })
    expect(sansLitanies.pas[retrouver(sansLitanies, repere(dans('litanies')))].priere).toBe(
      'sous-l-abri',
    )
    const sansJoseph = derouler(CHAPELET_MARIAL, { saintJoseph: false })
    expect(retrouver(sansJoseph, repere(dans('saint-joseph')))).toBe(sansJoseph.pas.length)
  })
})

describe('libellé du bouton de reprise', () => {
  it('nomme la dizaine, ou le chapelet hors des dizaines', () => {
    const libelle = (pas: (typeof COMPLET.pas)[number]) =>
      libelleReprise({ jour: '2026-10-05', forme: 'chapelet', ...pas, serie: 'joyeux' })
    expect(libelle(COMPLET.pas[AVE_3_4])).toBe('Reprendre à la 3e dizaine')
    expect(libelle(COMPLET.pas.find((p) => p.dizaine === 1)!)).toBe('Reprendre à la 1re dizaine')
    expect(libelle(COMPLET.pas[2])).toBe('Reprendre le chapelet')
    expect(libelle(COMPLET.pas.at(-1)!)).toBe('Reprendre le chapelet')
  })
})

// Phase 17 : le Rosaire en cours retient aussi sa forme et la série atteinte.
const ROSAIRE_COMPLET = derouler(ROSAIRE)
// 2e série (lumineux), 3e dizaine, 4e Je vous salue Marie.
const ROSAIRE_2_3_4 = ROSAIRE_COMPLET.pas.findIndex(
  (p) =>
    p.serie === 'lumineux' && p.dizaine === 3 && p.priere === 'je-vous-salue-marie' && p.rang === 4,
)

describe('Rosaire en cours', () => {
  it('retient la forme et la série atteinte, le jour même', () => {
    retenirEnCours(LUNDI, 'joyeux', ROSAIRE_COMPLET.pas[ROSAIRE_2_3_4], 'rosaire')
    expect(lireEnCours(LUNDI_SOIR, 'rosaire')).toEqual({
      jour: '2026-10-05',
      forme: 'rosaire',
      serie: 'lumineux',
      dizaine: 3,
      priere: 'je-vous-salue-marie',
      rang: 4,
    })
  })

  it('est abandonné passé minuit', () => {
    retenirEnCours(LUNDI, 'joyeux', ROSAIRE_COMPLET.pas[ROSAIRE_2_3_4], 'rosaire')
    expect(lireEnCours(MARDI, 'rosaire')).toBeNull()
  })

  it('ne se confond pas avec un chapelet en cours : chacun garde le sien', () => {
    retenirEnCours(LUNDI, 'joyeux', ROSAIRE_COMPLET.pas[ROSAIRE_2_3_4], 'rosaire')
    expect(lireEnCours(LUNDI)).toBeNull()
    retenirEnCours(LUNDI, 'douloureux', COMPLET.pas[AVE_3_4])
    expect(lireEnCours(LUNDI)).toMatchObject({ forme: 'chapelet', serie: 'douloureux' })
    expect(lireEnCours(LUNDI, 'rosaire')).toMatchObject({ forme: 'rosaire', serie: 'lumineux' })
    effacerEnCours()
    expect(lireEnCours(LUNDI)).toBeNull()
    expect(lireEnCours(LUNDI, 'rosaire')).not.toBeNull()
    effacerEnCours('rosaire')
    expect(lireEnCours(LUNDI, 'rosaire')).toBeNull()
  })

  it('reprend exactement au même pas, à chaque pas du Rosaire', () => {
    ROSAIRE_COMPLET.pas.forEach((pas, i) => {
      retenirEnCours(LUNDI, 'joyeux', pas, 'rosaire')
      expect(retrouver(ROSAIRE_COMPLET, lireEnCours(LUNDI, 'rosaire')!), `pas ${i}`).toBe(i)
    })
  })

  it('une annonce retirée entre-temps cède la place au début de la même dizaine, dans la même série', () => {
    const annonce = ROSAIRE_COMPLET.pas.find(
      (p) => p.serie === 'douloureux' && p.dizaine === 2 && p.priere === 'annonce',
    )!
    retenirEnCours(LUNDI, 'joyeux', annonce, 'rosaire')
    const sansAnnonce = derouler(ROSAIRE, { annonce: false })
    const i = retrouver(sansAnnonce, lireEnCours(LUNDI, 'rosaire')!)
    expect(sansAnnonce.pas[i]).toMatchObject({
      serie: 'douloureux',
      dizaine: 2,
      priere: 'notre-pere',
    })
  })

  it('le bouton dit la série et la dizaine où l’on reprend', () => {
    const libelle = (pas: (typeof ROSAIRE_COMPLET.pas)[number], serie = 'glorieux' as const) => {
      retenirEnCours(LUNDI, serie, pas, 'rosaire')
      return libelleReprise(lireEnCours(LUNDI, 'rosaire')!)
    }
    expect(libelle(ROSAIRE_COMPLET.pas[ROSAIRE_2_3_4])).toBe('Reprendre à la 2e série, 3e dizaine')
    expect(libelle(ROSAIRE_COMPLET.pas.find((p) => p.dizaine === 1)!)).toBe(
      'Reprendre à la 1re série, 1re dizaine',
    )
    expect(libelle(ROSAIRE_COMPLET.pas[2])).toBe('Reprendre le Rosaire')
    expect(libelle(ROSAIRE_COMPLET.pas.at(-1)!)).toBe('Reprendre le Rosaire')
  })
})

// Phase 18 : la prière aux intentions du Saint-Père redit le Notre Père, le
// Je vous salue Marie et le Gloire au Père de l'ouverture ; la fin est retenue.
describe('reprise dans la prière aux intentions du Saint-Père', () => {
  const fin = COMPLET.pas.findIndex((p) => p.fin)

  it('reprend sur son Notre Père, pas sur celui de l’ouverture', () => {
    retenirEnCours(LUNDI, 'joyeux', COMPLET.pas[fin])
    const enCours = lireEnCours(LUNDI)!
    expect(enCours).toMatchObject({ priere: 'notre-pere', fin: true })
    expect(retrouver(COMPLET, enCours)).toBe(fin)
  })

  it('retirée entre-temps, cède la place au Salve Regina', () => {
    retenirEnCours(LUNDI, 'joyeux', COMPLET.pas[fin + 1])
    const sans = derouler(CHAPELET_MARIAL, { saintPere: false })
    expect(sans.pas[retrouver(sans, lireEnCours(LUNDI)!)].priere).toBe('salve-regina')
  })

  it('un Salve Regina retenu avant la phase 18 reste dans la fin', () => {
    localStorage.setItem(
      'avec-dieu.en-cours',
      '{"jour":"2026-10-05","serie":"joyeux","priere":"salve-regina","rang":1}',
    )
    const i = retrouver(COMPLET, lireEnCours(LUNDI)!)
    expect(COMPLET.pas[i]).toMatchObject({ priere: 'salve-regina', fin: true })
  })

  it('« L’essentiel seulement » activé entre-temps : la fin retirée mène à la fin', () => {
    retenirEnCours(LUNDI, 'joyeux', COMPLET.pas[fin])
    const essentiel = derouler(CHAPELET_MARIAL, { essentiel: true })
    expect(retrouver(essentiel, lireEnCours(LUNDI)!)).toBe(essentiel.pas.length)
  })
})
