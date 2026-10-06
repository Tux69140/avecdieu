import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lireOffice } from '../aelf/office'
import { CONCLUSIONS } from '../recueil/office'
import type { Bloc, NomOffice, Office, Partie } from './modele'
import { conclureOraison, formeDe } from './oraison'
import { invitatoireDe, reconstituer } from './rubriques'
import { strophesDe, texteDe } from './textes'

// Jeu d'offices de référence : réponses réelles de l'AELF (zone france),
// enregistrées dans src/aelf/exemples/. Un dimanche (2026-10-04), une férie
// du temps ordinaire (2026-10-06), une solennité (Toussaint, 2026-11-01),
// l'Avent (2026-11-29), le Carême (2027-02-17), le temps pascal (2027-05-13),
// plus le second cantique de Daniel (2026-10-11) et la Pentecôte (2027-05-16).

const DOSSIER = 'src/aelf/exemples'

const aelf = (nom: NomOffice, date: string) =>
  lireOffice(nom, date, JSON.parse(readFileSync(`${DOSSIER}/${nom}-${date}.json`, 'utf8')))

interface Ouverture {
  premier?: boolean
  plusieurs?: boolean
}

function complet(
  nom: NomOffice,
  date: string,
  { premier = false, plusieurs = false }: Ouverture = {},
) {
  const invitatoire = nom === 'lectures' ? invitatoireDe(aelf('laudes', date)) : undefined
  return reconstituer(aelf(nom, date), { premier, plusieurs, invitatoire })
}

const libelles = (office: Office) => office.parties.map((p) => p.libelle)
const partie = (office: Office, libelle: string) => {
  const trouvee = office.parties.find((p) => p.libelle === libelle)
  if (!trouvee) throw new Error(`Pas de partie « ${libelle} » dans ${libelles(office).join(', ')}`)
  return trouvee
}
const texte = (bloc: Bloc) => texteDe(bloc.strophes)
const estGloire = (bloc: Bloc) => bloc.priere === 'Gloire au Père'
const GLOIRE = 'Gloire au Père, et au Fils et au Saint-Esprit,'

describe('R1 et R3 : l’invitatoire ouvre la journée', () => {
  it('premier office, les laudes commencent par « Seigneur, ouvre mes lèvres » et l’invitatoire', () => {
    const laudes = complet('laudes', '2026-10-06', { premier: true })
    expect(libelles(laudes).slice(0, 4)).toEqual([
      'Introduction',
      'Invitatoire',
      'Psaume 94',
      'Hymne',
    ])
    const introduction = partie(laudes, 'Introduction')
    expect(texte(introduction.blocs[0])).toBe(
      'V/Seigneur, ouvre mes lèvres, R/et ma bouche publiera ta louange.',
    )
    // L'AELF l'a donné ainsi : rien n'est déplacé.
    expect(introduction.ajoutee).toBe(false)
  })

  it('l’antienne est aussitôt répétée, puis reprise après chaque strophe, et après le Gloire', () => {
    const laudes = complet('laudes', '2026-10-06', { premier: true })
    const [antienne, repetee] = partie(laudes, 'Invitatoire').blocs
    expect(texte(antienne)).toBe('Le Seigneur est Roi, venez, adorons-le.')
    expect(repetee).toMatchObject({ ajoute: true, antienne: true })
    expect(texte(repetee)).toBe(texte(antienne))

    const psaume = partie(laudes, 'Psaume 94').blocs
    const strophes = aelf('laudes', '2026-10-06').parties[2].blocs[0].strophes
    expect(psaume).toHaveLength(strophes.length * 2 + 2)
    psaume.slice(0, -2).forEach((bloc, i) => {
      if (i % 2 === 0) expect(bloc.strophes).toEqual([strophes[i / 2]])
      else expect(bloc).toMatchObject({ ajoute: true, antienne: true })
    })
    expect(estGloire(psaume.at(-2)!)).toBe(true)
    expect(texte(psaume.at(-1)!)).toBe(texte(antienne))
  })

  it('pas premier, les laudes commencent par « Dieu, viens à mon aide », sans invitatoire', () => {
    const laudes = complet('laudes', '2026-10-06')
    expect(libelles(laudes).slice(0, 2)).toEqual(['Introduction', 'Hymne'])
    const introduction = partie(laudes, 'Introduction')
    expect(introduction.ajoutee).toBe(true)
    expect(introduction.blocs.map(texte)).toEqual([
      'V/Dieu, viens à mon aide, R/Seigneur, à notre secours.',
      `${GLOIRE} au Dieu qui est, qui était et qui vient, pour les siècles des siècles. Amen.`,
      'Alléluia.',
    ])
    expect(estGloire(introduction.blocs[1])).toBe(true)
  })

  it('premier office, l’office des lectures reçoit l’invitatoire des laudes, signalé comme ajout', () => {
    const lectures = complet('lectures', '2026-10-06', { premier: true })
    expect(libelles(lectures).slice(0, 4)).toEqual([
      'Introduction',
      'Invitatoire',
      'Psaume 94',
      'Hymne',
    ])
    expect(lectures.parties.slice(0, 3).every((p) => p.ajoutee)).toBe(true)
    expect(texte(partie(lectures, 'Introduction').blocs[0])).toMatch(
      /^V\/Seigneur, ouvre mes lèvres/,
    )
  })

  it('pas premier, l’office des lectures garde son introduction, sans invitatoire', () => {
    const lectures = complet('lectures', '2026-10-06')
    expect(libelles(lectures).slice(0, 2)).toEqual(['Introduction', 'Hymne'])
    expect(partie(lectures, 'Introduction').ajoutee).toBe(false)
  })

  it('l’invitatoire ne précède jamais les autres offices', () => {
    for (const nom of ['tierce', 'sexte', 'none', 'vepres', 'complies'] as const) {
      const office = complet(nom, '2026-10-06', { premier: true })
      expect(libelles(office)).not.toContain('Invitatoire')
      expect(texte(partie(office, 'Introduction').blocs[0])).toMatch(/^V\/Dieu, viens à mon aide/)
    }
  })
})

