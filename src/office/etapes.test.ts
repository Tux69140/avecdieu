import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lireOffice } from '../aelf/office'
import { estNomOffice, type NomOffice, type Partie } from './modele'
import { decrirePerles, etapesDe } from './etapes'
import { invitatoireDe, reconstituer } from './rubriques'

// Les offices de référence (src/aelf/exemples/), reconstitués comme à l'écran.
const DOSSIER = 'src/aelf/exemples'
const lire = (nom: NomOffice, date: string) =>
  lireOffice(nom, date, JSON.parse(readFileSync(`${DOSSIER}/${nom}-${date}.json`, 'utf8')))

function office(nom: NomOffice, date: string, premier = false) {
  const lu = lire(nom, date)
  const laudes =
    nom === 'laudes' ? lu : existsSync(`${DOSSIER}/laudes-${date}.json`) && lire('laudes', date)
  const invitatoire = laudes ? invitatoireDe(laudes) : undefined
  return reconstituer(lu, { premier, plusieurs: false, invitatoire })
}

const vues = (parties: Partie[]) =>
  etapesDe(parties).map((e) => (e.precision ? `${e.libelle} · ${e.precision}` : e.libelle))

describe('étapes d’un office', () => {
  it('les laudes, premier office du jour : 13 étapes, l’antienne avec son psaume', () => {
    expect(vues(office('laudes', '2026-10-06', true).parties)).toEqual([
      'Introduction',
      'Invitatoire',
      'Hymne · Soleil levant',
      'Psaume 84',
      'Cantique d’Isaïe (Is 26)',
      'Psaume 66',
      'Lecture brève · 1 Jn 4, 14-15',
      'Répons',
      'Cantique de Zacharie',
      'Intercession',
      'Notre Père',
      'Oraison',
      'Bénédiction',
    ])
  })

  it('une étape commence à son antienne, et l’invitatoire emporte son psaume', () => {
    const parties = office('laudes', '2026-10-06', true).parties
    const etapes = etapesDe(parties)
    const debut = (libelle: string) => parties[etapes.find((e) => e.libelle === libelle)!.debut]
    expect(debut('Psaume 84').libelle).toBe('Antienne 1')
    expect(debut('Cantique de Zacharie').libelle).toBe('Antienne')
    expect(debut('Invitatoire').libelle).toBe('Invitatoire')
    expect(debut('Hymne').libelle).toBe('Hymne')
  })

  it('un psaume en plusieurs morceaux garde une étape par morceau', () => {
    expect(vues(office('tierce', '2026-10-06').parties)).toEqual([
      'Introduction',
      'Hymne · Flamme jaillie d’auprès de Dieu',
      'Psaume 118-13',
      'Psaume 73 - I',
      'Psaume 73 - II',
      'Lecture brève · Jr 22, 3',
      'Répons',
      'Oraison',
      'Conclusion',
    ])
  })

  it('l’office des lectures : chaque lecture et chaque répons à part', () => {
    expect(vues(office('lectures', '2026-10-06').parties)).toEqual([
      'Introduction',
      'Hymne · Un chant rassemble dans la nuit',
      'Psaume 67 - I',
      'Psaume 67 - II',
      'Psaume 67 - III',
      'Verset',
      'Lecture · 1Tm 3, 1-16',
      'Répons',
      'Lecture patristique',
      'Répons',
      'Oraison',
      'Conclusion',
    ])
  })

  it('dans tous les offices de référence, chaque partie appartient à une étape, dans l’ordre', () => {
    for (const fichier of readdirSync(DOSSIER)) {
      const [nom, ...date] = fichier.replace('.json', '').split('-')
      if (!estNomOffice(nom)) continue
      for (const premier of [true, false]) {
        const parties = office(nom, date.join('-'), premier).parties
        const debuts = etapesDe(parties).map((e) => e.debut)
        expect(debuts[0], fichier).toBe(0)
        // Strictement croissants : aucune étape vide.
        debuts.slice(1).forEach((d, i) => expect(d, fichier).toBeGreaterThan(debuts[i]))
        expect(debuts.at(-1)!, fichier).toBeLessThan(parties.length)
      }
    }
  })

  it('une antienne sans psaume après elle reste une étape', () => {
    const antienne: Partie = { type: 'antienne', libelle: 'Antienne', blocs: [], ajoutee: false }
    expect(vues([antienne])).toEqual(['Antienne'])
  })
})

describe('decrirePerles', () => {
  it('dit l’étape en cours et sa place, puis ce que fait le toucher', () => {
    const etapes = [
      { libelle: 'Introduction', debut: 0 },
      { libelle: 'Psaume 62', debut: 1 },
    ]
    expect(decrirePerles(etapes, 1)).toBe('Psaume 62, étape 2 sur 2. Ouvrir le sommaire')
  })
})
