import { describe, expect, it } from 'vitest'
import { canalDe, canauxNecessaires, officeDuMatin, programmer } from './programme'
import { RAPPELS_PAR_DEFAUT, type Priere, type Rappel, type Rappels } from './reglages'
import {
  ecrireHeureRappel,
  OUVERTURE_DES_HEURES,
  OUVERTURE_DU_CHAPELET,
  OUVERTURE_DU_JOUR,
  resumerRappels,
} from './textes'

const avec = (changements: Partial<Record<Priere, Partial<Rappel>>>): Rappels => {
  const rappels = structuredClone(RAPPELS_PAR_DEFAUT)
  for (const [priere, changement] of Object.entries(changements))
    rappels[priere as Priere] = { ...rappels[priere as Priere], ...changement }
  return rappels
}

// Mercredi 7 octobre 2026, 10 h.
const MAINTENANT = new Date(2026, 9, 7, 10, 0)

describe('premiers mots des notifications', () => {
  it('sont tirés du recueil validé', () => {
    expect(OUVERTURE_DU_JOUR).toBe('Seigneur, ouvre mes lèvres.')
    expect(OUVERTURE_DES_HEURES).toBe('Dieu, viens à mon aide.')
    expect(OUVERTURE_DU_CHAPELET).toBe('Je vous salue, Marie, pleine de grâce.')
  })
})

describe('programmation des rappels', () => {
  it('rien à programmer quand l’app est muette', () => {
    expect(programmer(RAPPELS_PAR_DEFAUT, MAINTENANT)).toEqual([])
  })

  it('un mois de laudes, à 7 h chaque jour, à partir de demain', () => {
    const prevues = programmer(avec({ laudes: { actif: true } }), MAINTENANT)
    expect(prevues).toHaveLength(30)
    expect(prevues[0]).toMatchObject({
      priere: 'laudes',
      date: '2026-10-08',
      titre: 'C’est l’heure des laudes',
      texte: 'Seigneur, ouvre mes lèvres.',
      route: '/office/laudes/2026-10-08',
      canal: 'rappel-cloche_marcel-vibreur',
    })
    expect(prevues[0].quand).toEqual(new Date(2026, 9, 8, 7, 0))
    expect(prevues.at(-1)!.date).toBe('2026-11-06')
  })

  it('aujourd’hui encore, si l’heure n’est pas passée', () => {
    const prevues = programmer(avec({ vepres: { actif: true } }), MAINTENANT)
    expect(prevues).toHaveLength(31)
    expect(prevues[0]).toMatchObject({ date: '2026-10-07', route: '/office/vepres/2026-10-07' })
  })

  it('garde l’heure locale au passage à l’heure d’hiver et d’été', () => {
    const automne = programmer(avec({ laudes: { actif: true } }), new Date(2026, 9, 20, 12))
    const printemps = programmer(avec({ complies: { actif: true } }), new Date(2027, 2, 20, 12))
    for (const n of [...automne, ...printemps]) {
      const heure = n.priere === 'laudes' ? [7, 0] : [21, 30]
      expect([n.quand.getHours(), n.quand.getMinutes()]).toEqual(heure)
      expect(n.date).toBe(
        `${n.quand.getFullYear()}-${String(n.quand.getMonth() + 1).padStart(2, '0')}-${String(n.quand.getDate()).padStart(2, '0')}`,
      )
    }
    expect(automne.map((n) => n.date)).toContain('2026-10-25')
    expect(printemps.map((n) => n.date)).toContain('2027-03-28')
  })

  it('des identifiants stables et uniques', () => {
    const tous = avec(
      Object.fromEntries(
        (['laudes', 'tierce', 'sexte', 'none', 'vepres', 'complies', 'chapelet'] as const).map(
          (p) => [p, { actif: true }],
        ),
      ),
    )
    tous.lectures = { ...tous.lectures, actif: true, heure: { heures: 6, minutes: 30 } }
    const prevues = programmer(tous, MAINTENANT)
    expect(new Set(prevues.map((n) => n.id)).size).toBe(prevues.length)
    expect(prevues.every((n) => Number.isInteger(n.id) && n.id > 0 && n.id < 2 ** 31)).toBe(true)
    expect(prevues.length).toBeLessThanOrEqual(8 * 31)
    // Recalculés une heure plus tard, les mêmes rappels gardent leur identifiant.
    const ensuite = programmer(tous, new Date(2026, 9, 7, 11, 0))
    const idDe = (liste: typeof prevues, route: string) => liste.find((n) => n.route === route)?.id
    expect(idDe(ensuite, '/office/complies/2026-10-20')).toBe(
      idDe(prevues, '/office/complies/2026-10-20'),
    )
    // Dans l'ordre du temps.
    const temps = prevues.map((n) => n.quand.getTime())
    expect(temps).toEqual([...temps].sort((a, b) => a - b))
  })

  it('titres et premiers mots de chaque prière', () => {
    const tous = avec({
      lectures: { actif: true, heure: { heures: 8, minutes: 0 } },
      laudes: { actif: true },
      tierce: { actif: true },
      sexte: { actif: true },
      none: { actif: true },
      vepres: { actif: true },
      complies: { actif: true },
      chapelet: { actif: true },
    })
    const jour = programmer(tous, new Date(2026, 9, 8, 0, 0)).filter((n) => n.date === '2026-10-08')
    expect(jour.map((n) => [n.titre, n.texte, n.route])).toEqual([
      ['C’est l’heure des laudes', 'Seigneur, ouvre mes lèvres.', '/office/laudes/2026-10-08'],
      [
        'C’est l’heure de l’office des lectures',
        'Dieu, viens à mon aide.',
        '/office/lectures/2026-10-08',
      ],
      ['C’est l’heure de tierce', 'Dieu, viens à mon aide.', '/office/tierce/2026-10-08'],
      ['C’est l’heure de sexte', 'Dieu, viens à mon aide.', '/office/sexte/2026-10-08'],
      ['C’est l’heure de none', 'Dieu, viens à mon aide.', '/office/none/2026-10-08'],
      ['C’est l’heure des vêpres', 'Dieu, viens à mon aide.', '/office/vepres/2026-10-08'],
      ['C’est l’heure du chapelet', 'Je vous salue, Marie, pleine de grâce.', '/chapelet'],
      ['C’est l’heure des complies', 'Dieu, viens à mon aide.', '/office/complies/2026-10-08'],
    ])
  })

  it('R1 : le plus matinal des rappels actifs entre lectures et laudes ouvre la journée', () => {
    expect(officeDuMatin(RAPPELS_PAR_DEFAUT)).toBeUndefined()
    expect(officeDuMatin(avec({ laudes: { actif: true } }))).toBe('laudes')
    const lecturesTot = avec({
      laudes: { actif: true },
      lectures: { actif: true, heure: { heures: 6, minutes: 30 } },
    })
    expect(officeDuMatin(lecturesTot)).toBe('lectures')
    const texteDe = (priere: Priere) =>
      programmer(lecturesTot, MAINTENANT).find((n) => n.priere === priere)!.texte
    expect(texteDe('lectures')).toBe('Seigneur, ouvre mes lèvres.')
    expect(texteDe('laudes')).toBe('Dieu, viens à mon aide.')
    // Seul l'office des lectures, sans les laudes : c'est lui qui ouvre.
    expect(
      officeDuMatin(
        avec({
          lectures: { actif: true, heure: { heures: 9, minutes: 0 } },
          tierce: { actif: true },
        }),
      ),
    ).toBe('lectures')
  })
})

