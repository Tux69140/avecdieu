import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'fr.biovibralyon.avecdieu',
  appName: 'Avec Dieu',
  webDir: 'dist',
  plugins: {
    SystemBars: {
      // L'app s'étend sous les barres d'Android (viewport-fit=cover) et s'en
      // écarte par env(safe-area-inset-*) ; 'LIGHT' = icônes sombres sur le
      // parchemin, jusqu'au thème nuit (phase 10).
      insetsHandling: 'native',
      initialViewportFitValueHint: 'cover',
      style: 'LIGHT',
    },
  },
}

export default config
