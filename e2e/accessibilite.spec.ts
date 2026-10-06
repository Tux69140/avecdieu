import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { commencer, preparer, suivant } from './outils.ts'

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
  for (let i = 0; i < fois; i++) await suivant(page)
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 5, 10, 0))
})

test('seuil du chapelet', async ({ page }) => {
  await preparer(page)
  await page.goto('/chapelet')
  await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('aide aux gestes', async ({ page }) => {
  await preparer(page, { aide: true })
  await page.goto('/chapelet')
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  await expect(page.getByRole('dialog', { name: 'Prier avec l’app' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('écran du chapelet, au signe de croix', async ({ page }) => {
  await commencer(page)
  expect(await violationsGraves(page)).toEqual([])
})

test('annonce d’un mystère', async ({ page }) => {
  await commencer(page)
  await avancer(page, 7)
  await expect(page.getByTestId('annonce')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('écran du chapelet, pendant une dizaine', async ({ page }) => {
  await commencer(page)
  await avancer(page, 10)
  await expect(page.getByTestId('mystere')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('mode compact, prière et passage dépliés', async ({ page }) => {
  await commencer(page, '/chapelet', { affichage: 'compact' })
  await avancer(page, 8)
  await page.getByRole('button', { name: 'Voir la prière' }).click()
  await page.getByRole('button', { name: 'Lire le passage' }).click()
  await expect(page.getByTestId('passage')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('écran de fin du chapelet', async ({ page }) => {
  await commencer(page)
  await avancer(page, 78)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  expect(await violationsGraves(page)).toEqual([])
})

test('écran des réglages', async ({ page }) => {
  await preparer(page)
  await page.goto('/reglages')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Réglages')
  expect(await violationsGraves(page)).toEqual([])
})

test('seuil d’un chapelet en cours', async ({ page }) => {
  await commencer(page)
  await avancer(page, 10)
  await page.goBack()
  await expect(page.getByRole('button', { name: 'Recommencer du début' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('prier à plusieurs, V/ et R/', async ({ page }) => {
  await commencer(page, '/chapelet', { reglages: { plusieurs: true } })
  await avancer(page, 3)
  await expect(page.getByTestId('marque-R')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})
