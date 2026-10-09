import { expect, type Page } from '@playwright/test'
import { preparer, test } from './outils.ts'

// Phase 17 : le seuil réorganisé (organisation validée par le porteur du
// projet, 2026-10-08). Le choix Chapelet / Rosaire en premier, retenu ; ce
// qu'on va prier et le bouton dans le premier écran ; dessous, les choix pour
// prier, les autres séries en lignes directes et les prières du chapelet.

const JEUDI = new Date(2026, 9, 8, 10, 0)
const titre = (page: Page) => page.getByRole('heading', { level: 1 })
const commutateur = (page: Page) => page.getByRole('radiogroup', { name: 'Chapelet ou Rosaire' })
const forme = (page: Page, nom: 'Chapelet' | 'Rosaire') =>
  commutateur(page).getByRole('radio', { name: new RegExp(`^${nom}`) })

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(JEUDI)
})

test('le Rosaire choisi est retenu, et le chapelet de même', async ({ page }) => {
  await preparer(page)
  await page.goto('/')
  await page.goto('/chapelet')
  await expect(titre(page)).toHaveText('Mystères lumineux')
  await expect(forme(page, 'Chapelet')).toHaveAttribute('aria-checked', 'true')

  await forme(page, 'Rosaire').click()
  await expect(page).toHaveURL(/\/rosaire$/)
  await expect(titre(page)).toHaveText('Rosaire')
  await expect(forme(page, 'Rosaire')).toHaveAttribute('aria-checked', 'true')
  // Le seuil a changé de place, sans s'empiler : un retour ramène à l'accueil.
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)

  // Retenu après redémarrage : le chapelet du jour ouvre le Rosaire.
  await page.goto('/chapelet')
  await expect(page).toHaveURL(/\/rosaire$/)
  await page.reload()
  await expect(titre(page)).toHaveText('Rosaire')

  await forme(page, 'Chapelet').click()
  await expect(page).toHaveURL(/\/chapelet$/)
  await expect(titre(page)).toHaveText('Mystères lumineux')
  await page.reload()
  await expect(titre(page)).toHaveText('Mystères lumineux')
  await expect(forme(page, 'Chapelet')).toHaveAttribute('aria-checked', 'true')
})

