import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'fr.biovibralyon.avecdieu',
  appName: 'Avec Dieu',
  webDir: 'dist',
  plugins: {
    SystemBars: {
      // L'app s'étend sous les barres d'Android (viewport-fit=cover) et s'en
      // écarte par les jetons --bord-* (jetons.css). 'css' : Capacitor fournit
      // la hauteur des barres en variables CSS, car les WebView antérieures à
      // la version 140 donnent des env(safe-area-inset-*) faux. 'LIGHT' =
      // icônes sombres sur le parchemin, jusqu'au thème nuit (phase 10).
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'LIGHT',
    },
    // Rappels (phase 11) : le grain de l'icône, en or, dans la barre d'état.
    LocalNotifications: {
      smallIcon: 'ic_stat_rappel',
      iconColor: '#B08A3E',
    },
  },
}

export default config
