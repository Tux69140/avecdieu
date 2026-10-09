import { ecrireHeure, versHeure } from '../office/heure'

// La géométrie du cadran de l'accueil : un arc elliptique ouvert vers le bas
// (docs/DESIGN.md, maquette du porteur du projet). Coordonnées dans une boîte
// de 360 × 156. En heures fixes, les heures se répartissent également de 6 h
// (gauche) à 22 h (droite) ; en heures solaires, l'arc doré va du lever au
// coucher, prolongé aux deux bouts par des pointillés pour les offices de la
// nuit (décision du porteur du projet, 2026-10-07).

export const LARGEUR = 360
export const HAUTEUR = 156

const ANGLE_DEBUT = 165
const ANGLE_FIN = 15
const CX = 180
const CY = 136
const RX = 158
const RY = 100

// Les perles se dessinent en pixels, le cadran en unités de cette boîte : au
// plus petit téléphone visé (360 px), le cadran fait 344 px de large, et une
// perle y pèse le plus. Rayons en unités, à cette largeur, arrondis au-dessus.
const UNITES_PAR_PX = LARGEUR / 344
// Une perle de 12 px ; celle du moment, 14 px et un halo de 5 px.
export const RAYON_PERLE = Math.ceil(6 * UNITES_PAR_PX)
export const RAYON_HALO_PERLE = Math.ceil(12 * UNITES_PAR_PX)
// Le soleil, dessiné dans la boîte (Cadran.tsx) : ses rayons, puis son halo pâle.
export const RAYON_SOLEIL = 15
export const RAYON_HALO_SOLEIL = 18

// Le bandeau du jour commence sous l'arc, à cette hauteur, et laisse cette
// marge de chaque côté (Cadran.tsx les traduit en pourcentages de la largeur).
export const HAUT_DU_BANDEAU = 76
export const MARGE_DU_BANDEAU = 0.12 * LARGEUR

// La date, première ligne du bandeau, au plus large (« Mercredi 30 septembre »,
// 192 px mesurés à 360 px), et ses lettres sous le haut du bandeau : de la
// capitale à la ligne de pied, jambage compris (Cormorant SC, 18 px).
export const LARGEUR_DATE = 204
export const DATE = { haut: HAUT_DU_BANDEAU + 3, bas: HAUT_DU_BANDEAU + 21 }

// La nuit, le croissant se tient au ciel, sous le sommet de l'arc : posé à
// l'heure qu'il est, il se cacherait derrière la perle des complies. Assez
// bas pour ne pas toucher une perle du sommet, assez haut pour ne pas toucher
// la date. Le croissant s'étend de x − RAYON_LUNE à x.
export const RAYON_LUNE = 10
export const LUNE = { x: LARGEUR / 2, y: 58 }

export interface Point {
  x: number
  y: number
}

// Où tombe une heure (minutes depuis minuit) sur l'arc, de 0 (bout gauche) à
// 1 (bout droit).
type Echelle = (minutes: number) => number

const borner = (part: number) => Math.min(1, Math.max(0, part))

const DEBUT_FIXE = 6 * 60
const FIN_FIXE = 22 * 60
export const ECHELLE_FIXE: Echelle = (minutes) =>
  borner((minutes - DEBUT_FIXE) / (FIN_FIXE - DEBUT_FIXE))

// La part de l'arc qu'occupe le jour, du lever au coucher.
export const JOUR_SOLAIRE = { debut: 0.1, fin: 0.9 }

// Le jour s'étend sur l'arc doré ; avant le lever, la nuit va du premier
// office au lever, après le coucher, du coucher au dernier office (les
// complies, au bout).
export function echelleSolaire(
  { lever, coucher }: { lever: number; coucher: number },
  heures: number[],
): Echelle {
  const premier = Math.min(...heures.filter((m) => m < lever))
  const dernier = Math.max(...heures.filter((m) => m > coucher))
  const { debut, fin } = JOUR_SOLAIRE
  return (minutes) => {
    if (minutes < lever)
      return Number.isFinite(premier)
        ? (debut * Math.max(0, minutes - premier)) / (lever - premier)
        : debut
    if (minutes > coucher)
      return Number.isFinite(dernier)
        ? borner(fin + ((1 - fin) * (minutes - coucher)) / (dernier - coucher))
        : fin
    return debut + ((fin - debut) * (minutes - lever)) / (coucher - lever)
  }
}

// Le point de l'arc pour une part, écarté de « ecart » vers l'extérieur
// (positif) ou l'intérieur (négatif).
export function pointDeLaPart(part: number, ecart = 0): Point {
  const angle = ((ANGLE_DEBUT - borner(part) * (ANGLE_DEBUT - ANGLE_FIN)) * Math.PI) / 180
  return { x: CX + (RX + ecart) * Math.cos(angle), y: CY - (RY + ecart) * Math.sin(angle) }
}

// Le point de l'arc pour une heure (minutes depuis minuit).
export const pointDuCadran = (minutes: number, ecart = 0, echelle = ECHELLE_FIXE): Point =>
  pointDeLaPart(echelle(minutes), ecart)

// Un morceau de l'arc, en chemin SVG ; l'arc entier par défaut.
export function cheminDeLArc(debut = 0, fin = 1): string {
  const a = pointDeLaPart(debut)
  const b = pointDeLaPart(fin)
  return `M${a.x} ${a.y} A${RX} ${RY} 0 0 1 ${b.x} ${b.y}`
}

export const REPERES = [
  { texte: '6 h', minutes: 6 * 60 },
  { texte: 'midi', minutes: 12 * 60 },
  { texte: '18 h', minutes: 18 * 60 },
  { texte: '21 h', minutes: 21 * 60 },
]

