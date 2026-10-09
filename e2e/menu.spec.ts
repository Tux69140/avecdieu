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

// L'accueil se reconnaît à son bandeau du jour (la prière du moment n'a de
// badge qu'à ses heures).
const accueil = (page: import('@playwright/test').Page) =>
  expect(page.getByTestId('bandeau')).toBeVisible()

// L'ordre choisi par le porteur du projet (2026-10-08) ; les offices et les
// autres prières sur leur page, plus en repli (2026-10-09).
test('présente, dans l’ordre, le Chapelet, le Rosaire, deux prières, puis les pages des offices et des prières', async ({
  page,
}) => {
  const menu = page.getByRole('navigation', { name: 'Menu' })
  await expect(menu.getByRole('link').or(menu.getByRole('button'))).toHaveText([
    'Aujourd’hui',
    /^Chapelet/,
    /^Rosaire/,
    'Je vous salue Marie',
    'Notre Père',
    /^Offices du jour/,
    'Prières',
    'Réglages',
    'A propos',
  ])
  await expect(page.getByRole('link', { name: /^Laudes/ })).toHaveCount(0)
  // La date des offices se voit sous leur nom ; leur page la redit sous son titre.
  const offices = menu.getByRole('link', { name: /^Offices du jour/ })
  await expect(offices).toContainText('lundi 5 octobre')
  await offices.click()
  await expect(page).toHaveURL('/menu/offices')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offices du jour')
  await expect(page.getByText('lundi 5 octobre')).toBeVisible()
  await expect(page.getByRole('list', { name: 'Offices du jour' }).getByRole('link')).toHaveCount(7)
  // La croix remonte au menu, comme le retour d'Android.
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(page).toHaveURL('/menu')
  await menu.getByRole('link', { name: 'Prières', exact: true }).click()
  await expect(page).toHaveURL('/menu/prieres')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prières')
  const prieres = page.getByRole('navigation', { name: 'Prières' })
  await expect(prieres.getByRole('link')).toHaveText([
    'Je crois en Dieu',
    'Gloire au Père',
    'Salve Regina',
    'Je confesse à Dieu',
  ])
})

test('une prière ouverte par le menu se dit seule, puis ramène à l’accueil', async ({ page }) => {
  await page.getByRole('link', { name: 'Notre Père' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notre Père')
  await expect(page.getByTestId('strophe').first()).toContainText('Notre Père, qui es aux cieux')
  await expect(page.getByTestId('marque-V')).toHaveCount(0)
  await page.goBack()
  await accueil(page)
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('link', { name: 'Prières', exact: true }).click()
  await page.goBack()
  await expect(page).toHaveURL('/menu')
  await page.getByRole('link', { name: 'Prières', exact: true }).click()
  await page.getByRole('link', { name: 'Je confesse à Dieu' }).click()
  await expect(page).toHaveURL('/priere/je-confesse')
  // « tout-puissant » ne se coupe pas : un liant invisible suit le trait d'union.
  await expect(page.getByTestId('strophe')).toContainText(/^Je confesse à Dieu tout-⁠?puissant/)
  // Le menu et sa page ont été remplacés : le retour ramène à l'accueil.
  await page.goBack()
  await accueil(page)
})

test('un office choisi dans la page des offices : le retour ramène à l’accueil', async ({
  page,
}) => {
  await page.getByRole('link', { name: /^Offices du jour/ }).click()
  await page.getByRole('link', { name: /^Vêpres/ }).click()
  await expect(page).toHaveURL('/office/vepres/2026-10-05')
  await page.goBack()
  await accueil(page)
  await expect(page).toHaveURL('/')
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

test('« A propos » donne la version et les sources des textes', async ({ page }) => {
  await page.getByRole('link', { name: 'A propos' }).click()
  await expect(page.getByText(/^Version \d+\.\d+$/)).toBeVisible()
  await expect(page.getByText('Rien ne quitte votre téléphone', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Textes' }).click()
  await expect(page.getByText(/© AELF, Paris/)).toBeVisible()
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await accueil(page)
})

test('le Chapelet, le Rosaire et deux prières forment un groupe, séparé par un filet d’or', async ({
  page,
}) => {
  const chapelet = page.getByRole('list', { name: 'Chapelet et prières' })
  await expect(chapelet.getByRole('link')).toHaveCount(4)
  await expect(chapelet.getByRole('link').first()).toHaveAccessibleName(
    /^Chapelet\s*vers 20 h\s*, vingt minutes$/,
  )
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
  const lignes = page.getByRole('navigation', { name: 'Menu' }).locator('a:visible, button:visible')
  await expect(lignes).toHaveCount(9)
  for (const ligne of await lignes.all()) {
    // La ligne des offices porte la date sous leur nom : un peu plus haute.
    expect((await ligne.boundingBox())!.height).toBeGreaterThanOrEqual(48)
    expect((await ligne.boundingBox())!.height).toBeLessThanOrEqual(56)
  }
  const graisse = (l: import('@playwright/test').Locator) =>
    l.evaluate((e) => getComputedStyle(e).fontWeight)
  expect(await graisse(page.getByRole('link', { name: 'Réglages' }))).toBe('400')
  expect(await graisse(page.getByRole('button', { name: 'Aujourd’hui' }))).toBe('400')
  expect(await graisse(page.getByRole('link', { name: /^Offices du jour/ }))).toBe('400')
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(780)
  await page.getByRole('link', { name: /^Offices du jour/ }).click()
  expect(await graisse(page.getByRole('link', { name: /^Laudes/ }))).toBe('400')
  expect((await page.getByRole('link', { name: /^Laudes/ }).boundingBox())!.height).toBe(48)
})

test('le chevron › ne se lit pas dans le nom des lignes', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Réglages' })).toHaveAccessibleName('Réglages')
  await expect(page.getByRole('button', { name: 'Aujourd’hui' })).toHaveAccessibleName(
    'Aujourd’hui',
  )
  await page.getByRole('link', { name: /^Offices du jour/ }).click()
  await expect(page.getByRole('link', { name: /^Laudes/ })).toHaveAccessibleName(
    /^Laudes\s*7 h\s*, environ vingt minutes$/,
  )
})
