import { expect, test } from '@playwright/test'
import { preparer } from './outils.ts'

// Le menu ☰ du seuil : chapelet, offices, réglages, à propos.

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 5, 10, 0))
  await preparer(page)
  await page.goto('/chapelet')
  await page.getByRole('link', { name: 'Menu' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avec Dieu')
})

const seuil = (page: import('@playwright/test').Page) =>
  expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()

test('présente le chapelet, les offices, les réglages et « À propos »', async ({ page }) => {
  const menu = page.getByRole('navigation', { name: 'Menu' })
  await expect(menu.getByRole('button', { name: 'Chapelet' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Offices' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Réglages' })).toBeVisible()
  await expect(menu.getByRole('link', { name: 'À propos' })).toBeVisible()
})

test('le retour d’Android, la croix et « Chapelet » ramènent au seuil', async ({ page }) => {
  await page.goBack()
  await seuil(page)
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'Fermer le menu' }).click()
  await seuil(page)
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'Chapelet' }).click()
  await seuil(page)
})

test('depuis les réglages ouverts par le menu, le retour ramène au seuil', async ({ page }) => {
  await page.getByRole('link', { name: 'Réglages' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Réglages')
  await page.goBack()
  await seuil(page)
})

test('« À propos » donne la version et les sources des textes', async ({ page }) => {
  await page.getByRole('link', { name: 'À propos' }).click()
  await expect(page.getByText(/^Version \d+\.\d+$/)).toBeVisible()
  await expect(page.getByText('Rien ne quitte votre téléphone', { exact: false })).toBeVisible()
  await expect(page.getByText(/© AELF, Paris/)).toBeVisible()
  await page.getByRole('button', { name: /Retour/ }).click()
  await seuil(page)
})
