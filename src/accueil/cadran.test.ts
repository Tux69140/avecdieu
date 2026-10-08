import { describe, expect, it } from 'vitest'
import {
  astre,
  ciblesDesPerles,
  DATE,
  DEBORD_EN_HAUT,
  ECHELLE_FIXE,
  echelleSolaire,
  etiquetteDuRepere,
  HAUT_DU_BANDEAU,
  JOUR_SOLAIRE,
  LARGEUR,
  LARGEUR_DATE,
  LUNE,
  MARGE_DU_BANDEAU,
  pointDeLaPart,
  pointDuCadran,
  RAYON_HALO_PERLE,
  RAYON_LUNE,
  RAYON_PERLE,
  RAYON_SOLEIL,
  REPERES,
  reperesSolaires,
  type Boite,
  type Point,
} from './cadran'

const a = (heures: number, minutes = 0) => heures * 60 + minutes

describe('pointDuCadran', () => {
  it('va de 6 h à gauche à 22 h à droite, symétriquement', () => {
    const matin = pointDuCadran(a(6))
    const soir = pointDuCadran(a(22))
    expect(matin.x).toBeLessThan(soir.x)
    expect(matin.y).toBeCloseTo(soir.y)
    expect(matin.x + soir.x).toBeCloseTo(360)
  })

  it('place midi un peu à gauche du sommet, 14 h au sommet', () => {
    expect(pointDuCadran(a(12)).x).toBeLessThan(180)
    expect(pointDuCadran(a(14)).x).toBeCloseTo(180)
    expect(pointDuCadran(a(14)).y).toBeLessThan(pointDuCadran(a(12)).y)
  })

  it('reste sur l’arc avant 6 h et après 22 h', () => {
    expect(pointDuCadran(a(3))).toEqual(pointDuCadran(a(6)))
    expect(pointDuCadran(a(23, 30))).toEqual(pointDuCadran(a(22)))
  })

  it('écarte un point vers l’extérieur de l’arc', () => {
    expect(pointDuCadran(a(14), 10).y).toBeLessThan(pointDuCadran(a(14)).y)
  })

  it('donne les repères « 6 h · midi · 18 h · 21 h »', () => {
    expect(REPERES.map((r) => r.texte)).toEqual(['6 h', 'midi', '18 h', '21 h'])
  })
})

describe('astre', () => {
  const soleil = { lever: a(7, 58), coucher: a(19, 21) }

  it('le soleil entre le lever et le coucher, à l’heure qu’il est', () => {
    expect(astre(a(12), soleil)).toEqual({ sorte: 'soleil', minutes: a(12) })
  })

  it('la lune avant le lever et après le coucher', () => {
    expect(astre(a(7), soleil).sorte).toBe('lune')
    expect(astre(a(19, 30), soleil)).toEqual({ sorte: 'lune', minutes: a(19, 30) })
    expect(astre(a(23), soleil).sorte).toBe('lune')
  })
})

describe('cadran solaire', () => {
  // Lyon fin décembre : lever 8 h 20, coucher 17 h 05.
  const soleil = { lever: a(8, 20), coucher: a(17, 5) }
  const nuit = [a(6, 30), a(21, 30), a(20)]
  const echelle = echelleSolaire(soleil, nuit)

  it('l’arc doré va du lever au coucher, midi solaire au sommet', () => {
    expect(echelle(soleil.lever)).toBeCloseTo(JOUR_SOLAIRE.debut)
    expect(echelle(soleil.coucher)).toBeCloseTo(JOUR_SOLAIRE.fin)
    expect(echelle((soleil.lever + soleil.coucher) / 2)).toBeCloseTo(0.5)
    expect(pointDuCadran((soleil.lever + soleil.coucher) / 2, 0, echelle).x).toBeCloseTo(180)
  })

  it('les offices de la nuit vont sur les pointillés, les complies au bout', () => {
    expect(echelle(a(6, 30))).toBeCloseTo(0)
    expect(echelle(a(21, 30))).toBeCloseTo(1)
    expect(echelle(a(20))).toBeGreaterThan(JOUR_SOLAIRE.fin)
    expect(echelle(a(20))).toBeLessThan(1)
  })

  it('sans office avant le lever, rien ne passe avant l’arc doré', () => {
    const sansMatin = echelleSolaire(soleil, [a(21, 30)])
    expect(sansMatin(a(5))).toBeCloseTo(JOUR_SOLAIRE.debut)
  })

  it('repères : lever et coucher avec leur heure, midi au sommet', () => {
    expect(reperesSolaires(soleil)).toEqual([
      { lignes: ['lever', '8 h 20'], part: JOUR_SOLAIRE.debut },
      { lignes: ['midi'], part: 0.5 },
      { lignes: ['coucher', '17 h 05'], part: JOUR_SOLAIRE.fin },
    ])
  })
})

