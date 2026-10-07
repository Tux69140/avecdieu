import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  aucunRappelActif,
  lireDemandes,
  lireRappels,
  modifierRappel,
  noterDemande,
  RAPPELS_CHANGES,
  RAPPELS_PAR_DEFAUT,
} from './reglages'

beforeEach(() => localStorage.clear())

describe('réglages des rappels', () => {
  it('par défaut : app muette, heures du PRD, lectures sans heure', () => {
    const rappels = lireRappels()
    expect(aucunRappelActif(rappels)).toBe(true)
    expect(rappels.lectures.heure).toBeUndefined()
    expect(rappels.laudes.heure).toEqual({ heures: 7, minutes: 0 })
    expect(rappels.vepres.heure).toEqual({ heures: 18, minutes: 30 })
    expect(rappels.complies.heure).toEqual({ heures: 21, minutes: 30 })
    expect(rappels.chapelet.heure).toEqual({ heures: 20, minutes: 0 })
    expect(rappels).toEqual(RAPPELS_PAR_DEFAUT)
  })

  it('par défaut : une cloche selon l’heure, vibreur activé', () => {
    const cloches = Object.fromEntries(
      Object.entries(lireRappels()).map(([priere, r]) => [
        priere,
        r.son.sorte === 'cloche' && r.vibreur ? r.son.cloche : '?',
      ]),
    )
    expect(cloches).toEqual({
      lectures: 'cloche_marcel',
      laudes: 'cloche_marcel',
      tierce: 'angelus_village',
      sexte: 'angelus_village',
      none: 'angelus_village',
      vepres: 'bourdon_notre_dame',
      complies: 'bourdon_notre_dame',
      chapelet: 'angelus_village',
    })
  })

  it('retiennent un rappel activé, son heure, son son et son vibreur', () => {
    modifierRappel('laudes', { actif: true, heure: { heures: 6, minutes: 45 } })
    modifierRappel('chapelet', {
      son: { sorte: 'mp3', uri: 'content://media/42', nom: 'ave.mp3' },
      vibreur: false,
    })
    const rappels = lireRappels()
    expect(rappels.laudes).toMatchObject({ actif: true, heure: { heures: 6, minutes: 45 } })
    expect(rappels.chapelet.son).toEqual({
      sorte: 'mp3',
      uri: 'content://media/42',
      nom: 'ave.mp3',
    })
    expect(rappels.chapelet.vibreur).toBe(false)
    expect(aucunRappelActif(rappels)).toBe(false)
  })

  it('préviennent la page de chaque changement', () => {
    const ecoute = vi.fn()
    window.addEventListener(RAPPELS_CHANGES, ecoute)
    modifierRappel('vepres', { actif: true })
    window.removeEventListener(RAPPELS_CHANGES, ecoute)
    expect(ecoute).toHaveBeenCalledOnce()
  })

  it('ignorent une valeur enregistrée illisible', () => {
    localStorage.setItem(
      'avec-dieu.rappels',
      JSON.stringify({
        laudes: { actif: 'oui', heure: { heures: 25, minutes: 0 }, son: { sorte: 'cor' } },
        lectures: { actif: true },
      }),
    )
    const rappels = lireRappels()
    expect(rappels.laudes).toEqual(RAPPELS_PAR_DEFAUT.laudes)
    // Sans heure, l'office des lectures ne peut pas être rappelé.
    expect(rappels.lectures.actif).toBe(false)
  })

  it('retiennent ce qui a déjà été demandé, sans toucher aux rappels', () => {
    modifierRappel('laudes', { actif: true })
    expect(lireDemandes()).toEqual({ minute: false, batterie: false })
    noterDemande('minute')
    noterDemande('batterie')
    expect(lireDemandes()).toEqual({ minute: true, batterie: true })
    expect(lireRappels().laudes.actif).toBe(true)
  })
})
