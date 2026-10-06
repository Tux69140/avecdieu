import { KeepAwake } from '@capacitor-community/keep-awake'
import { Haptics } from '@capacitor/haptics'
import type { Vibration } from '../chapelet/vibration'

// Ce que le téléphone fait sentir ou maintient pendant la prière. Dans l'APK,
// les greffons Capacitor parlent à Android ; dans un navigateur, ils passent
// par navigator.vibrate et navigator.wakeLock. Un appareil qui ne sait pas
// vibrer ou garder l'écran allumé ne doit jamais interrompre la prière :
// chaque échec est ignoré.

// En millisecondes ; la marquée doit se distinguer sans regarder l'écran.
export const DUREES: Record<Vibration, number> = { courte: 40, marquee: 250 }

export function vibrer(vibration: Vibration) {
  Haptics.vibrate({ duration: DUREES[vibration] }).catch(() => {})
}

// Les demandes passent l'une après l'autre : une libération qui doublerait
// une demande encore en cours laisserait l'écran allumé pour de bon.
let file: Promise<unknown> = Promise.resolve()
const enchainer = (demande: () => Promise<unknown>) => {
  file = file.then(demande).catch(() => {})
}

// Garde l'écran allumé ; la fonction rendue lui rend son comportement normal.
export function garderEcranAllume(): () => void {
  enchainer(() => KeepAwake.keepAwake())
  return () => enchainer(() => KeepAwake.allowSleep())
}
