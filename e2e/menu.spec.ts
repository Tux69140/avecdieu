import { expect } from '@playwright/test'
import { preparer, servirAelf, test } from './outils.ts'

// Le menu ☰ de l'accueil : aujourd'hui, chapelet, réglages, à propos.

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 5, 10, 0))
  await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await page.getByRole('link', { name: 'Menu' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avec Dieu')
})

const accueil = (page: import('@playwright/test').Page) =>
  expect(page.getByTestId('moment')).toBeVisible()

test('présente aujourd’hui, le chapelet, les réglages et « À propos »', async ({ page }) => {
  const menu = page.getByRole('navigation', { name: 'Menu' })
  await expect(menu.getByRole('button', { name: 'Aujourd’hui' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Chapelet' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Réglages' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'À propos' })).toBeVisible()
  await expect(menu.getByRole('link', { name: /Offices/ })).toHaveCount(0)
})

test('le retour d’Android, la croix et « Aujourd’hui » ramènent à l’accueil', async ({ page }) => {
  await page.goBack()
  await accueil(page)
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'Fermer le menu' }).click()
  await accueil(page)
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'Aujourd’hui' }).click()
  await accueil(page)
  await expect(page).toHaveURL('/')
})

test('depuis un autre jour, « Aujourd’hui » ramène à aujourd’hui', async ({ page }) => {
  await page.goBack()
  await page.getByRole('link', { name: /Jour suivant/ }).click()
  await expect(page).toHaveURL('/jour/2026-10-06')
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'Aujourd’hui' }).click()
  await expect(page).toHaveURL('/')
  await accueil(page)
})

test('le chapelet ouvert par le menu ramène à l’accueil', async ({ page }) => {
  await page.getByRole('link', { name: 'Chapelet' }).click()
  await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  await page.goBack()
  await accueil(page)
})

test('depuis les réglages ouverts par le menu, le retour ramène à l’accueil', async ({ page }) => {
  await page.getByRole('link', { name: 'Réglages' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Réglages')
  await page.goBack()
  await accueil(page)
})

test('« À propos » donne la version et les sources des textes', async ({ page }) => {
  await page.getByRole('link', { name: 'À propos' }).click()
  await expect(page.getByText(/^Version \d+\.\d+$/)).toBeVisible()
  await expect(page.getByText('Rien ne quitte votre téléphone', { exact: false })).toBeVisible()
  await expect(page.getByText(/© AELF, Paris/)).toBeVisible()
  await page.getByRole('button', { name: /Retour/ }).click()
  await accueil(page)
})
