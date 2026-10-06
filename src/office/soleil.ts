// Lever et coucher du soleil, par l'équation du lever (précise à la minute,
// bien assez pour un cadran). Tant que le priant n'a pas donné sa position
// (phase 12), l'accueil les calcule au centre de la France : l'écart avec sa
// ville ne dépasse pas une demi-heure.

export interface Lieu {
  latitude: number
  longitude: number // degrés, positive à l'est
}

// Vesdun (Cher), centre géographique de la France métropolitaine.
export const CENTRE_FRANCE: Lieu = { latitude: 46.54, longitude: 2.43 }

const J2000 = 2451545
const JOUR_UNIX = 2440587.5
const MS_PAR_JOUR = 86400000
const rad = Math.PI / 180
const sin = (degres: number) => Math.sin(degres * rad)
const cos = (degres: number) => Math.cos(degres * rad)

// Le soleil passe sous l'horizon de 0,833° : réfraction et rayon du disque.
const HAUTEUR_LEVER = -0.833
const INCLINAISON_TERRE = 23.4397

export function leverEtCoucher(jour: Date, lieu: Lieu = CENTRE_FRANCE) {
  // Le jour civil du téléphone, compté depuis J2000.
  const minuitUtc = Date.UTC(jour.getFullYear(), jour.getMonth(), jour.getDate())
  const n = Math.ceil(minuitUtc / MS_PAR_JOUR + JOUR_UNIX - J2000 + 0.0008)
  const midiMoyen = n - lieu.longitude / 360
  const anomalie = (357.5291 + 0.98560028 * midiMoyen) % 360
  const centre = 1.9148 * sin(anomalie) + 0.02 * sin(2 * anomalie) + 0.0003 * sin(3 * anomalie)
  const longitudeSoleil = (anomalie + centre + 180 + 102.9372) % 360
  const transit = J2000 + midiMoyen + 0.0053 * sin(anomalie) - 0.0069 * sin(2 * longitudeSoleil)
  const declinaison = Math.asin(sin(longitudeSoleil) * sin(INCLINAISON_TERRE)) / rad
  const angle =
    Math.acos(
      (sin(HAUTEUR_LEVER) - sin(lieu.latitude) * sin(declinaison)) /
        (cos(lieu.latitude) * cos(declinaison)),
    ) / rad
  const enDate = (julien: number) => new Date((julien - JOUR_UNIX) * MS_PAR_JOUR)
  return { lever: enDate(transit - angle / 360), coucher: enDate(transit + angle / 360) }
}
