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
  for (const [i, [nom, vue, dite]] of DUREES.entries()) {
    const lien = offices.getByRole('link').nth(i)
    await expect(lien.getByTestId('duree')).toHaveText(new RegExp(`^${vue}`))
    await expect(lien).toHaveAccessibleName(new RegExp(`^${nom}.*, ${dite}`))
    await surUneLigne(lien)
  }
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
  await page.getByRole('button', { name: 'Offices du jour' }).click()
  await verifierLignes(
    page.getByRole('list', { name: 'Offices du jour' }),
    page.getByRole('list', { name: 'Chapelet et prières' }).getByRole('link').first(),
  )
  await expect(page.getByTestId('duree')).toHaveCount(9)
})

// Phase 17 : chaque forme porte sa durée dans le commutateur, sous son nom.
test('le seuil donne la durée du chapelet et du Rosaire dans le commutateur', async ({ page }) => {
  await page.goto('/chapelet')
  const commutateur = page.getByRole('radiogroup', { name: 'Chapelet ou Rosaire' })
  await expect(page.getByTestId('duree')).toHaveCount(2)
  for (const [nom, vue, dite] of [
    ['Chapelet', '20 min', 'vingt minutes'],
    ['Rosaire', '~1 h 45', 'environ une heure quarante-cinq'],
  ]) {
    const forme = commutateur.getByRole('radio', { name: new RegExp(`^${nom}`) })
    await expect(forme).toHaveAccessibleName(new RegExp(`^${nom}\\s*, ${dite}$`))
    const duree = forme.getByTestId('duree')
    await expect(duree.locator('[aria-hidden="true"]')).toHaveText(vue)
    // La durée sous le mot, dans le bouton.
    const mot = (await forme.locator('.seuil-forme-nom').boundingBox())!
    const boite = (await duree.boundingBox())!
    expect(boite.y).toBeGreaterThanOrEqual(mot.y + mot.height - 1)
    expect(boite.y + boite.height).toBeLessThanOrEqual(
      (await forme.boundingBox())!.y + (await forme.boundingBox())!.height,
    )
  }
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
