import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lireJour } from '../aelf/office'
import { presenterJour, saintDuJour } from './bandeau'

// Réponses réelles de l'AELF (src/aelf/exemples/informations-*.json).
const jour = (date: string) =>
  lireJour(
    JSON.parse(readFileSync(`src/aelf/exemples/informations-${date}.json`, 'utf8')).informations,
  )

describe('presenterJour', () => {
  it.each([
    // Le rang du jour toujours dans la petite ligne ; en gros, la fête ou le
    // saint seul, sans ses qualités ni son rang (validé le 2026-10-08).
    ['2026-10-06', '27e semaine du temps ordinaire', 'S. Bruno'],
    ['2026-10-07', '27e semaine du temps ordinaire', 'Bienheureuse Vierge Marie du Rosaire'],
    ['2027-02-17', '1re semaine de Carême', 'Les sept saints fondateurs des Servîtes de Marie'],
    ['2026-12-29', '5e jour dans l’octave de Noël', 'S. Thomas Becket'],
    // Un jour sans fête ni saint : rien en gros.
    ['2026-10-10', '27e semaine du temps ordinaire', undefined],
    ['2026-10-11', '28e dimanche du temps ordinaire', undefined],
    ['2026-11-29', '1er dimanche de l’Avent', undefined],
    ['2027-03-29', 'Lundi dans l’octave de Pâques', undefined],
    // La fête est le jour lui-même : en gros, sans petite ligne.
    ['2026-11-01', undefined, 'Tous les Saints'],
    ['2026-11-22', undefined, 'Notre Seigneur Jésus Christ Roi de l’Univers'],
    ['2026-12-25', undefined, 'Nativité du Seigneur'],
    ['2026-11-02', undefined, 'Commémoration de tous les fidèles défunts'],
    ['2027-02-10', undefined, 'Mercredi des Cendres'],
    ['2027-03-28', undefined, 'Résurrection du Seigneur'],
    ['2027-05-16', undefined, 'Pentecôte'],
  ])('%s : « %s » puis « %s »', (date, temps, titre) => {
    expect(presenterJour(jour(date))).toEqual({ temps, titre, couleur: expect.any(String) })
  })

  // Des saints tels que l'AELF les écrit, jours sans exemple enregistré.
  it.each([
    ['S. Denis, évêque, et ses compagnons, martyrs. Mémoire facultative', 'S. Denis'],
    [
      "Ste Thérèse de Jésus [d'Avila], vierge et docteur de l'Eglise",
      'Ste Thérèse de Jésus (d’Avila)',
    ],
    ['Saints Michel, Gabriel et Raphaël, archanges', 'Saints Michel, Gabriel et Raphaël'],
    ['S. Pierre et S. Paul, apôtres', 'S. Pierre et S. Paul'],
    ['Ste Faustine Kowalska, vierge', 'Ste Faustine Kowalska'],
    // « Mère », « Reine » sont des titres de Marie, pas des qualités à retirer.
    ['Ste Marie, Mère de Dieu', 'Ste Marie, Mère de Dieu'],
    ['La Vierge Marie, Reine', 'La Vierge Marie, Reine'],
  ])('« %s » devient « %s »', (celebration, titre) => {
    const jour = {
      date: '2026-10-09',
      zone: 'france',
      couleurs: ['vert' as const],
      intitule: 'vendredi, 27ème Semaine du Temps Ordinaire (semaine III du Psautier)',
      celebration,
    }
    expect(presenterJour(jour)).toEqual({
      temps: '27e semaine du temps ordinaire',
      titre,
      couleur: 'vert',
    })
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

  // En tête de l'office, le saint seul ; rien un jour de fête, dont le texte
  // dit déjà le nom (choix du porteur du projet, 2026-10-08).
  it.each([
    ['2026-10-06', 'S. Bruno'],
    ['2026-10-07', 'Bienheureuse Vierge Marie du Rosaire'],
    ['2026-12-29', 'S. Thomas Becket'],
    ['2026-10-10', undefined],
    ['2026-10-11', undefined],
    ['2026-11-01', undefined],
    ['2026-11-22', undefined],
    ['2026-12-25', undefined],
  ])('%s : le saint du jour est « %s »', (date, saint) => {
    expect(saintDuJour(jour(date))).toBe(saint)
  })
})
