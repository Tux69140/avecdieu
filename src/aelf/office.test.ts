import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { OFFICES, type NomOffice, type Office } from '../office/modele'
import { lireJour, lireOffice } from './office'

// Réponses réelles de l'AELF, enregistrées le 2026-10-06 (zone france).
const exemple = (nom: string, date = '2026-10-06'): Record<string, unknown> =>
  JSON.parse(readFileSync(`src/aelf/exemples/${nom}-${date}.json`, 'utf8'))

const officeDe = (nom: NomOffice, date = '2026-10-06') => lireOffice(nom, date, exemple(nom, date))

const titres = (office: Office) =>
  office.parties.map((p) => (p.precision ? `${p.libelle} · ${p.precision}` : p.libelle))

const tousLesTextes = (office: Office) =>
  office.parties.flatMap((p) => [
    p.libelle,
    p.precision ?? '',
    p.titre ?? '',
    p.source ?? '',
    ...p.strophes.flat(2).map((s) => s.texte),
  ])

describe('lireOffice', () => {
  it('donne les laudes dans l’ordre de l’AELF, avec les libellés validés', () => {
    expect(titres(officeDe('laudes'))).toEqual([
      'Introduction',
      'Invitatoire',
      'Psaume 94',
      'Hymne · Soleil levant',
      'Antienne 1',
      'Psaume 84',
      'Antienne 2',
      'Cantique d’Isaïe (Is 26)',
      'Antienne 3',
      'Psaume 66',
      'Lecture brève · 1 Jn 4, 14-15',
      'Répons',
      'Antienne',
      'Cantique de Zacharie',
      'Intercession',
      'Notre Père',
      'Oraison',
    ])
  })

  it('donne l’office des lectures, lecture patristique et Te Deum compris', () => {
    const office = officeDe('lectures', '2026-10-04')
    expect(titres(office)).toContain('Verset')
    expect(titres(office)).toContain('Te Deum')
    const lecture = office.parties.find((p) => p.libelle === 'Lecture')!
    expect(lecture.precision).toMatch(/\d/)
    expect(lecture.titre).toBeTruthy()
    const patristique = office.parties.find((p) => p.libelle === 'Lecture patristique')!
    expect(patristique.titre).toBeTruthy()
    expect(patristique.strophes.length).toBeGreaterThan(0)
  })

  it('omet les parties vides : complies à un seul psaume, antienne non numérotée', () => {
    expect(titres(officeDe('complies'))).toEqual([
      'Introduction',
      'Hymne · Vienne la nuit de Dieu',
      'Antienne',
      'Psaume 142',
      'Lecture brève · 1 P 5, 8-9a',
      'Répons',
      'Antienne',
      'Cantique de Syméon',
      'Oraison',
      'Bénédiction',
      'Antienne mariale',
    ])
    const mariale = officeDe('complies').parties.at(-1)!
    expect(mariale.titre).toBe('Heureuse es-tu, Vierge Marie !')
  })

  it('garde le numéro d’une antienne quand la précédente manque', () => {
    expect(titres(officeDe('tierce')).slice(2, 7)).toEqual([
      'Antienne 1',
      'Psaume 118-13',
      'Antienne 2',
      'Psaume 73 - I',
      'Psaume 73 - II',
    ])
  })

  it('donne l’auteur et l’éditeur de l’hymne', () => {
    const hymne = officeDe('laudes').parties.find((p) => p.type === 'hymne')!
    expect(hymne.source).toBe('D. Rimaud · CNPL')
  })

  it('ne répète pas « Notre Père » sous son propre titre', () => {
    const notrePere = officeDe('laudes').parties.find((p) => p.type === 'notre-pere')!
    expect(notrePere.strophes).toEqual([])
  })

  it.each(OFFICES)('%s : du texte seulement, sans balise ni entité HTML', (nom) => {
    const office = officeDe(nom)
    expect(office.parties.length).toBeGreaterThan(5)
    for (const texte of tousLesTextes(office)) {
      expect(texte).not.toMatch(/<|>|&[a-z]+;|&#\d+;/i)
    }
  })

  it.each(OFFICES)('%s : versets, V/ R/ et médiantes repérés', (nom) => {
    const signes = new Set(
      officeDe(nom).parties.flatMap((p) => p.strophes.flat(2).map((s) => s.signe)),
    )
    expect(signes).toContain('V')
    expect(signes).toContain('mediante')
    expect(signes).toContain('accent')
  })

  it('retire le point final d’une référence de psaume ou de cantique', () => {
    const office = lireOffice('vepres', '2026-08-15', {
      vepres: {
        psaume_1: { reference: '14.', texte: 'a' },
        psaume_2: { reference: 'CANTIQUE (Ep 1).', texte: 'b' },
      },
    })
    expect(titres(office)).toEqual(['Psaume 14', 'Cantique (Ep 1)'])
  })

  it('donne à une clé inconnue un libellé lisible plutôt que de la perdre', () => {
    const office = lireOffice('laudes', '2026-10-06', {
      laudes: { cantique_nouveau: '<p>Texte</p>' },
      informations: {},
    })
    expect(office.parties).toEqual([
      expect.objectContaining({ type: 'autre', libelle: 'Cantique nouveau' }),
    ])
  })

  it('refuse une réponse sans l’office demandé', () => {
    expect(() => lireOffice('laudes', '2026-10-06', { vepres: {} })).toThrow()
    expect(() => lireOffice('laudes', '2026-10-06', null)).toThrow()
  })
})

describe('lireJour', () => {
  it('donne la couleur du jour puis celles des mémoires possibles', () => {
    const jour = lireJour(exemple('laudes').informations)
    expect(jour).toEqual({
      date: '2026-10-06',
      zone: 'romain',
      temps: 'ordinaire',
      semaine: '27ème Semaine du Temps Ordinaire',
      fete: 'S. Bruno, prêtre',
      rang: 'Mémoire facultative',
      couleurs: ['vert', 'blanc'],
    })
  })

  it('ignore une couleur inconnue', () => {
    expect(lireJour({ date: '2026-10-06', zone: 'france', couleur: 'or' }).couleurs).toEqual([])
  })
})
