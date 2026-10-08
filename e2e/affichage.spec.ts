import { expect, type Page } from '@playwright/test'
import { avancer, commencer, pincer, preparer, servirAelf, test } from './outils.ts'

// Phase 10 : réglages en pages (2026-10-08), zone liturgique, taille du texte (réglée
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

test.describe('la page des réglages', () => {
  // En pages emboîtées, comme les Paramètres d'Android (2026-10-08) : une
  // ligne par page, son résumé dessous, le chevron qui dit « autre écran ».
  test('une ligne par page, dans l’ordre, avec son résumé', async ({ page }) => {
    await preparer(page)
    await page.goto('/reglages')
    await expect(page.locator('.ligne-page-nom')).toHaveText([
      'Rappels',
      'Chapelet',
      'Offices',
      'Affichage',
      'Réinitialiser l’app',
    ])
    for (const [nom, resume] of [
      ['Rappels', 'Aucun rappel'],
      ['Chapelet', 'Annonce, prières, vibrations'],
      ['Offices', 'Zone, accents, textes hors connexion'],
      ['Affichage', 'Taille du texte, thème'],
    ]) {
      const ligne = page.getByRole('link', { name: nom, exact: true })
      await expect(ligne).toContainText(resume)
      // 48 px au moins, le chevron à droite, rien de replié.
      expect((await ligne.boundingBox())!.height).toBeGreaterThanOrEqual(48)
      expect(
        await ligne.evaluate((e) => getComputedStyle(e, '::after').content.startsWith('"›"')),
      ).toBe(true)
    }
    await expect(page.locator('[aria-expanded]')).toHaveCount(0)
    await expect(page.getByRole('switch')).toHaveCount(0)
  })
})

test.describe('zone liturgique', () => {
  const ligneZone = (page: Page) => page.getByRole('link', { name: /^Zone liturgique/ })
  const zones = (page: Page) => page.getByRole('radiogroup', { name: 'Zone liturgique' })
  const avertissement = (page: Page) => page.getByRole('region', { name: 'Changer de zone ?' })

  test('France par défaut ; une autre zone, confirmée, oublie les textes et les redemande', async ({
    page,
  }) => {
    const demandes = await servirAelf(page)
    await preparer(page)
    await page.goto('/')
    await expect.poll(() => demandes.length).toBe(72)
    await page.goto('/reglages/offices')
    // Une seule ligne dans la page Offices : la liste des zones a sa page.
    await expect(page.getByRole('radio')).toHaveCount(0)
    await expect(ligneZone(page)).toHaveText(/France/)
    await ligneZone(page).click()
    await expect(page).toHaveURL('/reglages/offices/zone')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Zone liturgique')
    await expect(zones(page).getByRole('radio')).toHaveCount(8)
    await expect(zones(page).getByRole('radio', { name: 'France' })).toBeChecked()
    await expect(avertissement(page)).toHaveCount(0)

    // Une zone touchée : l'avertissement, sur la page même, avant de valider.
    // Annuler : rien ne change, les textes restent.
    await zones(page).getByRole('radio', { name: 'Belgique' }).click()
    await expect(avertissement(page)).toContainText(
      'Les textes gardés pour prier sans connexion seront effacés et remplacés par ceux de la zone Belgique. Il faudra une connexion pour les recharger, sinon aucun texte ne sera disponible.',
    )
    await expect(avertissement(page)).toBeInViewport()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await avertissement(page).getByRole('button', { name: 'Annuler' }).click()
    await expect(page).toHaveURL('/reglages/offices')
    await expect(ligneZone(page)).toHaveText(/France/)
    await expect(page.getByTestId('hors-connexion')).toContainText('hors connexion jusqu’au')

    await ligneZone(page).click()
    await zones(page).getByRole('radio', { name: 'Belgique' }).click()
    await avertissement(page).getByRole('button', { name: 'Changer' }).click()
    await expect(page).toHaveURL('/reglages/offices')
    await expect(ligneZone(page)).toHaveText(/Belgique/)
    await expect(page.getByTestId('hors-connexion')).toHaveText(
      'Aucun texte enregistré pour l’instant.',
    )
    // La réserve se refait pour la Belgique, et rien ne reste de la France.
    await expect.poll(() => demandes.filter((d) => d.endsWith('/belgique')).length).toBe(72)
    const cles = await page.evaluate(() => Object.keys(localStorage))
    expect(cles.filter((c) => c.startsWith('avec-dieu.aelf.france.'))).toEqual([])
    expect(cles.filter((c) => c.startsWith('avec-dieu.aelf.belgique.'))).toHaveLength(72)

    await page.reload()
    await expect(ligneZone(page)).toHaveText(/Belgique/)
    await page.goto('/office/laudes/2026-10-06')
    await expect(page.getByTestId('office')).toBeVisible()
  })

  test('sans texte gardé, la zone change sans avertissement ; la croix remonte', async ({
    page,
  }) => {
    await page.route('https://api.aelf.org/**', (route) => route.abort())
    await preparer(page)
    await page.goto('/reglages/offices')
    await ligneZone(page).click()
    await page.getByRole('button', { name: 'Fermer', exact: true }).click()
    await expect(page).toHaveURL('/reglages/offices')
    await ligneZone(page).click()
    await zones(page).getByRole('radio', { name: 'Calendrier romain général' }).click()
    await expect(page).toHaveURL('/reglages/offices')
    await expect(ligneZone(page)).toHaveText(/Calendrier romain général/)
  })
})

test.describe('taille du texte', () => {
  test('A+ et A− de cran en cran ; offices et chapelet suivent, et la taille se retient', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/reglages/affichage')
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

    await page.goto('/reglages/affichage')
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
    await page.goto('/reglages/affichage')
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
    await page.goto('/reglages/affichage')
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
  // Les rubriques repliées d'« A propos » : la flèche se retourne sans transition.
  await page.goto('/a-propos')
  await page.getByRole('button', { name: 'Textes', exact: true }).click()
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  const chevron = page.locator('.rubrique-chevron').first()
  await expect(chevron).toHaveCSS('transition-duration', '0s')
})
