import { expect, type Page } from '@playwright/test'
import { commencer, deplierReglages, preparer, servirAelf, test } from './outils.ts'

// Phase 9 : la veille, aujourd'hui et 7 jours d'avance, enregistrés à chaque
// ouverture avec réseau, pour prier sans réseau. Messages validés par le
// porteur du projet le 2026-10-07.

const MARDI = new Date(2026, 9, 6, 10, 0)
const OFFICES = [
  ['lectures', 'Office des lectures'],
  ['laudes', 'Laudes'],
  ['tierce', 'Tierce'],
  ['sexte', 'Sexte'],
  ['none', 'None'],
  ['vepres', 'Vêpres'],
  ['complies', 'Complies'],
]

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MARDI)
})

// Une première ouverture avec réseau, jusqu'à la réserve complète
// (9 jours de 8 ressources), puis le mode avion.
async function remplirPuisCouper(page: Page) {
  const demandes = await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await expect.poll(() => demandes.length).toBe(72)
  await expect(page.getByTestId('bandeau')).toContainText('S. Bruno')
  await page.unrouteAll()
  await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
  return demandes
}

const alerte = (page: Page) => page.getByRole('alert')

test('en mode avion, les 7 offices du jour s’ouvrent avec tous leurs textes', async ({ page }) => {
  await remplirPuisCouper(page)
  for (const [office, nom] of OFFICES) {
    await page.goto(`/office/${office}/2026-10-06`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(nom)
    await expect(page.getByTestId('office').getByRole('heading', { level: 2 }).first()).toHaveText(
      'Introduction',
    )
    await expect(alerte(page)).toHaveCount(0)
  }
  // L'accueil garde son bandeau, et le chapelet se prie.
  await page.goto('/')
  await expect(page.getByTestId('bandeau')).toContainText('S. Bruno')
  await commencer(page)
})

test('une nouvelle ouverture ne redemande rien de ce qui est enregistré', async ({ page }) => {
  const demandes = await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await expect.poll(() => demandes.length).toBe(72)
  await page.reload()
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  expect(demandes).toHaveLength(72)
  expect(new Set(demandes).size).toBe(72)
})

test('les réglages disent jusqu’à quand on peut prier sans réseau', async ({ page }) => {
  await remplirPuisCouper(page)
  await page.goto('/reglages')
  await deplierReglages(page, 'Offices')
  await expect(page.getByTestId('hors-connexion')).toHaveText(
    'Textes disponibles hors connexion jusqu’au mardi 13 octobre.',
  )
})

test('un office non enregistré : les dates disponibles, et « Réessayer »', async ({ page }) => {
  await remplirPuisCouper(page)
  await page.goto('/office/laudes/2026-10-20')
  await expect(alerte(page)).toHaveText(
    '⚠ Cet office n’est pas enregistré sur le téléphone.' +
      'Les textes enregistrés vont du lundi 5 au mardi 13 octobre. ' +
      'Pour ce jour-ci, connectez-vous à internet, puis réessayez.Réessayer',
  )
})

test('l’accueil d’un jour non enregistré le dit, sans les dates', async ({ page }) => {
  await remplirPuisCouper(page)
  await page.goto('/jour/2026-10-20')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 20 octobre')
  await expect(alerte(page)).toHaveText(
    '⚠ Ce jour n’est pas enregistré. Connectez-vous à internet, puis réessayez. Réessayer',
  )
})

test('premier lancement sans réseau : rien d’enregistré, le chapelet se prie', async ({ page }) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
  await preparer(page)
  await page.goto('/reglages')
  await deplierReglages(page, 'Offices')
  await expect(page.getByTestId('hors-connexion')).toHaveText(
    'Aucun texte enregistré pour l’instant.',
  )
  await page.goto('/')
  await page.getByRole('link', { name: 'Prier le chapelet' }).click()
  await expect(page).toHaveURL('/chapelet')
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
    'Signe de croix',
  )
})

test('l’AELF muette, un office enregistré s’ouvre sans message', async ({ page }) => {
  await remplirPuisCouper(page)
  await page.unrouteAll()
  await page.route('https://api.aelf.org/**', (route) =>
    route.fulfill({ status: 503, body: 'indisponible' }),
  )
  await page.goto('/office/vepres/2026-10-06')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vêpres')
  await expect(page.getByTestId('office')).toBeVisible()
  await expect(alerte(page)).toHaveCount(0)
})
