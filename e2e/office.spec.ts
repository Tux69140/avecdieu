import { expect, test, type Page } from '@playwright/test'
import { espionner, journal, preparer, servirAelf } from './outils.ts'

// Phase 5 : les sept offices du jour, lus d'un trait tels que l'AELF les
// fournit, repères liturgiques en rouge rubrique.

const MARDI = new Date(2026, 9, 6, 10, 0)
const ROUGE_RUBRIQUE = 'rgb(158, 42, 31)'

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MARDI)
})

const titres = (page: Page) => page.getByTestId('office').getByRole('heading', { level: 2 })

test('ouvrir les laudes depuis le menu et les lire d’un trait', async ({ page }) => {
  const demandes = await servirAelf(page)
  const externes: string[] = []
  page.on('request', (r) => {
    const url = r.url()
    if (!url.startsWith('http://localhost:4173/') && !url.startsWith('https://api.aelf.org/'))
      externes.push(url)
  })
  await preparer(page)
  await page.goto('/chapelet')
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('link', { name: 'Offices' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offices du jour')
  await expect(page.getByText('mardi 6 octobre')).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveText([
    'Office des lectures',
    'Laudes',
    'Tierce',
    'Sexte',
    'None',
    'Vêpres',
    'Complies',
  ])

  await page.getByRole('link', { name: 'Laudes' }).click()
  await expect(page).toHaveURL('/office/laudes/2026-10-06')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Laudes')
  await expect(titres(page)).toHaveText([
    'Introduction',
    'Invitatoire',
    'Psaume 94',
    'Hymne · Soleil levant',
    'Antienne 1',
    'Psaume 84',
    'Antienne 2',
    'Cantique d’Isaïe (Is 26)',
    'Antienne 3',
    'Psaume 66',
    'Lecture brève · 1 Jn 4, 14-15',
    'Répons',
    'Antienne',
    'Cantique de Zacharie',
    'Intercession',
    'Notre Père',
    'Oraison',
  ])
  // Entre deux parties, une perle verte : la couleur du jour.
  const reperes = page.getByTestId('repere')
  await expect(reperes).toHaveCount(16)
  await expect(reperes.first().locator('.repere-perle')).toHaveAttribute('data-couleur', 'vert')

  expect(demandes).toEqual(['https://api.aelf.org/v1/laudes/2026-10-06/france'])
  expect(externes).toEqual([])

  // Le retour ramène à la liste, puis au seuil du chapelet.
  await page.goBack()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offices du jour')
  await page.getByRole('button', { name: /Retour/ }).click()
  await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
})

for (const [office, nom] of [
  ['lectures', 'Office des lectures'],
  ['laudes', 'Laudes'],
  ['tierce', 'Tierce'],
  ['sexte', 'Sexte'],
  ['none', 'None'],
  ['vepres', 'Vêpres'],
  ['complies', 'Complies'],
]) {
  test(`${nom} s’affiche depuis l’AELF`, async ({ page }) => {
    await servirAelf(page)
    await preparer(page)
    await page.goto(`/office/${office}/2026-10-06`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(nom)
    await expect(titres(page).first()).toHaveText('Introduction')
    expect(await titres(page).count()).toBeGreaterThan(8)
    await expect(titres(page).last()).toBeVisible()
  })
}

test('versets, V/ R/, astérisques et accents en rouge rubrique', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  const office = page.getByTestId('office')
  await expect(office).toBeVisible()
  await expect(office.getByTestId('marque-V').first()).toHaveCSS('color', ROUGE_RUBRIQUE)
  await expect(office.getByTestId('marque-R').first()).toHaveCSS('color', ROUGE_RUBRIQUE)
  await expect(office.locator('.office-verset').first()).toHaveCSS('color', ROUGE_RUBRIQUE)
  await expect(office.locator('.office-signe').first()).toHaveCSS('color', ROUGE_RUBRIQUE)
  const accent = office.locator('.office-accent').first()
  await expect(accent).toHaveCSS('text-decoration-line', 'underline')
  await expect(accent).toHaveCSS('text-decoration-color', ROUGE_RUBRIQUE)
  // Aucune balise de l'AELF ne parvient à l'écran.
  expect(await office.locator('font, u, script, [class="verse_number"]').count()).toBe(0)
})

test('les accents de psalmodie se masquent dans les réglages', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/reglages')
  const bascule = page.getByRole('switch', { name: 'Accents de psalmodie' })
  await expect(bascule).toHaveAttribute('aria-checked', 'true')
  await bascule.click()
  await expect(bascule).toHaveAttribute('aria-checked', 'false')

  await page.goto('/office/laudes/2026-10-06')
  const accent = page.getByTestId('office').locator('.office-accent').first()
  await expect(accent).toBeAttached()
  await expect(accent).toHaveCSS('text-decoration-line', 'none')
})

test('sans réseau, un message clair et « Réessayer »', async ({ page }) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
  await preparer(page)
  await page.goto('/office/vepres/2026-10-06')
  const alerte = page.getByRole('alert')
  await expect(alerte).toContainText('Impossible de récupérer l’office.')
  await expect(alerte).toContainText(
    'Le site de l’AELF ne répond pas. Vérifiez votre connexion internet, puis réessayez.',
  )

  // Le réseau revient : « Réessayer » affiche l'office.
  await page.unrouteAll()
  await servirAelf(page)
  await page.getByRole('button', { name: 'Réessayer' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(titres(page).first()).toHaveText('Introduction')
})

test('un office que l’AELF ne propose pas : le dire, sans « Réessayer »', async ({ page }) => {
  // Le dimanche de Pâques, la Vigile pascale tient lieu d'office des lectures.
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/lectures/2026-04-05')
  const alerte = page.getByRole('alert')
  await expect(alerte).toContainText('L’AELF ne propose pas cet office pour ce jour.')
  await expect(alerte).not.toContainText('ne répond pas')
  await expect(page.getByRole('button', { name: 'Réessayer' })).toHaveCount(0)
})

test('l’écran reste allumé pendant la lecture et redevient libre au retour', async ({ page }) => {
  await espionner(page)
  await servirAelf(page)
  await preparer(page)
  await page.goto('/offices')
  await page.getByRole('link', { name: 'Complies' }).click()
  await expect(titres(page).first()).toHaveText('Introduction')
  await expect.poll(() => journal(page)).toEqual(['écran allumé'])
  await page.getByRole('button', { name: /Retour/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offices du jour')
  await expect.poll(() => journal(page)).toEqual(['écran allumé', 'écran libre'])
})

test('une adresse d’office inconnue mène à la liste du jour', async ({ page }) => {
  await preparer(page)
  await page.goto('/office/messe/2026-10-06')
  await expect(page).toHaveURL('/offices')
  await page.goto('/office/laudes/2026-13-40')
  await expect(page).toHaveURL('/offices')
})
