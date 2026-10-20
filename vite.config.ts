/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// La version affichée dans « À propos » est celle de package.json, la même
// que celle de l'APK (scripts/fabriquer-apk.sh).
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// Les polices de l'accueil, demandées dès la page ouverte : sans cela, le
// navigateur ne les découvre qu'au premier texte dessiné, et l'accueil attend
// leur chargement au démarrage (mesuré sur le téléphone, 2026-10-20).
const POLICES_DE_L_ACCUEIL =
  /^assets\/(baumans-latin-400|cormorant-sc-latin-[456]00|literata-latin-opsz)-normal-.*\.woff2$/

const prechargerLesPolices = (): Plugin => ({
  name: 'precharger-les-polices',
  transformIndexHtml: (_, { bundle }) =>
    Object.keys(bundle ?? {})
      .filter((fichier) => POLICES_DE_L_ACCUEIL.test(fichier))
      .map((fichier) => ({
        tag: 'link',
        attrs: {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: `/${fichier}`,
          crossorigin: '',
        },
        injectTo: 'head',
      })),
})

export default defineConfig({
  plugins: [react(), prechargerLesPolices()],
  define: { __VERSION__: JSON.stringify(version) },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
  },
})
