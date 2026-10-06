import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { avancer, commencer, preparer, servirAelf } from './outils.ts'

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
  await page.getByRole('button', { name: 'Afficher la Lecture' }).click()
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

test('menu', async ({ page }) => {
  await preparer(page)
  await page.goto('/menu')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avec Dieu')
  expect(await violationsGraves(page)).toEqual([])
})

for (const [nom, heure, chemin] of [
  ['accueil, le soir', 21, '/'],
  ['accueil, le jour', 17, '/'],
  ['accueil d’un autre jour', 10, '/jour/2027-02-17'],
] as const) {
  test(nom, async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 5, heure, 0))
    await servirAelf(page)
    await preparer(page)
    await page.goto(chemin)
    await expect(page.getByTestId('bandeau').locator('.bandeau-titre')).toBeVisible()
    expect(await violationsGraves(page)).toEqual([])
  })
}

test('accueil sans réponse de l’AELF', async ({ page }) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
  await preparer(page)
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

for (const office of ['laudes', 'lectures', 'complies']) {
  test(`office : ${office}`, async ({ page }) => {
    await servirAelf(page)
    await preparer(page)
    await page.goto(`/office/${office}/2026-10-06`)
    await expect(page.getByTestId('office')).toBeVisible()
    expect(await violationsGraves(page)).toEqual([])
  })
}

test('office : lien de l’invitatoire, prières courantes en entier, ajouts signalés', async ({
  page,
}) => {
  await servirAelf(page)
  await preparer(page, { reglages: { prieresEntieres: true, plusieurs: true } })
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  await page.goto('/office/lectures/2026-10-06')
  await expect(page.getByRole('button', { name: 'Dire l’invitatoire ici' })).toBeVisible()
  await expect(page.getByTestId('office')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('office injoignable', async ({ page }) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort())
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByRole('alert')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('à propos', async ({ page }) => {
  await preparer(page)
  await page.goto('/a-propos')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avec Dieu')
  expect(await violationsGraves(page)).toEqual([])
})