describe('R2 : l’Alléluia de l’introduction', () => {
  const alleluia = (date: string) =>
    partie(complet('tierce', date), 'Introduction').blocs.some((b) => texte(b) === 'Alléluia.')

  it('se dit hors Carême, et se tait en Carême', () => {
    expect(alleluia('2026-11-01')).toBe(true)
    expect(alleluia('2027-05-13')).toBe(true)
    expect(alleluia('2027-02-17')).toBe(false)
  })
})

describe('R4 et R5 : antiennes et Gloire au Père de la psalmodie', () => {
  it('chaque psaume finit par le Gloire au Père, puis son antienne', () => {
    const laudes = complet('laudes', '2026-10-06')
    for (const [psaume, antienne] of [
      ['Psaume 84', 'Antienne 1'],
      ['Cantique d’Isaïe (Is 26)', 'Antienne 2'],
      ['Psaume 66', 'Antienne 3'],
      ['Cantique de Zacharie', 'Antienne'],
    ]) {
      const blocs = partie(laudes, psaume).blocs
      expect(blocs).toHaveLength(3)
      expect(blocs[1]).toMatchObject({ priere: 'Gloire au Père', ajoute: true })
      expect(blocs[2]).toMatchObject({ ajoute: true, antienne: true })
      expect(texte(blocs[2])).toBe(texte(partie(laudes, antienne).blocs[0]))
    }
  })

  it('le cantique « Toutes les œuvres du Seigneur » (Dn 3, 57-88) se passe du Gloire au Père', () => {
    const laudes = complet('laudes', '2026-10-04')
    const cantique = partie(laudes, 'Cantique des trois enfants (Dn 3)').blocs
    expect(cantique.some(estGloire)).toBe(false)
    // L'AELF ne lui donne pas d'antienne : celle du psaume 92 vaut pour les deux.
    expect(texte(cantique.at(-1)!)).toBe(texte(partie(laudes, 'Antienne 1').blocs[0]))
    const psaume = partie(laudes, 'Psaume 92').blocs
    expect(psaume.map((b) => b.priere ?? (b.antienne ? 'antienne' : 'texte'))).toEqual([
      'texte',
      'Gloire au Père',
    ])
  })

  it('le cantique « Béni sois-tu, Seigneur, Dieu de nos pères » (Dn 3, 52-57) garde le sien', () => {
    const laudes = complet('laudes', '2026-10-11')
    expect(partie(laudes, 'Cantique des trois enfants (Dn 3)').blocs.some(estGloire)).toBe(true)
  })

  it('une seule antienne pour l’heure : dite après le dernier psaume, Gloire après chacun', () => {
    const none = complet('none', '2026-11-01')
    const forme = (libelle: string) =>
      partie(none, libelle).blocs.map((b) => b.priere ?? (b.antienne ? 'antienne' : 'texte'))
    expect(forme('Psaume 117 - I')).toEqual(['texte', 'Gloire au Père'])
    expect(forme('Psaume 117 - II')).toEqual(['texte', 'Gloire au Père'])
    expect(forme('Psaume 117 - III')).toEqual(['texte', 'Gloire au Père', 'antienne'])
  })
})

