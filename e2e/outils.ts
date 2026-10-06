import { expect, type Page } from '@playwright/test'

// Gestes et ouvertures partagés par les parcours.

// Un toucher n'importe où : ici, au tiers bas de l'écran.
export async function toucher(page: Page) {
  const { width, height } = page.viewportSize()!
  await page.touchscreen.tap(width / 2, (height * 2) / 3)
}

// Glissement au doigt, de vrais événements tactiles, horizontal (dx) ou vertical (dy).
export async function glisser(page: Page, dx: number, y = page.viewportSize()!.height / 2, dy = 0) {
  const { width } = page.viewportSize()!
  const cdp = await page.context().newCDPSession(page)
  const x0 = width / 2 - dx / 2
  const y0 = y - dy / 2
  const point = (i: number) => [{ x: x0 + (dx * i) / 8, y: y0 + (dy * i) / 8 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(0) })
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(i) })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

export interface Reglages {
  annonce?: boolean
  oMonJesus?: boolean
  salveRegina?: boolean
  plusieurs?: boolean
  affichage?: 'complet' | 'compact'
  vibrations?: boolean
}

interface Ouverture {
  // L'aide aux gestes s'affiche-t-elle ? Masquée par défaut dans les parcours.
  aide?: boolean
  affichage?: 'complet' | 'compact'
  reglages?: Reglages
  lectures?: Record<string, number>
}

// Prépare la mémoire du téléphone avant le premier chargement de la page.
export async function preparer(
  page: Page,
  { aide = false, affichage, reglages = {}, lectures }: Ouverture = {},
) {
  const tous = affichage ? { ...reglages, affichage } : reglages
  await page.addInitScript(
    ({ aide, tous, lectures }) => {
      // Seulement au premier chargement : un rechargement garde ce que l'app a retenu.
      if (sessionStorage.getItem('parcours-prepare')) return
      sessionStorage.setItem('parcours-prepare', 'oui')
      if (!aide) localStorage.setItem('avec-dieu.aide-gestes', 'masquee')
      if (Object.keys(tous).length > 0)
        localStorage.setItem('avec-dieu.reglages', JSON.stringify(tous))
      if (lectures) localStorage.setItem('avec-dieu.lectures', JSON.stringify(lectures))
    },
    { aide, tous, lectures },
  )
}

// Ouvre le seuil puis commence le chapelet.
export async function commencer(page: Page, chemin = '/chapelet', ouverture: Ouverture = {}) {
  await preparer(page, ouverture)
  await page.goto(chemin)
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
    'Signe de croix',
  )
}

// Avance de plusieurs étapes, en attendant chacune : un toucher donné avant que
// l'annonce soit affichée tomberait à côté de sa grosse perle.
export async function avancer(page: Page, fois: number) {
  const chapelet = page.locator('main.chapelet')
  for (let i = 0; i < fois; i++) {
    const pas = Number(await chapelet.getAttribute('data-pas'))
    await suivant(page)
    await expect(chapelet).toHaveAttribute('data-pas', String(pas + 1))
  }
}

// Étape suivante : un toucher, ou la grosse perle sur l'annonce d'un mystère.
export async function suivant(page: Page) {
  const perle = page.getByRole('button', { name: 'Commencer la dizaine' })
  if (await perle.isVisible()) await perle.click()
  else await toucher(page)
}

// Le navigateur de test ne vibre pas et n'a pas d'écran à garder allumé : on
// remplace navigator.vibrate et navigator.wakeLock par des espions, que les
// greffons Capacitor appellent hors de l'APK.
declare global {
  interface Window {
    __journal: string[]
  }
}

export async function espionner(page: Page) {
  await page.addInitScript(() => {
    window.__journal = []
    const journal = window.__journal
    Object.defineProperty(navigator, 'vibrate', {
      value: (motif: number[]) => {
        journal.push(`vibre ${[motif].flat().join(',')}`)
        return true
      },
    })
    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: async () => {
          journal.push('écran allumé')
          return {
            release: async () => {
              journal.push('écran libre')
            },
          }
        },
      },
    })
  })
}

export const journal = (page: Page) => page.evaluate(() => window.__journal)
