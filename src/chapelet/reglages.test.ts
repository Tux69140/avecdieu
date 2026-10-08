import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lireReglages, modifierReglages, optionsDuDeroule, REGLAGES_PAR_DEFAUT } from './reglages'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('réglages du chapelet', () => {
  it('par défaut : ceux du PRD, prière seul et vibrations actives', () => {
    expect(lireReglages()).toEqual({
      annonce: true,
      oMonJesus: true,
      intentions: true,
      salveRegina: true,
      litanies: 'octobre',
      oraisonRosaire: true,
      sousLAbri: false,
      saintJoseph: 'octobre',
      plusieurs: false,
      affichage: 'complet',
      vibrations: true,
      accents: true,
      prieresEntieres: false,
      signalerAjouts: true,
      consignes: true,
      zone: 'france',
      tailleTexte: 18,
      theme: 'automatique',
    })
    expect(REGLAGES_PAR_DEFAUT).toEqual(lireReglages())
  })

  it('retiennent les accents de psalmodie masqués', () => {
    modifierReglages({ accents: false })
    expect(lireReglages().accents).toBe(false)
  })

  it('retiennent les prières courantes en entier et les ajouts non signalés', () => {
    modifierReglages({ prieresEntieres: true, signalerAjouts: false })
    expect(lireReglages()).toMatchObject({ prieresEntieres: true, signalerAjouts: false })
  })

  it('retiennent chaque changement sans toucher aux autres', () => {
    modifierReglages({ salveRegina: false })
    modifierReglages({ affichage: 'compact', vibrations: false })
    expect(lireReglages()).toEqual({
      ...REGLAGES_PAR_DEFAUT,
      salveRegina: false,
      affichage: 'compact',
      vibrations: false,
    })
  })

  it('reprennent l’affichage choisi avant les réglages (phase 3)', () => {
    localStorage.setItem('avec-dieu.affichage', 'compact')
    expect(lireReglages().affichage).toBe('compact')
    modifierReglages({ vibrations: false })
    localStorage.removeItem('avec-dieu.affichage')
    expect(lireReglages().affichage).toBe('compact')
  })

  it('ignorent une mémoire illisible ou des valeurs invalides', () => {
    localStorage.setItem('avec-dieu.reglages', 'pas du json')
    expect(lireReglages()).toEqual(REGLAGES_PAR_DEFAUT)
    localStorage.setItem(
      'avec-dieu.reglages',
      JSON.stringify({ annonce: 'non', affichage: 'grand', vibrations: false }),
    )
    expect(lireReglages()).toEqual({ ...REGLAGES_PAR_DEFAUT, vibrations: false })
  })

  it('retiennent la zone, la taille du texte et le thème (phase 10)', () => {
    modifierReglages({ zone: 'belgique', tailleTexte: 22, theme: 'nuit' })
    expect(lireReglages()).toMatchObject({ zone: 'belgique', tailleTexte: 22, theme: 'nuit' })
  })

  it('ignorent une zone, une taille ou un thème inconnus', () => {
    localStorage.setItem(
      'avec-dieu.reglages',
      JSON.stringify({ zone: 'mars', tailleTexte: 19, theme: 'rose' }),
    )
    expect(lireReglages()).toEqual(REGLAGES_PAR_DEFAUT)
    localStorage.setItem('avec-dieu.reglages', JSON.stringify({ tailleTexte: '20' }))
    expect(lireReglages().tailleTexte).toBe(18)
  })

  it('n’interrompent jamais la prière si la mémoire est bloquée', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage bloqué')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('stockage bloqué')
    })
    expect(lireReglages()).toEqual(REGLAGES_PAR_DEFAUT)
    expect(() => modifierReglages({ vibrations: false })).not.toThrow()
  })
})

