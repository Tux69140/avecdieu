import { expect, type Page } from '@playwright/test'
import { deplierReglages, preparer, servirAelf, test } from './outils.ts'

// Pour qui découvre l'office (2026-10-08) : le répons de l'intercession redit
// après chaque intention (R12), les consignes en rouge (R13) et la fenêtre
// « Lire un office ».

const MARDI = new Date(2026, 9, 6, 10, 0)
const ROUGE_RUBRIQUE = 'rgb(158, 42, 31)'

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MARDI)
})

const partie = (page: Page, libelle: string) =>
  page
    .getByTestId('office')
    .locator('section')
    .filter({ has: page.getByRole('heading', { level: 2, name: libelle, exact: true }) })
const consignes = (page: Page) => page.getByTestId('office').locator('.office-rubrique')
const aide = (page: Page) => page.getByRole('dialog', { name: 'Lire un office' })

test('le répons de l’intercession revient après chaque intention, en italique', async ({
  page,
}) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  const intercession = partie(page, 'Intercession')
  // Une fois après l'invitation, puis après chacune des cinq intentions.
  await expect(intercession.getByRole('img', { name: 'Répons' })).toHaveCount(6)
  const redits = intercession.locator('.bloc[data-reprise="oui"]')
  await expect(redits).toHaveCount(5)
  await expect(redits.first()).toHaveText(/Seigneur\.$/)
  await expect(redits.first()).toHaveCSS('font-style', 'italic')
})

test('les consignes en rouge, et le réglage qui les masque', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  await expect(consignes(page)).toHaveText([
    'On la répète aussitôt.',
    'On reprend l’antienne.',
    'On répond après chaque intention :',
  ])
  await expect(consignes(page).first()).toHaveCSS('color', ROUGE_RUBRIQUE)

  await page.goto('/reglages')
  await deplierReglages(page, 'Offices')
  await page.getByRole('switch', { name: 'Consignes pour débuter' }).click()
  await page.goto('/office/vepres/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  await expect(consignes(page)).toHaveCount(0)
})

test('« Lire un office » s’ouvre à l’office, et « Ne plus afficher » l’écarte', async ({
  page,
}) => {
  await servirAelf(page)
  await preparer(page, { aide: true })
  await page.goto('/office/complies/2026-10-06')
  await expect(aide(page)).toBeVisible()
  await expect(aide(page).getByRole('listitem')).toHaveCount(8)
  await expect(aide(page)).toContainText('La perle entre deux parties')
  await aide(page).getByRole('button', { name: 'J’ai compris' }).click()
  await expect(aide(page)).toHaveCount(0)

  // Elle revient au prochain office, tant qu'elle n'est pas écartée.
  await page.goto('/office/laudes/2026-10-06')
  await expect(aide(page)).toBeVisible()
  await aide(page).getByRole('checkbox', { name: 'Ne plus afficher' }).check()
  await aide(page).getByRole('button', { name: 'J’ai compris' }).click()
  await expect(aide(page)).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('avec-dieu.aide-office')))
    .toBe('masquee')
  await page.goto('/office/vepres/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  await expect(aide(page)).toHaveCount(0)

  // Le réglage la rétablit.
  await page.goto('/reglages')
  await deplierReglages(page, 'Offices')
  const reglage = page.getByRole('switch', { name: 'Aide à la lecture' })
  await expect(reglage).toHaveAttribute('aria-checked', 'false')
  await reglage.click()
  await page.goto('/office/vepres/2026-10-06')
  await expect(aide(page)).toBeVisible()
})

test('l’aide n’explique que ce qui se voit', async ({ page }) => {
  await servirAelf(page)
  await preparer(page, {
    aide: true,
    reglages: { accents: false, signalerAjouts: false, prieresEntieres: true },
  })
  await page.goto('/office/laudes/2026-10-06')
  await expect(aide(page).getByRole('listitem')).toHaveCount(6)
  await expect(aide(page)).not.toContainText('syllabe soulignée')
  await expect(aide(page)).not.toContainText('filet rouge')
  await expect(aide(page)).not.toContainText('en entier')
})
