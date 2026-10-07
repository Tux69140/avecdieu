import { SystemBars, SystemBarsStyle } from '@capacitor/core'

// Les icônes des barres d'Android (heure, batterie, boutons) : sombres sur le
// parchemin, claires sur le fond de nuit. Hors de l'APK, rien à faire.
export function accorderLesBarres(nuit: boolean) {
  SystemBars.setStyle({ style: nuit ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(
    () => {},
  )
}