describe('réglages de la clôture (phase 16)', () => {
  // Réglages enregistrés avant la phase 16 : les nouveaux textes prennent
  // leurs valeurs de départ, les anciens choix sont gardés.
  it('des réglages anciens se lisent encore, complétés par les valeurs de départ', () => {
    localStorage.setItem(
      'avec-dieu.reglages',
      JSON.stringify({ annonce: false, oMonJesus: true, salveRegina: false, plusieurs: true }),
    )
    expect(lireReglages()).toEqual({
      ...REGLAGES_PAR_DEFAUT,
      annonce: false,
      salveRegina: false,
      plusieurs: true,
    })
  })

  it('retiennent chaque texte de la clôture', () => {
    modifierReglages({
      intentions: false,
      litanies: 'toujours',
      oraisonRosaire: false,
      sousLAbri: true,
      saintJoseph: 'jamais',
    })
    expect(lireReglages()).toMatchObject({
      intentions: false,
      litanies: 'toujours',
      oraisonRosaire: false,
      sousLAbri: true,
      saintJoseph: 'jamais',
    })
  })

  it('ignorent un choix inconnu pour les Litanies ou saint Joseph', () => {
    localStorage.setItem(
      'avec-dieu.reglages',
      JSON.stringify({ litanies: 'parfois', saintJoseph: true, sousLAbri: 'oui' }),
    )
    expect(lireReglages()).toEqual(REGLAGES_PAR_DEFAUT)
  })
})

const LUNDI_5_OCTOBRE = new Date(2026, 9, 5, 20, 0)

describe('options du déroulé selon les réglages', () => {
  it('l’annonce n’a d’écran à part qu’en texte complet', () => {
    expect(optionsDuDeroule(REGLAGES_PAR_DEFAUT, LUNDI_5_OCTOBRE)).toEqual({
      annonce: true,
      oMonJesus: true,
      intentions: true,
      salveRegina: true,
      litanies: true,
      oraisonRosaire: true,
      sousLAbri: false,
      saintJoseph: true,
    })
    const options = (r: Partial<typeof REGLAGES_PAR_DEFAUT>) =>
      optionsDuDeroule({ ...REGLAGES_PAR_DEFAUT, ...r }, LUNDI_5_OCTOBRE)
    expect(options({ affichage: 'compact' }).annonce).toBe(false)
    expect(options({ annonce: false }).annonce).toBe(false)
  })

  it('le « Ô mon Jésus », les intentions et les textes de la clôture suivent leurs réglages', () => {
    expect(
      optionsDuDeroule(
        {
          ...REGLAGES_PAR_DEFAUT,
          oMonJesus: false,
          intentions: false,
          salveRegina: false,
          oraisonRosaire: false,
          sousLAbri: true,
        },
        LUNDI_5_OCTOBRE,
      ),
    ).toMatchObject({
      oMonJesus: false,
      intentions: false,
      salveRegina: false,
      oraisonRosaire: false,
      sousLAbri: true,
    })
  })

  // Critère de succès 10 : avec les réglages de départ, Litanies et saint
  // Joseph du 1er au 31 octobre, absents le reste de l'année.
  const JOURS: [string, Date, boolean][] = [
    ['30 septembre', new Date(2026, 8, 30, 23, 59), false],
    ['1er octobre', new Date(2026, 9, 1, 0, 0), true],
    ['31 octobre', new Date(2026, 9, 31, 23, 59), true],
    ['1er novembre', new Date(2026, 10, 1, 0, 0), false],
    ['15 mars', new Date(2027, 2, 15, 12, 0), false],
  ]
  for (const [nom, date, dits] of JOURS) {
    it(`« En octobre », le ${nom} : ${dits ? 'dits' : 'absents'}`, () => {
      expect(optionsDuDeroule(REGLAGES_PAR_DEFAUT, date)).toMatchObject({
        litanies: dits,
        saintJoseph: dits,
      })
    })
    it(`« Toujours » et « Jamais » l’emportent sur le mois, le ${nom}`, () => {
      const reglages = {
        ...REGLAGES_PAR_DEFAUT,
        litanies: 'toujours',
        saintJoseph: 'jamais',
      } as const
      expect(optionsDuDeroule(reglages, date)).toMatchObject({ litanies: true, saintJoseph: false })
      const inverses = {
        ...REGLAGES_PAR_DEFAUT,
        litanies: 'jamais',
        saintJoseph: 'toujours',
      } as const
      expect(optionsDuDeroule(inverses, date)).toMatchObject({ litanies: false, saintJoseph: true })
    })
  }
})