test('le Rosaire liste ses quatre séries, sans autres mystères à choisir', async ({ page }) => {
  await preparer(page, { reglages: { forme: 'rosaire' } })
  await page.goto('/rosaire')
  await expect(titre(page)).toHaveText('Rosaire')
  await expect(
    page.getByRole('list', { name: 'Les quatre séries' }).getByRole('listitem'),
  ).toHaveText(['Mystères joyeux', 'Mystères lumineux', 'Mystères douloureux', 'Mystères glorieux'])
  await expect(page.getByRole('button', { name: 'Commencer le Rosaire' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Prier d’autres mystères' })).toHaveCount(0)
  // Les choix pour prier restent, comme au chapelet.
  await expect(page.getByRole('radiogroup', { name: 'Affichage des prières' })).toBeVisible()
  await expect(page.getByRole('switch', { name: /Prier à plusieurs/ })).toBeVisible()
  // Au Rosaire, le lien porte son nom (décision du porteur du projet, 2026-10-09).
  await expect(page.getByRole('link', { name: 'Prières du Rosaire' })).toBeVisible()
})

test('de haut en bas, dans l’ordre validé', async ({ page }) => {
  await preparer(page)
  await page.goto('/chapelet')
  await expect(titre(page)).toHaveText('Mystères lumineux')
  const haut = async (element: ReturnType<Page['locator']>) => (await element.boundingBox())!.y
  const ordre = [
    page.locator('.ligne-date'),
    commutateur(page),
    page.getByRole('link', { name: 'Chapelet ou Rosaire ?' }),
    titre(page),
    page.getByRole('list', { name: 'Les cinq mystères' }),
    page.getByRole('button', { name: 'Commencer le chapelet' }),
    page.getByRole('heading', { name: 'Affichage des prières' }),
    page.getByRole('switch', { name: /Prier à plusieurs/ }),
    page.getByRole('heading', { name: 'Prier d’autres mystères' }),
    page.getByRole('link', { name: 'Prières du chapelet' }),
  ]
  const positions = []
  for (const element of ordre) positions.push(await haut(element))
  expect(positions).toEqual([...positions].sort((a, b) => a - b))
})

test('« Chapelet ou Rosaire ? » ouvre sa page, que la croix referme', async ({ page }) => {
  await preparer(page)
  await page.goto('/chapelet')
  const lien = page.getByRole('link', { name: 'Chapelet ou Rosaire ?' })
  // Le chevron se voit, le lecteur d'écran ne le lit pas.
  await expect(lien).toHaveText('Chapelet ou Rosaire ? ›')
  await lien.click()
  await expect(page).toHaveURL(/\/chapelet-ou-rosaire$/)
  await expect(titre(page)).toHaveText('Chapelet ou Rosaire ?')
  const main = page.locator('main')
  await expect(main.locator('strong')).toHaveText(['Chapelet', 'Rosaire'])
  const paragraphes = main.locator('p')
  await expect(paragraphes).toHaveCount(5)
  await expect(paragraphes.nth(0)).toHaveText(
    'Chapelet : cinq dizaines, la série de mystères du jour.',
  )
  await expect(paragraphes.nth(1)).toContainText('La puissance spirituelle XXL.')
  await expect(paragraphes.nth(2)).toContainText('on l’appela le « psautier de Marie ».')
  // Le texte exact est vérifié par src/chapelet/libelles.test.ts.
  await expect(paragraphes.nth(4)).toContainText('« un résumé de l’Évangile ».')
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(page).toHaveURL(/\/chapelet$/)
  await expect(titre(page)).toHaveText('Mystères lumineux')
})

test('« Prières du chapelet » ouvre la page des réglages, dont la croix ramène au seuil', async ({
  page,
}) => {
  await preparer(page)
  await page.goto('/chapelet')
  await page.getByRole('link', { name: 'Prières du chapelet' }).click()
  await expect(page).toHaveURL('/reglages/chapelet/prieres')
  await expect(titre(page)).toHaveText('Prières du chapelet')
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(page).toHaveURL(/\/chapelet$/)
})

// Le premier écran, de la croix au bouton, sans défiler ni rien sous « Plus
// bas », sur le plus petit téléphone visé : la série du jeudi a un mystère
// sur deux lignes.
for (const [nom, chemin, bouton, enCours] of [
  ['chapelet', '/chapelet', 'Commencer le chapelet', null],
  ['Rosaire', '/rosaire', 'Commencer le Rosaire', null],
  ['chapelet en cours', '/chapelet', 'Recommencer du début', 'Reprendre à la 3e dizaine'],
  ['Rosaire en cours', '/rosaire', 'Recommencer du début', 'Reprendre à la 2e série, 3e dizaine'],
] as const) {
  test(`à 360 × 640, ${nom} : tout tient de la croix au bouton`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await preparer(page)
    if (enCours)
      await page.addInitScript(
        (rosaire) =>
          localStorage.setItem(
            rosaire ? 'avec-dieu.rosaire-en-cours' : 'avec-dieu.en-cours',
            JSON.stringify({
              jour: '2026-10-08',
              forme: rosaire ? 'rosaire' : 'chapelet',
              serie: 'lumineux',
              dizaine: 3,
              priere: 'je-vous-salue',
              rang: 4,
            }),
          ),
        chemin === '/rosaire',
      )
    await page.goto(chemin)
    if (enCours) await expect(page.getByRole('button', { name: enCours })).toBeVisible()
    const dernier = page.getByRole('button', { name: bouton })
    await expect(dernier).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    const croix = (await page.getByRole('button', { name: 'Fermer', exact: true }).boundingBox())!
    expect(croix.y).toBeGreaterThanOrEqual(0)
    const bas = (await dernier.boundingBox())!
    const plusBas = page.getByRole('button', { name: 'Plus bas' })
    await expect(plusBas).toBeVisible()
    const limite = (await plusBas.boundingBox())!.y
    expect(bas.y + bas.height).toBeLessThanOrEqual(limite)
  })
}
