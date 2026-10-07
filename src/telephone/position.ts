import type { Lieu } from '../office/soleil'

// La position du téléphone, par la géolocalisation de la WebView : Capacitor
// relaie la demande d'autorisation d'Android (position approximative, bien
// assez pour les heures du soleil). Elle ne quitte jamais le téléphone et
// n'est jamais écrite dans un journal (.claude/rules/securite.md).

export type Localisation =
  | { sorte: 'trouvee'; position: Lieu }
  // Android refuse l'accès à la position.
  | { sorte: 'refusee' }
  // Localisation éteinte, pas de signal, ou trop longue à venir.
  | { sorte: 'introuvable' }

const REFUS = 1

export function localiser(): Promise<Localisation> {
  const geolocalisation = navigator.geolocation
  if (!geolocalisation) return Promise.resolve({ sorte: 'introuvable' })
  return new Promise((resoudre) =>
    geolocalisation.getCurrentPosition(
      ({ coords }) =>
        resoudre({
          sorte: 'trouvee',
          position: { latitude: coords.latitude, longitude: coords.longitude },
        }),
      (erreur) => resoudre({ sorte: erreur.code === REFUS ? 'refusee' : 'introuvable' }),
      // Une position de moins de dix minutes suffit : le soleil ne bouge pas si vite.
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 600_000 },
    ),
  )
}
