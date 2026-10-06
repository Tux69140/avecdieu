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

interface Ouverture {
  // L'aide aux gestes s'affiche-t-elle ? Masquée par défaut dans les parcours.
  aide?: boolean
  affichage?: 'complet' | 'compact'
  lectures?: Record<string, number>
}

// Prépare la mémoire du téléphone avant le premier chargement de la page.
export async function preparer(page: Page, { aide = false, affichage, lectures }: Ouverture = {}) {
  await page.addInitScript(
    ({ aide, affichage, lectures }) => {
      // Seulement au premier chargement : un rechargement garde ce que l'app a retenu.
      if (sessionStorage.getItem('parcours-prepare')) return
      sessionStorage.setItem('parcours-prepare', 'oui')
      if (!aide) localStorage.setItem('avec-dieu.aide-gestes', 'masquee')
      if (affichage) localStorage.setItem('avec-dieu.affichage', affichage)
      if (lectures) localStorage.setItem('avec-dieu.lectures', JSON.stringify(lectures))
    },
    { aide, affichage, lectures },
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

// Étape suivante : un toucher, ou la grosse perle sur l'annonce d'un mystère.
export async function suivant(page: Page) {
  const perle = page.getByRole('button', { name: 'Commencer la dizaine' })
  if (await perle.isVisible()) await perle.click()
  else await toucher(page)
}
