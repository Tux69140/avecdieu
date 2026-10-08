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
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
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
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await accueil(page)
})

test('le chapelet forme son groupe, sous les offices, séparé par un filet d’or', async ({
  page,
}) => {
  const offices = page.getByRole('list', { name: 'Offices du jour' })
  await expect(offices.getByRole('link')).toHaveCount(7)
  await expect(offices.getByRole('link', { name: /Chapelet/ })).toHaveCount(0)
  const chapelet = page.getByRole('list', { name: 'Chapelet' })
  await expect(chapelet.getByRole('link')).toHaveAccessibleName(/^Chapelet\s*20 h$/)
  const filet = await chapelet.evaluate((ul) => {
    const temoin = document.createElement('i')
    temoin.style.color = getComputedStyle(document.documentElement).getPropertyValue('--or')
    document.body.append(temoin)
    const or = getComputedStyle(temoin).color
    temoin.remove()
    return { trait: getComputedStyle(ul).borderTopColor, or }
  })
  expect(filet.trait).toBe(filet.or)
})

test('des lignes de 48 px en graisse normale, le tout sur un seul écran', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  const lignes = page.getByRole('navigation', { name: 'Menu' }).locator('a, button')
  await expect(lignes).toHaveCount(11)
  for (const ligne of await lignes.all()) {
    expect((await ligne.boundingBox())!.height).toBe(48)
  }
  const graisse = (l: import('@playwright/test').Locator) =>
    l.evaluate((e) => getComputedStyle(e).fontWeight)
  expect(await graisse(page.getByRole('link', { name: 'Réglages' }))).toBe('400')
  expect(await graisse(page.getByRole('button', { name: 'Aujourd’hui' }))).toBe('400')
  expect(await graisse(page.getByRole('link', { name: /^Laudes/ }))).toBe('400')
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(780)
})

test('le chevron › ne se lit pas dans le nom des lignes', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Réglages' })).toHaveAccessibleName('Réglages')
  await expect(page.getByRole('button', { name: 'Aujourd’hui' })).toHaveAccessibleName(
    'Aujourd’hui',
  )
  await expect(page.getByRole('link', { name: /^Laudes/ })).toHaveAccessibleName(/^Laudes\s*7 h$/)
})
