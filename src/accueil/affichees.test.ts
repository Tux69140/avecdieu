import { beforeEach, describe, expect, it } from 'vitest'
import { lireAffichees, modifierAffichee, PRIERES_AFFICHABLES } from './affichees'

beforeEach(() => localStorage.clear())

describe('prières affichées sur l’accueil (phase 19)', () => {
  it('dans l’ordre validé : Chapelet, Rosaire, puis la journée, chaque Angélus avant son office', () => {
    expect(PRIERES_AFFICHABLES).toEqual([
      'chapelet',
      'rosaire',
      'angelus-matin',
      'lectures',
      'laudes',
      'tierce',
      'angelus-midi',
      'sexte',
      'none',
      'angelus-soir',
      'vepres',
      'complies',
    ])
  })

  it('d’origine, toutes sont affichées', () => {
    const affichees = lireAffichees()
    for (const priere of PRIERES_AFFICHABLES) expect(affichees[priere]).toBe(true)
  })

  it('retient chaque prière masquée, sans toucher aux autres', () => {
    modifierAffichee('tierce', false)
    modifierAffichee('angelus-midi', false)
    const affichees = lireAffichees()
    expect(affichees.tierce).toBe(false)
    expect(affichees['angelus-midi']).toBe(false)
    expect(affichees.sexte).toBe(true)
    modifierAffichee('tierce', true)
    expect(lireAffichees().tierce).toBe(true)
  })

  it('ignore les valeurs illisibles', () => {
    localStorage.setItem('avec-dieu.accueil', JSON.stringify({ laudes: 'non', none: false }))
    const affichees = lireAffichees()
    expect(affichees.laudes).toBe(true)
    expect(affichees.none).toBe(false)
  })
})
