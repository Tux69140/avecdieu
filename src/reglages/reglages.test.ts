import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lireReglages, modifierReglages, REGLAGES_PAR_DEFAUT } from './reglages'

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
      saintPere: true,
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
      essentiel: false,
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

// Le choix Chapelet / Rosaire du seuil (phase 17) n'est plus un réglage :
// deux seuils distincts, ouverts de l'accueil ou du menu (révisé le
// 2026-10-09). Un choix enregistré avant est ignoré, puis oublié.
describe('l’ancien choix Chapelet ou Rosaire', () => {
  it('est ignoré, les autres réglages gardés', () => {
    localStorage.setItem(
      'avec-dieu.reglages',
      JSON.stringify({ forme: 'rosaire', affichage: 'compact', plusieurs: true }),
    )
    expect(lireReglages()).toEqual({
      ...REGLAGES_PAR_DEFAUT,
      affichage: 'compact',
      plusieurs: true,
    })
    expect(lireReglages()).not.toHaveProperty('forme')
  })

  it('disparaît au premier réglage modifié', () => {
    localStorage.setItem('avec-dieu.reglages', JSON.stringify({ forme: 'rosaire' }))
    modifierReglages({ vibrations: false })
    expect(JSON.parse(localStorage.getItem('avec-dieu.reglages')!)).not.toHaveProperty('forme')
  })
})

// Phase 18 : la prière aux intentions du Saint-Père, activée au départ, et
// « L’essentiel seulement », désactivé au départ, qui l'emporte sur les
// réglages fins sans les modifier.
describe('chapelet simplifié (phase 18)', () => {
  it('des réglages d’avant la phase 18 se lisent encore, complétés par les valeurs de départ', () => {
    localStorage.setItem(
      'avec-dieu.reglages',
      JSON.stringify({ oMonJesus: false, salveRegina: false }),
    )
    expect(lireReglages()).toMatchObject({
      oMonJesus: false,
      salveRegina: false,
      saintPere: true,
      essentiel: false,
    })
  })

  it('retiennent la prière aux intentions du Saint-Père et l’essentiel seulement', () => {
    modifierReglages({ saintPere: false })
    modifierReglages({ essentiel: true })
    expect(lireReglages()).toMatchObject({ saintPere: false, essentiel: true })
  })

  it('ignorent des valeurs qui ne sont pas oui ou non', () => {
    localStorage.setItem('avec-dieu.reglages', JSON.stringify({ saintPere: 0, essentiel: 'oui' }))
    expect(lireReglages()).toMatchObject({ saintPere: true, essentiel: false })
  })

  it('l’essentiel activé puis désactivé : les réglages fins sont retrouvés intacts', () => {
    const fins = {
      oMonJesus: false,
      intentions: false,
      saintPere: false,
      sousLAbri: true,
      litanies: 'toujours',
    } as const
    modifierReglages(fins)
    modifierReglages({ essentiel: true })
    expect(lireReglages()).toMatchObject(fins)
    modifierReglages({ essentiel: false })
    expect(lireReglages()).toMatchObject({ ...fins, essentiel: false })
  })
})
