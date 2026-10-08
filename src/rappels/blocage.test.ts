import { describe, expect, it } from 'vitest'
import { avisDesRappels, rappelsBloques, type EtatAndroid } from './blocage'
import { RAPPELS_PAR_DEFAUT, type Rappels } from './reglages'

const AUCUN: Rappels = RAPPELS_PAR_DEFAUT
const LAUDES: Rappels = {
  ...RAPPELS_PAR_DEFAUT,
  laudes: { ...RAPPELS_PAR_DEFAUT.laudes, actif: true },
}

// Un téléphone bien réglé, que chaque cas dérègle d'un point.
const telephone = (changement: Partial<EtatAndroid> = {}): EtatAndroid => ({
  accord: 'accorde',
  exacte: true,
  marque: 'autre',
  bloque: { batterie: false, arrierePlan: false },
  ...changement,
})

describe('avis des rappels', () => {
  it('téléphone bien réglé : aucun avis, rien de bloqué', () => {
    expect(avisDesRappels(LAUDES, telephone())).toEqual([])
    expect(rappelsBloques(LAUDES, telephone())).toBe(false)
  })

  it('notifications refusées : le seul avis, et les rappels bloqués', () => {
    const refuse = telephone({
      accord: 'refuse',
      exacte: false,
      bloque: { batterie: true, arrierePlan: true },
    })
    expect(avisDesRappels(LAUDES, refuse)).toEqual(['notifications'])
    expect(rappelsBloques(LAUDES, refuse)).toBe(true)
  })

  it('accord encore à demander : ni avis ni blocage', () => {
    const aDemander = telephone({
      accord: 'a-demander',
      bloque: { batterie: true, arrierePlan: true },
    })
    expect(avisDesRappels(LAUDES, aDemander)).toEqual([])
    expect(rappelsBloques(LAUDES, aDemander)).toBe(false)
  })

  it('« Alarmes et rappels » absente : un avis, mais un retard n’est pas un blocage', () => {
    const sansMinute = telephone({ exacte: false })
    expect(avisDesRappels(LAUDES, sansMinute)).toEqual(['minute'])
    expect(rappelsBloques(LAUDES, sansMinute)).toBe(false)
  })

  it('arrière-plan interdit, sur toute marque : bloqué', () => {
    const arrierePlan = telephone({ bloque: { batterie: false, arrierePlan: true } })
    expect(avisDesRappels(LAUDES, arrierePlan)).toEqual(['arrierePlan'])
    expect(rappelsBloques(LAUDES, arrierePlan)).toBe(true)
  })

  it('démarrage automatique coupé : bloqué sur un Xiaomi seulement', () => {
    const bloque = { batterie: false, arrierePlan: false, demarrage: true }
    expect(avisDesRappels(LAUDES, telephone({ marque: 'xiaomi', bloque }))).toEqual(['demarrage'])
    expect(rappelsBloques(LAUDES, telephone({ marque: 'xiaomi', bloque }))).toBe(true)
    expect(rappelsBloques(LAUDES, telephone({ marque: 'samsung', bloque }))).toBe(false)
  })

  it('économie de batterie : bloqué sur Xiaomi et Samsung, pas ailleurs', () => {
    const bloque = { batterie: true, arrierePlan: false }
    expect(rappelsBloques(LAUDES, telephone({ marque: 'xiaomi', bloque }))).toBe(true)
    expect(rappelsBloques(LAUDES, telephone({ marque: 'samsung', bloque }))).toBe(true)
    expect(avisDesRappels(LAUDES, telephone({ marque: 'autre', bloque }))).toEqual([])
    expect(rappelsBloques(LAUDES, telephone({ marque: 'autre', bloque }))).toBe(false)
  })

  it('tous les avis, dans l’ordre de la rubrique', () => {
    const tout = telephone({
      exacte: false,
      marque: 'xiaomi',
      bloque: { batterie: true, arrierePlan: true, demarrage: true },
    })
    expect(avisDesRappels(LAUDES, tout)).toEqual(['minute', 'arrierePlan', 'demarrage', 'batterie'])
  })

  it('aucun rappel activé : ni avis ni blocage, quoi que fasse le téléphone', () => {
    const refuse = telephone({ accord: 'refuse' })
    expect(avisDesRappels(AUCUN, refuse)).toEqual([])
    expect(rappelsBloques(AUCUN, refuse)).toBe(false)
  })

  it('le téléphone pas encore lu : rien de bloqué', () => {
    expect(avisDesRappels(LAUDES, undefined)).toEqual([])
    expect(rappelsBloques(LAUDES, undefined)).toBe(false)
  })
})