// Les repères, la lune et les cibles des perles ne doivent rien toucher
// (critique de l'accueil, 2026-10-08, mesurée à 360 × 780).
describe('rien ne se touche dans le cadran', () => {
  const parts = Array.from({ length: 241 }, (_, i) => i / 240)
  const distance = (b: Boite, { x, y }: Point) =>
    Math.hypot(Math.max(b.gauche - x, 0, x - b.droite), Math.max(b.haut - y, 0, y - b.bas))
  const auPlusPres = (b: Boite) => Math.min(...parts.map((p) => distance(b, pointDeLaPart(p))))
  const soleil = { lever: a(7, 58), coucher: a(19, 21) }
  const toutes = [
    ...REPERES.map(({ texte, minutes }) => etiquetteDuRepere([texte], ECHELLE_FIXE(minutes))),
    ...reperesSolaires(soleil).map(({ lignes, part }) => etiquetteDuRepere(lignes, part)),
  ]

  it('aucun repère ne touche l’arc, où vivent les perles et leur halo', () => {
    for (const { boite } of toutes) {
      expect(auPlusPres(boite)).toBeGreaterThanOrEqual(RAYON_HALO_PERLE + 2)
      // Au plus près de son trait, pas ailleurs dans le cadran.
      expect(auPlusPres(boite)).toBeLessThan(RAYON_HALO_PERLE + 12)
      // Le cadran a la gouttière de l'écran pour marge sur les côtés.
      expect(boite.gauche).toBeGreaterThanOrEqual(-8)
      expect(boite.droite).toBeLessThanOrEqual(LARGEUR + 8)
      expect(boite.haut).toBeGreaterThanOrEqual(-DEBORD_EN_HAUT)
    }
  })

  // Le soleil caché derrière la perle du moment peut le frôler : le porteur du
  // projet tient à ce soleil (2026-10-08).
  it('« midi » ne touche pas le halo de sexte', () => {
    const midi = toutes[1].boite
    expect(distance(midi, pointDuCadran(a(12)))).toBeGreaterThan(RAYON_HALO_PERLE)
  })

  it('« 21 h » ne touche pas la perle des complies, ni à 21 h 30, ni à 22 h', () => {
    const vingtEtUne = toutes[3].boite
    expect(distance(vingtEtUne, pointDuCadran(a(21, 30)))).toBeGreaterThan(RAYON_HALO_PERLE)
    expect(distance(vingtEtUne, pointDuCadran(a(22)))).toBeGreaterThan(RAYON_HALO_PERLE)
  })

  it('aucun repère ne descend dans le bandeau du jour, sous l’arc', () => {
    for (const { boite } of toutes) {
      const dansLeBandeau =
        boite.bas > HAUT_DU_BANDEAU &&
        boite.droite > MARGE_DU_BANDEAU &&
        boite.gauche < LARGEUR - MARGE_DU_BANDEAU
      expect(dansLeBandeau).toBe(false)
    }
  })

  it('la lune, sous le sommet, ne touche ni une perle du sommet ni la date', () => {
    const lune = {
      gauche: LUNE.x - RAYON_LUNE,
      droite: LUNE.x,
      haut: LUNE.y - RAYON_LUNE,
      bas: LUNE.y + RAYON_LUNE,
    }
    // La nuit, une perle du sommet (sexte en heures solaires) n'est pas du moment.
    expect(auPlusPres(lune)).toBeGreaterThan(RAYON_PERLE + 1)
    expect(lune.bas).toBeLessThan(DATE.haut)
  })

  it('la plus longue date ne touche ni une perle du moment, ni les rayons du soleil', () => {
    const date = {
      gauche: (LARGEUR - LARGEUR_DATE) / 2,
      droite: (LARGEUR + LARGEUR_DATE) / 2,
      ...DATE,
    }
    // Le halo pâle du soleil peut effleurer le bord d'une très longue date.
    expect(auPlusPres(date)).toBeGreaterThan(Math.max(RAYON_HALO_PERLE, RAYON_SOLEIL) + 1)
  })
})

describe('cibles des perles', () => {
  const heures = [a(7), a(9), a(12), a(15), a(18, 30), a(21, 30)]

  it('deux cibles voisines ne se chevauchent jamais, laudes et tierce comprises', () => {
    const points = heures.map((m) => pointDuCadran(m))
    const cibles = ciblesDesPerles(points)
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++) {
        const ecart = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y)
        expect((cibles[i] + cibles[j]) / 2).toBeLessThanOrEqual(ecart + 1e-9)
      }
    // Laudes et tierce, à 37,6 px l'une de l'autre, se partagent l'écart.
    const laudesTierce = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
    expect(cibles[0]).toBeCloseTo(laudesTierce)
  })

  it('une perle seule garde toute sa cible', () => {
    expect(ciblesDesPerles([pointDuCadran(a(12))])).toEqual([Infinity])
  })
})
