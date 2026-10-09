import { expect, type Locator } from '@playwright/test'
import { preparer, servirAelf, test } from './outils.ts'

// Phase 15 : la durée de chaque prière, sur l'accueil, dans le menu et sur le
// seuil du chapelet (US-59), nulle part ailleurs. À 360 px, à l'heure des
// complies (leur ligne porte alors le badge « Prière du moment ») : aucune
// ligne ne passe à la ligne.

const DUREES: [string, string, string][] = [
  ['Office des lectures', '~20 min', 'environ vingt minutes'],
  ['Laudes', '~20 min', 'environ vingt minutes'],
  ['Tierce', '~10 min', 'environ dix minutes'],
  ['Sexte', '~10 min', 'environ dix minutes'],
  ['None', '~10 min', 'environ dix minutes'],
  ['Vêpres', '~20 min', 'environ vingt minutes'],
  ['Complies', '~15 min', 'environ quinze minutes'],
]

test.use({ viewport: { width: 360, height: 780 } })

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 6, 21, 15))
  await servirAelf(page)
  await preparer(page)
})

// Chaque ligne garde ses 48 px, et rien n'y dépasse à droite.
async function surUneLigne(lien: Locator) {
  const boite = (await lien.boundingBox())!
  expect(boite.height).toBe(48)
  const quand = (await lien.getByTestId('duree').boundingBox())!
  expect(quand.x + quand.width).toBeLessThanOrEqual(boite.x + boite.width)
  expect(await lien.evaluate((l) => l.scrollWidth <= l.clientWidth)).toBe(true)
}

async function verifierLignes(offices: Locator, chapelet: Locator) {
  await verifierOffices(offices)
  await verifierChapelet(chapelet)
}

async function verifierOffices(offices: Locator) {
  for (const [i, [nom, vue, dite]] of DUREES.entries()) {
    const lien = offices.getByRole('link').nth(i)
    await expect(lien.getByTestId('duree')).toHaveText(new RegExp(`^${vue}`))
    await expect(lien).toHaveAccessibleName(new RegExp(`^${nom}.*, ${dite}`))
    await surUneLigne(lien)
  }
}

async function verifierChapelet(chapelet: Locator) {
  await expect(chapelet.getByTestId('duree')).toHaveText(/^20 min/)
  await expect(chapelet).toHaveAccessibleName(/^Chapelet\s*vers 20 h\s*, vingt minutes$/)
  await surUneLigne(chapelet)
  // Le Rosaire, sans heure (phase 18), juste après le Chapelet.
  const rosaire = chapelet.locator('xpath=ancestor::li[1]/following-sibling::li[1]//a')
  await expect(rosaire.getByTestId('duree')).toHaveText(/^~1 h 45/)
  await expect(rosaire).toHaveAccessibleName(/^Rosaire\s*, environ une heure quarante-cinq$/)
  await surUneLigne(rosaire)
}

test('l’accueil donne la durée de chaque office et du chapelet', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('moment')).toHaveAccessibleName(/^Complies/)
  await verifierLignes(
    page.getByRole('list', { name: 'Offices du jour' }),
    page.getByRole('list', { name: 'Chapelet et Rosaire' }).getByRole('link').first(),
  )
  await expect(page.getByTestId('duree')).toHaveCount(9)
})

test('le menu donne la durée des offices et du chapelet, et tient en un écran', async ({
  page,
}) => {
  await page.goto('/menu')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avec Dieu')
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(780)
  await verifierChapelet(
    page.getByRole('list', { name: 'Chapelet et prières' }).getByRole('link').first(),
  )
  await expect(page.getByTestId('duree')).toHaveCount(2)
  // Les offices ont leur page (2026-10-09).
  await page.getByRole('link', { name: /^Offices du jour/ }).click()
  await verifierOffices(page.getByRole('list', { name: 'Offices du jour' }))
  await expect(page.getByTestId('duree')).toHaveCount(7)
})

// Chaque seuil donne sa durée sous son titre (deux seuils distincts, révisé
// le 2026-10-09 ; détail dans e2e/seuil.spec.ts).
for (const [chemin, vue, dite] of [
  ['/chapelet', '20 min', 'vingt minutes'],
  ['/rosaire', '~1 h 45', 'environ une heure quarante-cinq'],
])
  test(`le seuil ${chemin} donne sa durée sous le titre`, async ({ page }) => {
    await page.goto(chemin)
    const duree = page.getByTestId('duree')
    await expect(duree).toHaveCount(1)
    await expect(duree).toHaveText(`${vue}, ${dite}`)
  })

test('l’office ouvert et le chapelet commencé ne donnent pas de durée', async ({ page }) => {
  await page.goto('/office/complies/2026-10-06')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByTestId('duree')).toHaveCount(0)
  await page.goto('/chapelet')
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  await expect(page.getByTestId('priere')).toBeVisible()
  await expect(page.getByTestId('duree')).toHaveCount(0)
})
