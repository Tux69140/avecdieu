import { KeepAwake } from '@capacitor-community/keep-awake'
import { registerPlugin } from '@capacitor/core'
import { useEffect, useState } from 'react'
import type { Vibration } from '../chapelet/vibration'

// Ce que le téléphone fait sentir ou maintient pendant la prière. Dans l'APK,
// les greffons Capacitor parlent à Android ; dans un navigateur, ils passent
// par navigator.vibrate et navigator.wakeLock. Un appareil qui ne sait pas
// vibrer ou garder l'écran allumé ne doit jamais interrompre la prière :
// chaque échec est ignoré.

// En millisecondes ; la marquée doit se distinguer sans regarder l'écran.
export const DUREES: Record<Vibration, number> = { courte: 40, marquee: 250 }

// Greffon propre à l'app (android/…/Vibreur.java) : il vibre même quand la
// vibration au toucher est coupée dans les réglages d'Android.
interface GreffonVibreur {
  vibrer(options: { duree: number }): Promise<void>
  peutVibrer(): Promise<{ oui: boolean }>
}

const Vibreur = registerPlugin<GreffonVibreur>('Vibreur', {
  web: {
    vibrer: async ({ duree }: { duree: number }) => {
      navigator.vibrate?.([duree])
    },
    peutVibrer: async () => ({ oui: typeof navigator.vibrate === 'function' }),
  },
})

export function vibrer(vibration: Vibration) {
  Vibreur.vibrer({ duree: DUREES[vibration] }).catch(() => {})
}

// L'appareil a-t-il un vibreur ? Demandé une fois ; dans le doute, oui.
let reponseVibreur: Promise<boolean> | undefined
export function peutVibrer(): Promise<boolean> {
  reponseVibreur ??= Vibreur.peutVibrer()
    .then(({ oui }) => oui)
    .catch(() => true)
  return reponseVibreur
}

// Pour les écrans : faux tant que la réponse n'est pas venue, pour ne jamais
// montrer un réglage qui disparaîtrait aussitôt.
export function usePeutVibrer(): boolean {
  const [oui, setOui] = useState(false)
  useEffect(() => {
    let actif = true
    peutVibrer().then((reponse) => actif && setOui(reponse))
    return () => {
      actif = false
    }
  }, [])
  return oui
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
