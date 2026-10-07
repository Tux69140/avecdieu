import { expect, type Page } from '@playwright/test'
import { deplierReglages, espionner, journal, preparer, servirAelf, test } from './outils.ts'

// Phase 5 : les sept offices du jour, lus d'un trait depuis l'AELF, repères
// liturgiques en rouge rubrique. Les ajouts selon les rubriques (phase 6) :
// e2e/rubriques.spec.ts.

const MARDI = new Date(2026, 9, 6, 10, 0)
const ROUGE_RUBRIQUE = 'rgb(158, 42, 31)'

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MARDI)
})

const titres = (page: Page) => page.getByTestId('office').getByRole('heading', { level: 2 })

test('ouvrir les laudes depuis l’accueil et les lire d’un trait', async ({ page }) => {
  const demandes = await servirAelf(page)
  const externes: string[] = []
  page.on('request', (r) => {
    const url = r.url()
    if (!url.startsWith('http://localhost:4173/') && !url.startsWith('https://api.aelf.org/'))
      externes.push(url)
  })
  await preparer(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  await page
    .getByRole('list', { name: 'Offices du jour' })
    .getByRole('link', { name: /Laudes/ })
    .click()
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
    'Bénédiction',
  ])
  // Entre deux parties, une perle verte : la couleur du jour.
  const reperes = page.getByTestId('repere')
  await expect(reperes).toHaveCount(17)
  await expect(reperes.first().locator('.repere-perle')).toHaveAttribute('data-couleur', 'vert')

  // Rien n'est demandé deux fois, pas même par la réserve des jours à venir.
  expect(demandes).toContain('https://api.aelf.org/v1/informations/2026-10-06/france')
  expect(demandes).toContain('https://api.aelf.org/v1/laudes/2026-10-06/france')
  expect(new Set(demandes).size).toBe(demandes.length)
  expect(externes).toEqual([])

  // Le retour ramène à l'accueil.
  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
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
  await deplierReglages(page, 'Offices')
  const bascule = page.getByRole('switch', { name: 'Accents de psalmodie' })
  await expect(bascule).toHaveAttribute('aria-checked', 'true')
  await bascule.click()
  await expect(bascule).toHaveAttribute('aria-checked', 'false')

  await page.goto('/office/laudes/2026-10-06')
  const accent = page.getByTestId('office').locator('.office-accent').first()
  await expect(accent).toBeAttached()
  await expect(accent).toHaveCSS('text-decoration-line', 'none')
})

test('premier lancement sans réseau : un message clair et « Réessayer »', async ({ page }) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
  await preparer(page)
  await page.goto('/office/vepres/2026-10-06')
  const alerte = page.getByRole('alert')
  await expect(alerte).toHaveText(
    '⚠ Les offices demandent une première connexion à internet.' +
      'Une fois connecté, l’app enregistre une semaine de textes d’avance. ' +
      'Le chapelet, lui, se prie dès maintenant.Réessayer',
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
  await page.goto('/')
  await page
    .getByRole('list', { name: 'Offices du jour' })
    .getByRole('link', { name: /Complies/ })
    .click()
  await expect(titres(page).first()).toHaveText('Introduction')
  await expect.poll(() => journal(page)).toEqual(['écran allumé'])
  await page.getByRole('button', { name: /Retour/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  await expect.poll(() => journal(page)).toEqual(['écran allumé', 'écran libre'])
})

test('une adresse d’office inconnue mène à l’accueil', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/messe/2026-10-06')
  await expect(page).toHaveURL('/')
  await page.goto('/office/laudes/2026-13-40')
  await expect(page).toHaveURL('/')
})
