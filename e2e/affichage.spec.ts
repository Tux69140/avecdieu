import { expect, type Page } from '@playwright/test'
import { avancer, commencer, deplierReglages, preparer, servirAelf, test } from './outils.ts'

// Phase 10 : réglages en rubriques, zone liturgique, taille du texte (réglée
// ou pincée), thème nuit, animations réduites. Décisions du 2026-10-07.

const MARDI = (heures: number, minutes = 0) => new Date(2026, 9, 6, heures, minutes)

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MARDI(12))
  await servirAelf(page)
})

const theme = (page: Page) => page.locator('html').getAttribute('data-theme')
const taille = (page: Page, selecteur: string) =>
  page
    .locator(selecteur)
    .first()
    .evaluate((e) => getComputedStyle(e).fontSize)

// Deux doigts posés à `debut` px l'un de l'autre, écartés (ou rapprochés)
// jusqu'à `fin`. Le premier ne bouge pas : sans précaution, son relâchement
// passerait pour un toucher.
async function pincer(page: Page, debut: number, fin: number) {
  const cdp = await page.context().newCDPSession(page)
  const { width, height } = page.viewportSize()!
  const y = height / 2
  const x = width / 2 - 100
  const doigts = (ecart: number) => [
    { x, y, id: 0 },
    { x: x + ecart, y, id: 1 },
  ]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: doigts(debut) })
  for (let i = 1; i <= 10; i++) {
    const points = doigts(debut + ((fin - debut) * i) / 10)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

test.describe('les rubriques des réglages', () => {
  test('toutes fermées à l’ouverture, chacune se déplie et se replie', async ({ page }) => {
    await preparer(page)
    await page.goto('/reglages')
    for (const [nom, resume] of [
      ['Affichage', 'Taille du texte, thème'],
      ['Chapelet', 'Annonce, prières, vibrations'],
      ['Offices', 'Zone, accents, textes hors connexion'],
    ]) {
      const bouton = page.getByRole('button', { name: nom, exact: true })
      await expect(bouton).toHaveAttribute('aria-expanded', 'false')
      await expect(bouton).toContainText(resume)
    }
    await expect(page.getByRole('switch', { name: 'Prier à plusieurs' })).toBeHidden()
    await page.getByRole('button', { name: 'Chapelet', exact: true }).click()
    await expect(page.getByRole('switch', { name: 'Prier à plusieurs' })).toBeVisible()
    // Plusieurs à la fois.
    await page.getByRole('button', { name: 'Offices', exact: true }).click()
    await expect(page.getByRole('switch', { name: 'Prier à plusieurs' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Accents de psalmodie' })).toBeVisible()
    await page.getByRole('button', { name: 'Chapelet', exact: true }).click()
    await expect(page.getByRole('switch', { name: 'Prier à plusieurs' })).toBeHidden()
  })
})

test.describe('zone liturgique', () => {
  test('France par défaut ; une autre zone oublie les textes et les redemande', async ({
    page,
  }) => {
    const demandes = await servirAelf(page)
    await preparer(page)
    await page.goto('/')
    await expect.poll(() => demandes.length).toBe(72)
    await page.goto('/reglages')
    await deplierReglages(page, 'Offices')
    const zones = page.getByRole('radiogroup', { name: 'Zone liturgique' }).getByRole('radio')
    await expect(zones).toHaveCount(8)
    await expect(page.getByRole('radio', { name: 'France' })).toBeChecked()
    await page.getByRole('radio', { name: 'Belgique' }).check()
    await expect(page.getByTestId('hors-connexion')).toHaveText(
      'Aucun texte enregistré pour l’instant.',
    )
    // La réserve se refait pour la Belgique, et rien ne reste de la France.
    await expect.poll(() => demandes.filter((d) => d.endsWith('/belgique')).length).toBe(72)
    const cles = await page.evaluate(() => Object.keys(localStorage))
    expect(cles.filter((c) => c.startsWith('avec-dieu.aelf.france.'))).toEqual([])
    expect(cles.filter((c) => c.startsWith('avec-dieu.aelf.belgique.'))).toHaveLength(72)

    await page.reload()
    await deplierReglages(page, 'Offices')
    await expect(page.getByRole('radio', { name: 'Belgique' })).toBeChecked()
    await page.goto('/office/laudes/2026-10-06')
    await expect(page.getByTestId('office')).toBeVisible()
  })
})

test.describe('taille du texte', () => {
  test('A+ et A− de cran en cran ; offices et chapelet suivent, et la taille se retient', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/reglages')
    await deplierReglages(page, 'Affichage')
    const reduire = page.getByRole('button', { name: 'Réduire le texte' })
    const agrandir = page.getByRole('button', { name: 'Agrandir le texte' })
    await expect(page.getByRole('img', { name: 'Taille 2 sur 5' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Taille d’origine' })).toHaveCount(0)
    expect(await taille(page, '[data-testid="exemple-taille"]')).toBe('18px')
    await reduire.click()
    await expect(reduire).toBeDisabled()
    await agrandir.click()
    await agrandir.click()
    await agrandir.click()
    await expect(page.getByRole('img', { name: 'Taille 4 sur 5' })).toBeVisible()
    expect(await taille(page, '[data-testid="exemple-taille"]')).toBe('22px')
    await agrandir.click()
    await expect(agrandir).toBeDisabled()
    await reduire.click()

    // Le texte à prier grandit ; les titres, non.
    await page.goto('/office/laudes/2026-10-06')
    await expect(page.getByTestId('office')).toBeVisible()
    expect(await taille(page, '.office-texte')).toBe('22px')
    expect(await taille(page, '.office-entete h1')).toBe('32px')
    await commencer(page)
    expect(await taille(page, '.priere-texte')).toBe('22px')

    await page.goto('/reglages')
    await deplierReglages(page, 'Affichage')
    await page.getByRole('button', { name: 'Taille d’origine' }).click()
    await expect(page.getByRole('img', { name: 'Taille 2 sur 5' })).toBeVisible()
    expect(await taille(page, '[data-testid="exemple-taille"]')).toBe('18px')
  })

  test('pincer dans un office change la taille de cran en cran', async ({ page }) => {
    await preparer(page)
    await page.goto('/office/laudes/2026-10-06')
    await expect(page.getByTestId('office')).toBeVisible()
    await pincer(page, 100, 140)
    await expect.poll(() => taille(page, '.office-texte')).toBe('20px')
    await pincer(page, 100, 200)
    await expect.poll(() => taille(page, '.office-texte')).toBe('24px')
    await pincer(page, 200, 150)
    await expect.poll(() => taille(page, '.office-texte')).toBe('22px')
    // Retenue : l'écran des réglages la montre.
    await page.goto('/reglages')
    await deplierReglages(page, 'Affichage')
    await expect(page.getByRole('img', { name: 'Taille 4 sur 5' })).toBeVisible()
  })

  test('pincer au chapelet change la taille sans faire avancer la prière', async ({ page }) => {
    await commencer(page)
    await avancer(page, 2)
    const chapelet = page.locator('main.chapelet')
    await pincer(page, 100, 140)
    await expect.poll(() => taille(page, '.priere-texte')).toBe('20px')
    await expect(chapelet).toHaveAttribute('data-pas', '2')
    await pincer(page, 140, 100)
    await expect.poll(() => taille(page, '.priere-texte')).toBe('18px')
    await expect(chapelet).toHaveAttribute('data-pas', '2')
  })
})

test.describe('thème', () => {
  test('en automatique : jour à midi, nuit au soir ou si Android est en mode sombre', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/')
    await expect.poll(() => theme(page)).toBe('jour')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect.poll(() => theme(page)).toBe('nuit')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(20, 16, 12)')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect.poll(() => theme(page)).toBe('jour')
    // Le soleil se couche vers 19 h 20 au centre de la France.
    await page.clock.setFixedTime(MARDI(21))
    await page.reload()
    await expect.poll(() => theme(page)).toBe('nuit')
  })

  test('« Jour » et « Nuit » forcent le thème', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await preparer(page)
    await page.goto('/reglages')
    await deplierReglages(page, 'Affichage')
    await expect(page.getByRole('radio', { name: 'Automatique' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await page.getByRole('radio', { name: 'Jour' }).click()
    await expect.poll(() => theme(page)).toBe('jour')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.getByRole('radio', { name: 'Nuit' }).click()
    await expect.poll(() => theme(page)).toBe('nuit')
    await page.reload()
    await expect.poll(() => theme(page)).toBe('nuit')
  })
})

test('avec « réduire les animations », aucune transition ne joue', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await commencer(page)
  await avancer(page, 7)
  await expect(page.getByTestId('annonce')).toBeVisible()
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  await page.goto('/reglages')
  await page.getByRole('button', { name: 'Affichage', exact: true }).click()
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  const chevron = page.locator('.rubrique-chevron').first()
  await expect(chevron).toHaveCSS('transition-duration', '0s')
})
