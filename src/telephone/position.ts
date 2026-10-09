import { registerPlugin } from '@capacitor/core'
import type { Lieu } from '../office/soleil'

// La position du téléphone, approximative seule, bien assez pour les heures du
// soleil : sur Android par le greffon propre à l'app (android/…/Position.java),
// qui reprend la dernière position connue quand elle est récente ; dans un
// navigateur, par sa géolocalisation. Elle ne quitte jamais le téléphone et
// n'est jamais écrite dans un journal (.claude/rules/securite.md).

export type Localisation =
  | { sorte: 'trouvee'; position: Lieu }
  // Android refuse l'accès à la position.
  | { sorte: 'refusee' }
  // Localisation éteinte, pas de signal, ou trop longue à venir.
  | { sorte: 'introuvable' }

interface ReponseNative {
  sorte: Localisation['sorte']
  latitude?: number
  longitude?: number
}

const REFUS = 1

const Position = registerPlugin<{ localiser(): Promise<ReponseNative> }>('Position', {
  web: { localiser: localiserDansLeNavigateur },
})

export async function localiser(): Promise<Localisation> {
  const { sorte, latitude, longitude } = await Position.localiser()
  if (sorte !== 'trouvee') return { sorte }
  if (latitude === undefined || longitude === undefined) return { sorte: 'introuvable' }
  return { sorte, position: { latitude, longitude } }
}

function localiserDansLeNavigateur(): Promise<ReponseNative> {
  const geolocalisation = navigator.geolocation
  if (!geolocalisation) return Promise.resolve({ sorte: 'introuvable' })
  return new Promise((resoudre) =>
    geolocalisation.getCurrentPosition(
      ({ coords }) =>
        resoudre({ sorte: 'trouvee', latitude: coords.latitude, longitude: coords.longitude }),
      (erreur) => resoudre({ sorte: erreur.code === REFUS ? 'refusee' : 'introuvable' }),
      // Une position de moins de dix minutes suffit : le soleil ne bouge pas si vite.
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 600_000 },
    ),
  )
}
