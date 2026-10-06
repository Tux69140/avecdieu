import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Contrôle automatique d'accessibilité (contrastes, titres, libellés ARIA) :
// échoue sur toute violation grave ou critique. Le clavier et le lecteur
// d'écran restent à vérifier à la main.
async function violationsGraves(page: Page) {
  // Un texte en plein fondu d'apparition n'a pas encore son contraste final.
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
  const { violations } = await new AxeBuilder({ page }).analyze()
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} : ${v.help} (${v.nodes.length} élément(s))`)
}

async function avancer(page: Page, fois: number) {
  for (let i = 0; i < fois; i++) await page.keyboard.press('Space')
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 5, 10, 0))
  await page.goto('/chapelet')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Signe de croix')
})

test('écran du chapelet, au signe de croix', async ({ page }) => {
  expect(await violationsGraves(page)).toEqual([])
})

test('écran du chapelet, pendant une dizaine', async ({ page }) => {
  await avancer(page, 10)
  await expect(page.getByTestId('mystere')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('écran de fin du chapelet', async ({ page }) => {
  await avancer(page, 67)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  expect(await violationsGraves(page)).toEqual([])
})