describe('R6 : le Notre Père', () => {
  it('s’écrit en entier aux laudes et aux vêpres', () => {
    for (const nom of ['laudes', 'vepres'] as const) {
      const [bloc] = partie(complet(nom, '2026-10-06'), 'Notre Père').blocs
      expect(bloc).toMatchObject({ priere: 'Notre Père', ajoute: true })
      expect(texte(bloc)).toMatch(/^Notre Père, qui es aux cieux, .* Amen\.$/)
    }
  })
})

describe('R7 : la conclusion de l’oraison', () => {
  const oraison = (texte: string): Partie => ({
    type: 'oraison',
    libelle: 'Oraison',
    blocs: [{ strophes: strophesDe([texte]) }],
    ajoutee: false,
  })
  const conclue = (texteOraison: string, longue: boolean) =>
    conclureOraison(oraison(texteOraison), longue).oraison.blocs.map(texte)

  it('choisit la forme selon celui à qui la prière s’adresse', () => {
    expect(formeDe('Dieu qui ne cesses de créer l’univers, regarde notre travail.')).toBe('pere')
    expect(formeDe('Seigneur Jésus, toi qui es venu, reste avec nous.')).toBe('au-fils')
    expect(formeDe('Jésus, notre frère, sois notre lumière.')).toBe('au-fils')
    expect(formeDe('Garde-nous fidèles au corps de Jésus Christ.')).toBe('fils-a-la-fin')
    expect(formeDe('Accorde-nous la lumière qui a guidé les mages vers ton Fils.')).toBe(
      'fils-a-la-fin',
    )
  })

  it('développe la forme longue à l’office des lectures, aux laudes et aux vêpres', () => {
    expect(conclue('Dieu qui veilles sur nous, garde-nous.', true)).toEqual([
      'Dieu qui veilles sur nous, garde-nous.',
      `${CONCLUSIONS.longue.pere} Amen.`,
    ])
  })

  it('développe la forme brève aux petites heures et aux complies', () => {
    expect(conclue('Dieu qui veilles sur nous, garde-nous.', false)).toEqual([
      'Dieu qui veilles sur nous, garde-nous.',
      `${CONCLUSIONS.breve.pere} Amen.`,
    ])
  })

  it('remplace l’abréviation de l’AELF par la conclusion entière qu’elle désigne', () => {
    expect(conclue('Que ton Fils nous donne part à sa vie divine. Lui qui règne.', true)).toEqual([
      'Que ton Fils nous donne part à sa vie divine.',
      `${CONCLUSIONS.longue['fils-a-la-fin']} Amen.`,
    ])
    expect(conclue('Fais-nous te reconnaître dans le pain partagé. Toi qui règnes.', true)).toEqual(
      ['Fais-nous te reconnaître dans le pain partagé.', `${CONCLUSIONS.longue['au-fils']} Amen.`],
    )
    expect(conclue('Garde-nous. Lui qui règne.', false)).toEqual([
      'Garde-nous.',
      `${CONCLUSIONS.breve['fils-a-la-fin']} Amen.`,
    ])
  })

  it('garde la conclusion complète de l’AELF, en ajoutant seulement l’Amen qui manque', () => {
    expect(
      conclue('Donne-nous le repos. Toi qui règnes pour les siècles des siècles.', false),
    ).toEqual(['Donne-nous le repos. Toi qui règnes pour les siècles des siècles.', 'Amen.'])
    const entiere = 'Garde-nous. Par Jésus, le Christ, notre Seigneur. Amen.'
    expect(conclue(entiere, false)).toEqual([entiere])
    const vepres = partie(complet('vepres', '2026-10-06'), 'Oraison').blocs.map(texte)
    expect(vepres).toEqual([expect.stringMatching(/Jésus, ton Fils, Dieu à jamais\.$/), 'Amen.'])
  })

  it('l’ajout est signalé', () => {
    const [aelfSeul, ajout] = conclureOraison(oraison('Garde-nous.'), true).oraison.blocs
    expect(aelfSeul.ajoute).toBeUndefined()
    expect(ajout.ajoute).toBe(true)
  })
})

