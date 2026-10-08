import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lireOffice } from '../aelf/office'
import { CONSIGNES } from '../recueil/office'
import type { Bloc, NomOffice, Office } from './modele'
import { invitatoireDe, reconstituer } from './rubriques'
import { texteDe } from './textes'

const aelf = (nom: NomOffice, date: string) =>
  lireOffice(nom, date, JSON.parse(readFileSync(`src/aelf/exemples/${nom}-${date}.json`, 'utf8')))

const complet = (nom: NomOffice, date: string, consignes: boolean, premier = false) =>
  reconstituer(aelf(nom, date), {
    premier,
    plusieurs: false,
    consignes,
    invitatoire: nom === 'laudes' ? undefined : invitatoireDe(aelf('laudes', date)),
  })

// Les espaces insécables de la frontière AELF deviennent des espaces ordinaires.
const texte = (bloc: Bloc) => texteDe(bloc.strophes).replace(/[\u00a0\u202f]/g, ' ')
const intercession = (office: Office) => office.parties.find((p) => p.type === 'intercession')!
const consignes = (office: Office) =>
  office.parties.flatMap((p) => p.blocs.map((b) => b.rubrique).filter((r) => r !== undefined))

describe('R12 : le répons de l’intercession, redit après chaque intention', () => {
  it('aux laudes : invitation, répons, puis chaque intention suivie du répons', () => {
    const blocs = intercession(complet('laudes', '2026-10-06', false)).blocs
    expect(blocs.map(texte)).toEqual([
      'Au matin de ce nouveau jour, prions le Christ Seigneur :',
      'R/Exauce-nous, Seigneur.',
      'Jésus Christ, Premier-né avant toute créature, éveille nos sens à la beauté de ton œuvre.',
      'R/Exauce-nous, Seigneur.',
      'Jésus Christ, Lumière qui se lève sur le monde, découvre à notre esprit tes volontés.',
      'R/Exauce-nous, Seigneur.',
      'Jésus Christ, Fils bien-aimé du Père, inspire-nous l’amour filial et fraternel.',
      'R/Exauce-nous, Seigneur.',
      'Jésus Christ, Source jaillissante de vie, féconde le travail de ce jour.',
      'R/Exauce-nous, Seigneur.',
      'Jésus Christ, Ami des pauvres et des petits, rends-nous attentifs à leur appel.',
      'R/Exauce-nous, Seigneur.',
    ])
    // Le premier répons est celui de l'AELF ; les suivants, des ajouts redits.
    expect(blocs[1]).not.toHaveProperty('ajoute')
    for (const bloc of blocs.slice(3).filter((_, i) => i % 2 === 0))
      expect(bloc).toMatchObject({ ajoute: true, reprise: true })
  })

  it('sans le tiret de la seconde moitié : celui qui mène lit l’intention en entier', () => {
    for (const [nom, date] of [
      ['laudes', '2026-10-06'],
      ['vepres', '2026-11-29'],
      ['laudes', '2027-05-13'],
    ] as const) {
      const lignes = intercession(complet(nom, date, false)).blocs.flatMap((b) => b.strophes.flat())
      expect(
        lignes.filter((l) => /^\s*—/.test(l[0]?.texte ?? '')),
        `${nom} ${date}`,
      ).toEqual([])
    }
  })

  it('aux vêpres de l’Avent, l’invitation est déjà une intention : le répons la suit', () => {
    const blocs = intercession(complet('vepres', '2026-11-29', false)).blocs
    expect(texte(blocs[1])).toBe('R/Viens et demeure avec nous !')
    expect(blocs.filter((b) => b.reprise)).toHaveLength(4)
  })
})

describe('R13 : les consignes pour débuter', () => {
  it('le premier office : invitatoire, première antienne reprise, intercession', () => {
    const laudes = complet('laudes', '2026-10-06', true, true)
    expect(consignes(laudes)).toEqual([
      CONSIGNES.invitatoire,
      CONSIGNES.antienne,
      CONSIGNES.intercession,
    ])
    const [, repetee] = laudes.parties.find((p) => p.type === 'invitatoire')!.blocs
    expect(repetee.rubrique).toBe(CONSIGNES.invitatoire)
    const repons = intercession(laudes).blocs[1]
    expect(repons.rubrique).toBe(CONSIGNES.intercession)
  })

  it('aux complies : le silence de l’examen, puis la seule antienne reprise', () => {
    expect(consignes(complet('complies', '2026-10-06', true))).toEqual([
      CONSIGNES.examen,
      CONSIGNES.antienne,
    ])
  })

  it('le réglage coupé, aucune consigne', () => {
    expect(consignes(complet('laudes', '2026-10-06', false, true))).toEqual([])
  })
})