// Un repère se pose à l'écart de l'arc, au plus près de son trait : perles et
// halos vivent sur l'arc (critique du 2026-10-08). Le soleil caché derrière la
// perle du moment peut frôler son repère : écarter les repères de lui les
// envoyait loin de l'arc, et le porteur du projet tient à ce soleil.
const MARGE = 2
const DEGAGEMENT = RAYON_HALO_PERLE + MARGE
// Au-dessus du dessin, le bas de la ligne des jours est vide : un repère du
// sommet peut y déborder (le dessin laisse passer les touchers).
export const DEBORD_EN_HAUT = 8
// Petites capitales de 15 unités (Cadran.css), mesurées et un peu majorées.
const LARGEUR_LETTRE = 8.5
export const INTERLIGNE = 16
const AU_DESSUS_DE_LA_LIGNE = 14
const SOUS_LA_LIGNE = 4.5

export interface Boite {
  gauche: number
  droite: number
  haut: number
  bas: number
}

interface Etiquette {
  lignes: string[]
  // Le milieu du texte et la ligne de pied de sa première ligne.
  x: number
  y: number
  boite: Boite
}

const ECHANTILLONS = Array.from({ length: 121 }, (_, i) => pointDeLaPart(i / 120))

const distanceALArc = (b: Boite) =>
  Math.min(
    ...ECHANTILLONS.map(({ x, y }) =>
      Math.hypot(Math.max(b.gauche - x, 0, x - b.droite), Math.max(b.haut - y, 0, y - b.bas)),
    ),
  )

const dansLeBandeau = (b: Boite) =>
  b.bas > HAUT_DU_BANDEAU && b.droite > MARGE_DU_BANDEAU && b.gauche < LARGEUR - MARGE_DU_BANDEAU

// Sur les côtés, le cadran a la gouttière de l'écran pour marge : « 6 h » peut
// y déborder un peu, à sa place d'origine, au bout de l'arc.
const DEBORD_SUR_LE_COTE = 8

const convient = (b: Boite) =>
  b.gauche >= -DEBORD_SUR_LE_COTE &&
  b.droite <= LARGEUR + DEBORD_SUR_LE_COTE &&
  b.haut >= -DEBORD_EN_HAUT &&
  b.bas <= HAUTEUR &&
  !dansLeBandeau(b) &&
  distanceALArc(b) >= DEGAGEMENT

function boiteAutourDe({ x, y }: Point, largeur: number, hauteur: number): Boite {
  return {
    gauche: x - largeur / 2,
    droite: x + largeur / 2,
    haut: y - hauteur / 2,
    bas: y + hauteur / 2,
  }
}

const etiquettes = new Map<string, Etiquette>()

// Cherche en spirale, autour du point posé au-dessus du trait, la place libre
// la plus proche. Le résultat ne dépend que du texte et de la part : retenu.
export function etiquetteDuRepere(lignes: string[], part: number): Etiquette {
  const cle = `${lignes.join('|')}@${part}`
  const connue = etiquettes.get(cle)
  if (connue) return connue
  const largeur = Math.max(...lignes.map((l) => l.length)) * LARGEUR_LETTRE
  const hauteur = AU_DESSUS_DE_LA_LIGNE + SOUS_LA_LIGNE + INTERLIGNE * (lignes.length - 1)
  const origine = pointDeLaPart(part, 19)
  let centre = origine
  recherche: for (let rayon = 0; rayon <= 120; rayon++)
    for (let pas = 0; pas < 24; pas++) {
      const angle = (pas * Math.PI) / 12
      const essai = {
        x: origine.x + rayon * Math.cos(angle),
        y: origine.y - rayon * Math.sin(angle),
      }
      if (convient(boiteAutourDe(essai, largeur, hauteur))) {
        centre = essai
        break recherche
      }
    }
  const boite = boiteAutourDe(centre, largeur, hauteur)
  const etiquette = { lignes, x: centre.x, y: boite.haut + AU_DESSUS_DE_LA_LIGNE, boite }
  etiquettes.set(cle, etiquette)
  return etiquette
}

// Le diamètre que peut prendre la cible de chaque perle, en unités : l'écart
// à sa plus proche voisine. Deux cibles voisines se partagent ainsi l'écart
// sans se chevaucher (laudes et tierce, à 37,6 px à 360 px de large) ; le
// composant plafonne à 48 px.
export function ciblesDesPerles(points: Point[]): number[] {
  return points.map((p, i) =>
    Math.min(...points.filter((_, j) => j !== i).map((q) => Math.hypot(p.x - q.x, p.y - q.y))),
  )
}

interface RepereSolaire {
  lignes: string[]
  part: number
}

const enHeure = (minutes: number) => versHeure(Math.round(minutes))

// « LEVER 7 H 52 · MIDI · COUCHER 18 H 40 » (petites capitales du cadran).
export function reperesSolaires(soleil: { lever: number; coucher: number }): RepereSolaire[] {
  return [
    { lignes: ['lever', ecrireHeure(enHeure(soleil.lever))], part: JOUR_SOLAIRE.debut },
    { lignes: ['midi'], part: 0.5 },
    { lignes: ['coucher', ecrireHeure(enHeure(soleil.coucher))], part: JOUR_SOLAIRE.fin },
  ]
}

// Le soleil entre son lever et son coucher, à l'heure qu'il est ; le croissant
// de lune hors de là.
export interface Astre {
  sorte: 'soleil' | 'lune'
  minutes: number
}

export function astre(minutes: number, soleil: { lever: number; coucher: number }): Astre {
  const jour = minutes >= soleil.lever && minutes < soleil.coucher
  return { sorte: jour ? 'soleil' : 'lune', minutes }
}
