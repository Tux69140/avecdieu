import { describe, expect, it } from 'vitest'
import { CENTRE_FRANCE, leverEtCoucher, type Lieu } from './soleil'

const VILLES: Record<string, Lieu> = {
  Paris: { latitude: 48.8566, longitude: 2.3522 },
  Lille: { latitude: 50.6292, longitude: 3.0573 },
  Brest: { latitude: 48.3904, longitude: -4.4861 },
  Strasbourg: { latitude: 48.5734, longitude: 7.7521 },
  Lyon: { latitude: 45.764, longitude: 4.8357 },
  Marseille: { latitude: 43.2965, longitude: 5.3698 },
  'Saint-Denis': { latitude: -20.8789, longitude: 55.4481 }, // La Réunion
  Québec: { latitude: 46.8139, longitude: -71.208 },
  Dakar: { latitude: 14.6928, longitude: -17.4467 },
}

// Éphémérides officielles de l'US Naval Observatory (Astronomical Applications
// Department), relevées le 2026-10-07 par
// https://aa.usno.navy.mil/api/rstt/oneday?date=AAAA-MM-JJ&coords=LAT,LON&tz=…
// Lever et coucher du bord supérieur, réfraction comprise : la convention de
// l'app (soleil à −0,833°). Le service de l'IMCCE (Miriade, méthode rts) a été
// écarté : il vise le centre du disque, une à deux minutes plus tard au lever
// et plus tôt au coucher, et ne mesure donc pas la même chose.
//
// Heures UTC du jour civil de la ville, publiées à la minute. Le coucher de
// Québec en juin tombe après minuit UTC : « 24:43 » est 00:43 UTC le
// lendemain, mais bien le soir du 21 juin à Québec, le jour que demande l'app.
// À La Réunion (UTC+4), lever et coucher tombent le même jour en UTC : aucune
// correction.
const EPHEMERIDES: [string, string, string, string][] = [
  ['Paris', '2026-03-20', '05:54', '18:03'],
  ['Paris', '2026-06-21', '03:47', '19:58'],
  ['Paris', '2026-09-23', '05:38', '17:47'],
  ['Paris', '2026-12-21', '07:41', '15:56'],
  ['Paris', '2026-10-07', '05:59', '17:17'],
  ['Lille', '2026-03-20', '05:51', '18:01'],
  ['Lille', '2026-06-21', '03:35', '20:04'],
  ['Lille', '2026-09-23', '05:35', '17:44'],
  ['Lille', '2026-12-21', '07:47', '15:45'],
  ['Lille', '2026-10-07', '05:57', '17:13'],
  ['Brest', '2026-03-20', '06:21', '18:31'],
  ['Brest', '2026-06-21', '04:17', '20:23'],
  ['Brest', '2026-09-23', '06:06', '18:14'],
  ['Brest', '2026-12-21', '08:07', '16:25'],
  ['Brest', '2026-10-07', '06:26', '17:45'],
  ['Strasbourg', '2026-03-20', '05:32', '17:42'],
  ['Strasbourg', '2026-06-21', '03:27', '19:35'],
  ['Strasbourg', '2026-09-23', '05:17', '17:25'],
  ['Strasbourg', '2026-12-21', '07:18', '15:36'],
  ['Strasbourg', '2026-10-07', '05:37', '16:56'],
  ['Lyon', '2026-03-20', '05:44', '17:53'],
  ['Lyon', '2026-06-21', '03:51', '19:34'],
  ['Lyon', '2026-09-23', '05:29', '17:37'],
  ['Lyon', '2026-12-21', '07:19', '15:59'],
  ['Lyon', '2026-10-07', '05:47', '17:10'],
  ['Marseille', '2026-03-20', '05:42', '17:51'],
  ['Marseille', '2026-06-21', '03:58', '19:22'],
  ['Marseille', '2026-09-23', '05:27', '17:34'],
  ['Marseille', '2026-12-21', '07:07', '16:06'],
  ['Marseille', '2026-10-07', '05:43', '17:09'],
  ['Saint-Denis', '2026-03-20', '02:22', '14:29'],
  ['Saint-Denis', '2026-06-21', '02:54', '13:46'],
  ['Saint-Denis', '2026-09-23', '02:07', '14:14'],
  ['Saint-Denis', '2026-12-21', '01:34', '14:58'],
  ['Saint-Denis', '2026-10-07', '01:54', '14:18'],
  ['Québec', '2026-03-20', '10:48', '22:58'],
  ['Québec', '2026-06-21', '08:51', '24:43'],
  ['Québec', '2026-09-23', '10:33', '22:40'],
  ['Québec', '2026-12-21', '12:27', '20:59'],
  ['Québec', '2026-10-07', '10:52', '22:13'],
  ['Dakar', '2026-03-20', '07:14', '19:21'],
  ['Dakar', '2026-06-21', '06:42', '19:42'],
  ['Dakar', '2026-09-23', '06:59', '19:05'],
  ['Dakar', '2026-12-21', '07:30', '18:46'],
  ['Dakar', '2026-10-07', '07:00', '18:55'],
]

// L'instant UTC « HH:MM » compté depuis le minuit UTC du jour (24:43 compris).
function instantUtc(jour: string, heure: string) {
  const [annee, mois, date] = jour.split('-').map(Number)
  const [heures, minutes] = heure.split(':').map(Number)
  return Date.UTC(annee, mois - 1, date, heures, minutes)
}
const ecartMinutes = (calcul: Date, jour: string, heure: string) =>
  Math.abs(calcul.getTime() - instantUtc(jour, heure)) / 60000

describe('leverEtCoucher', () => {
  it.each(EPHEMERIDES)(
    'à %s, le %s, lever et coucher à moins de deux minutes des éphémérides',
    (ville, jour, lever, coucher) => {
      // Le jour civil du téléphone, en heure locale de la machine de test.
      const [annee, mois, date] = jour.split('-').map(Number)
      const soleil = leverEtCoucher(new Date(annee, mois - 1, date), VILLES[ville])
      expect(ecartMinutes(soleil.lever, jour, lever)).toBeLessThan(2)
      expect(ecartMinutes(soleil.coucher, jour, coucher)).toBeLessThan(2)
    },
  )

  it('au centre de la France, les jours d’été sont plus courts qu’à Paris', () => {
    const juin = new Date(2026, 5, 21)
    const duree = (s: { lever: Date; coucher: Date }) => s.coucher.getTime() - s.lever.getTime()
    expect(duree(leverEtCoucher(juin, CENTRE_FRANCE))).toBeLessThan(
      duree(leverEtCoucher(juin, VILLES.Paris)),
    )
  })
})
