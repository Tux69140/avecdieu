import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lireJour } from '../aelf/office'
import { presenterJour } from './bandeau'

// Réponses réelles de l'AELF (src/aelf/exemples/informations-*.json).
const jour = (date: string) =>
  lireJour(
    JSON.parse(readFileSync(`src/aelf/exemples/informations-${date}.json`, 'utf8')).informations,
  )

describe('presenterJour', () => {
  it.each([
    // Férie avec un saint : le saint en titre, la semaine au-dessus.
    ['2026-10-06', '27e semaine du temps ordinaire', 'S. Bruno, prêtre'],
    ['2026-10-07', '27e semaine du temps ordinaire', 'Bienheureuse Vierge Marie du Rosaire'],
    ['2027-02-17', '1re semaine de Carême', 'Les sept saints fondateurs des Servîtes de Marie'],
    ['2026-12-29', '5e jour dans l’octave de Noël', 'S. Thomas Becket, évêque, martyr'],
    // Le titre dit déjà le jour : pas de ligne du temps.
    ['2026-10-10', undefined, '27e semaine du temps ordinaire'],
    ['2026-10-11', undefined, '28e dimanche du temps ordinaire'],
    ['2026-11-29', undefined, '1er dimanche de l’Avent'],
    ['2026-11-01', undefined, 'Tous les Saints'],
    ['2026-11-22', undefined, 'Notre Seigneur Jésus Christ Roi de l’Univers'],
    ['2026-12-25', undefined, 'Nativité du Seigneur'],
    ['2026-11-02', undefined, 'Commémoration de tous les fidèles défunts'],
    ['2027-02-10', undefined, 'Mercredi des Cendres'],
    ['2027-03-28', undefined, 'Résurrection du Seigneur'],
    ['2027-03-29', undefined, 'Lundi dans l’octave de Pâques'],
    ['2027-05-16', undefined, 'Pentecôte'],
  ])('%s : « %s » puis « %s »', (date, temps, titre) => {
    expect(presenterJour(jour(date))).toEqual({ temps, titre, couleur: expect.any(String) })
  })

  it('donne la seule couleur du jour, pas celle des mémoires possibles', () => {
    expect(presenterJour(jour('2026-10-06')).couleur).toBe('vert')
    expect(presenterJour(jour('2027-02-17')).couleur).toBe('violet')
    expect(presenterJour(jour('2026-12-25')).couleur).toBe('blanc')
  })

  it('reste lisible quand l’AELF ne dit presque rien', () => {
    expect(presenterJour({ date: '2026-10-06', zone: 'france', couleurs: [] })).toEqual({
      temps: undefined,
      titre: undefined,
      couleur: undefined,
    })
  })
})