describe('R8 : la fin de l’office', () => {
  it('« Que le Seigneur nous bénisse » aux laudes et aux vêpres', () => {
    for (const nom of ['laudes', 'vepres'] as const) {
      const derniere = complet(nom, '2026-10-06').parties.at(-1)!
      expect(derniere).toMatchObject({ type: 'conclusion', libelle: 'Bénédiction', ajoutee: true })
      expect(texte(derniere.blocs[0])).toMatch(/^Que le Seigneur nous bénisse/)
    }
  })

  it('« Bénissons le Seigneur » à l’office des lectures et aux petites heures', () => {
    for (const nom of ['lectures', 'tierce', 'sexte', 'none'] as const) {
      const derniere = complet(nom, '2026-10-06').parties.at(-1)!
      expect(derniere).toMatchObject({ type: 'conclusion', libelle: 'Conclusion', ajoutee: true })
      expect(texte(derniere.blocs[0])).toBe('V/Bénissons le Seigneur. R/Nous rendons grâce à Dieu.')
    }
  })

  it('les complies gardent la bénédiction de l’AELF', () => {
    const complies = complet('complies', '2026-10-06')
    expect(complies.parties.some((p) => p.type === 'conclusion')).toBe(false)
    expect(libelles(complies).slice(-2)).toEqual(['Bénédiction', 'Antienne mariale'])
  })

  it('l’envoi que l’AELF joint à l’oraison (Pentecôte) tient lieu de fin', () => {
    const vepres = complet('vepres', '2027-05-16')
    const oraison = partie(vepres, 'Oraison').blocs.map(texte)
    expect(oraison[0]).toMatch(/prédication évangélique\.$/)
    expect(oraison[1]).toBe(`${CONCLUSIONS.longue.pere} Amen.`)
    const derniere = vepres.parties.at(-1)!
    expect(derniere).toMatchObject({ libelle: 'Conclusion', ajoutee: false })
    expect(texte(derniere.blocs[0])).toMatch(/^V\/Bénissons le Seigneur, alléluia, alléluia\./)
  })
})

describe('R9 : l’examen de conscience des complies', () => {
  it('se place juste après l’introduction, avant l’hymne', () => {
    const complies = complet('complies', '2026-10-06')
    expect(libelles(complies).slice(0, 3)).toEqual([
      'Introduction',
      'Examen de conscience',
      'Hymne',
    ])
    const examen = partie(complies, 'Examen de conscience')
    expect(examen.ajoutee).toBe(true)
    expect(examen.blocs[0].priere).toBe('Je confesse à Dieu')
    expect(texte(examen.blocs[1])).toMatch(/^Que Dieu tout-puissant nous fasse miséricorde/)
  })
})

describe('R10 : prier à plusieurs', () => {
  const gloires = (office: Office) => office.parties.flatMap((p) => p.blocs).filter(estGloire)

  it('« Tous » précède chaque Gloire au Père, et seulement à plusieurs', () => {
    const plusieurs = gloires(complet('laudes', '2026-10-06', { premier: true, plusieurs: true }))
    expect(plusieurs).toHaveLength(5)
    expect(plusieurs.every((b) => b.rubrique === 'Tous')).toBe(true)
    const seul = gloires(complet('laudes', '2026-10-06', { premier: true }))
    expect(seul.every((b) => b.rubrique === undefined)).toBe(true)
  })
})

describe('jeu d’offices de référence : 100 % des ajouts attendus', () => {
  const exemples = readdirSync(DOSSIER)
    .map((f) => /^([a-z]+)-(\d{4}-\d{2}-\d{2})\.json$/.exec(f))
    .filter((m) => m !== null)
    .map(([, nom, date]) => [nom as NomOffice, date] as const)

  for (const [nom, date] of exemples)
    for (const premier of [true, false])
      it(`${nom} du ${date}${premier ? ', premier office du jour' : ''}`, () => {
        const office = complet(nom, date, { premier })
        for (const p of office.parties) {
          if (p.type === 'psaume' || p.type === 'cantique') {
            const dn357 = /Dn 3/.test(p.libelle) && /^57/.test(texte(p.blocs[0]))
            expect(p.blocs.some(estGloire), `Gloire au Père après ${p.libelle}`).toBe(!dn357)
          }
          if (p.type === 'notre-pere') expect(p.blocs).toHaveLength(1)
          if (p.type === 'oraison')
            expect(texte(p.blocs.at(-1)!), 'oraison conclue par Amen').toMatch(/Amen\s*[.!]$/)
        }
        // Chaque antienne est reprise après son dernier psaume.
        const reprises = office.parties.flatMap((p) => p.blocs).filter((b) => b.antienne)
        const antiennes = office.parties.filter((p) => p.type === 'antienne')
        expect(reprises.length).toBeGreaterThanOrEqual(antiennes.length)
        if (nom !== 'complies') expect(office.parties.at(-1)!.type).toBe('conclusion')
        if (nom === 'complies') expect(libelles(office)[1]).toBe('Examen de conscience')
        expect(libelles(office).includes('Invitatoire')).toBe(
          premier && (nom === 'laudes' || nom === 'lectures'),
        )
      })
})