describe('canaux Android', () => {
  it('un par son et vibreur, nommé pour les réglages d’Android', () => {
    expect(canalDe(RAPPELS_PAR_DEFAUT.vepres)).toEqual({
      id: 'rappel-bourdon_notre_dame-vibreur',
      nom: 'Rappels · Bourdon de Notre-Dame · vibreur',
      son: { sorte: 'cloche', cloche: 'bourdon_notre_dame' },
      vibreur: true,
    })
    expect(
      canalDe({ ...RAPPELS_PAR_DEFAUT.laudes, son: { sorte: 'telephone' }, vibreur: false }),
    ).toMatchObject({
      id: 'rappel-telephone-sans-vibreur',
      nom: 'Rappels · Son du téléphone · sans vibreur',
    })
    const mp3 = canalDe({
      ...RAPPELS_PAR_DEFAUT.laudes,
      son: { sorte: 'mp3', uri: 'content://media/external/audio/42', nom: 'ave.mp3' },
    })
    expect(mp3.id).toMatch(/^rappel-mp3-[a-z0-9]+-vibreur$/)
    expect(mp3.nom).toBe('Rappels · ave.mp3 · vibreur')
  })

  it('seulement ceux des rappels actifs, chacun une fois', () => {
    const rappels = avec({
      vepres: { actif: true },
      complies: { actif: true },
      laudes: { actif: true },
    })
    expect(canauxNecessaires(rappels).map((c) => c.id)).toEqual([
      'rappel-cloche_marcel-vibreur',
      'rappel-bourdon_notre_dame-vibreur',
    ])
  })
})

describe('libellés de la rubrique', () => {
  it('le résumé nomme les prières rappelées', () => {
    expect(resumerRappels(RAPPELS_PAR_DEFAUT)).toBe('Aucun rappel')
    expect(
      resumerRappels(
        avec({ laudes: { actif: true }, vepres: { actif: true }, complies: { actif: true } }),
      ),
    ).toBe('Laudes, vêpres, complies')
    expect(
      resumerRappels(
        avec({
          lectures: { actif: true, heure: { heures: 6, minutes: 30 } },
          chapelet: { actif: true },
        }),
      ),
    ).toBe('Office des lectures, chapelet')
  })

  it('l’heure s’écrit comme sur une horloge', () => {
    expect(ecrireHeureRappel({ heures: 7, minutes: 0 })).toBe('7 h 00')
    expect(ecrireHeureRappel({ heures: 18, minutes: 30 })).toBe('18 h 30')
  })
})
