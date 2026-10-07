// Lever et coucher du soleil, par les formules abrégées de Meeus (Astronomical
// Algorithms, chap. 25 et 28) : à moins d'une minute des éphémérides
// officielles pour les villes de l'app, ce que demandent les heures solaires
// (phase 12). Tant que le priant n'a pas donné sa position, l'accueil les
// calcule au centre de la France : l'écart avec sa ville ne dépasse pas une
// demi-heure.

export interface Lieu {
  latitude: number
  longitude: number // degrés, positive à l'est
}

// Vesdun (Cher), centre géographique de la France métropolitaine.
export const CENTRE_FRANCE: Lieu = { latitude: 46.54, longitude: 2.43 }

const J2000 = 2451545
const JOUR_UNIX = 2440587.5
const MS_PAR_JOUR = 86400000
const MS_PAR_MINUTE = 60000
const rad = Math.PI / 180
const sin = (degres: number) => Math.sin(degres * rad)
const cos = (degres: number) => Math.cos(degres * rad)
const tan = (degres: number) => Math.tan(degres * rad)

// Le bord supérieur du disque touche l'horizon quand le centre est à 0,833°
// dessous : 34′ de réfraction et 16′ de rayon, convention des éphémérides.
const HAUTEUR_LEVER = -0.833

// Déclinaison (degrés) et équation du temps (minutes) à un instant. La
// longitude est rapportée à l'équinoxe du jour (précession comprise) : les
// formules fixées à l'équinoxe de 2000 retardaient d'un tiers de degré en
// 2026, soit une minute et demie sur la durée du jour aux équinoxes.
function positionDuSoleil(instant: number) {
  const t = (instant / MS_PAR_JOUR + JOUR_UNIX - J2000) / 36525
  const longitudeMoyenne = 280.46646 + 36000.76983 * t + 0.0003032 * t * t
  const anomalie = 357.52911 + 35999.05029 * t - 0.0001537 * t * t
  const excentricite = 0.016708634 - 0.000042037 * t
  const centre =
    (1.914602 - 0.004817 * t) * sin(anomalie) +
    (0.019993 - 0.000101 * t) * sin(2 * anomalie) +
    0.000289 * sin(3 * anomalie)
  // Nutation et aberration, puis obliquité de l'écliptique du jour.
  const noeudLunaire = 125.04 - 1934.136 * t
  const longitude = longitudeMoyenne + centre - 0.00569 - 0.00478 * sin(noeudLunaire)
  const obliquite = 23.439291 - 0.0130042 * t + 0.00256 * cos(noeudLunaire)
  const declinaison = Math.asin(sin(obliquite) * sin(longitude)) / rad
  const y = tan(obliquite / 2) ** 2
  const equationDuTemps =
    (4 / rad) *
    (y * sin(2 * longitudeMoyenne) -
      2 * excentricite * sin(anomalie) +
      4 * excentricite * y * sin(anomalie) * cos(2 * longitudeMoyenne) -
      0.5 * y * y * sin(4 * longitudeMoyenne) -
      1.25 * excentricite * excentricite * sin(2 * anomalie))
  return { declinaison, equationDuTemps }
}

// L'instant où le soleil franchit l'horizon (sens −1 au lever, +1 au
// coucher), compté depuis le minuit UTC du jour civil. La déclinaison bouge
// pendant la demi-journée : on la reprend à l'instant trouvé, trois fois.
function franchissement(minuitUtc: number, lieu: Lieu, sens: -1 | 1) {
  let minutes = 720 - 4 * lieu.longitude
  for (let passe = 0; passe < 3; passe++) {
    const { declinaison, equationDuTemps } = positionDuSoleil(minuitUtc + minutes * MS_PAR_MINUTE)
    const angleHoraire =
      Math.acos(
        (sin(HAUTEUR_LEVER) - sin(lieu.latitude) * sin(declinaison)) /
          (cos(lieu.latitude) * cos(declinaison)),
      ) / rad
    minutes = 720 - 4 * lieu.longitude - equationDuTemps + sens * 4 * angleHoraire
  }
  return new Date(minuitUtc + minutes * MS_PAR_MINUTE)
}

export function leverEtCoucher(jour: Date, lieu: Lieu = CENTRE_FRANCE) {
  // Le jour civil du téléphone, quel que soit son fuseau : le lever et le
  // coucher qui encadrent le midi solaire de ce jour-là au lieu donné.
  const minuitUtc = Date.UTC(jour.getFullYear(), jour.getMonth(), jour.getDate())
  return {
    lever: franchissement(minuitUtc, lieu, -1),
    coucher: franchissement(minuitUtc, lieu, 1),
  }
}
