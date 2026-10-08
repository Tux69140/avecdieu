import { readFileSync } from 'node:fs'
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
  // Entre deux étapes, une perle verte : la couleur du jour. Aucune entre une
  // antienne et le psaume qu'elle ouvre (2026-10-08).
  const reperes = page.getByTestId('repere')
  await expect(reperes).toHaveCount(12)
  const avantLesPsaumes = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid=office] section')]
      .filter((s) =>
        s.previousElementSibling?.querySelector('h2')?.textContent?.startsWith('Antienne'),
      )
      .map((s) => s.previousElementSibling!.matches('section')),
  )
  // Les trois antiennes des psaumes et celle du Benedictus.
  expect(avantLesPsaumes).toEqual([true, true, true, true])
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

// Le saint du jour en petit, à droite du titre, qui reste centré ; rien un
// jour de fête (choix du porteur du projet, 2026-10-08).
const boites = (page: Page) =>
  page.evaluate(() => {
    const boite = (selecteur: string) => {
      const b = document.querySelector(selecteur)?.getBoundingClientRect()
      return b && { gauche: b.left, droite: b.right, haut: b.top, bas: b.bottom }
    }
    return { titre: boite('.office-entete h1'), saint: boite('.office-saint') }
  })

test('le saint du jour en petit sur la ligne du titre, qui reste centré', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('saint-du-jour')).toHaveText('S. Bruno')
  const { titre, saint } = await boites(page)
  expect((titre!.gauche + titre!.droite) / 2).toBeCloseTo(180, 0)
  expect(saint!.gauche).toBeGreaterThan(titre!.droite)
  expect(saint!.droite).toBeLessThanOrEqual(360 - 16)
  expect(saint!.haut).toBeLessThan(titre!.bas)
  expect(saint!.bas).toBeGreaterThan(titre!.haut)
})

test('un nom de saint long tient à droite du titre, sur plusieurs lignes', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await servirAelf(page)
  const long = 'Les sept saints fondateurs des Servîtes de Marie'
  await page.route('https://api.aelf.org/v1/complies/2026-10-06/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: readFileSync('src/aelf/exemples/complies-2026-10-06.json', 'utf8').replaceAll(
        'S. Bruno, pr\\u00eatre',
        long,
      ),
    }),
  )
  await preparer(page)
  await page.goto('/office/complies/2026-10-06')
  await expect(page.getByTestId('saint-du-jour')).toHaveText(long)
  const { titre, saint } = await boites(page)
  expect((titre!.gauche + titre!.droite) / 2).toBeCloseTo(180, 0)
  expect(saint!.gauche).toBeGreaterThan(titre!.droite)
  expect(saint!.droite).toBeLessThanOrEqual(360 - 16)
  const debordements = await page
    .getByTestId('saint-du-jour')
    .evaluate((p) => p.scrollWidth - p.clientWidth)
  expect(debordements).toBe(0)
})

test('l’office des lectures, au titre long : le saint sous le titre', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/lectures/2026-10-06')
  await expect(page.getByTestId('saint-du-jour')).toHaveText('S. Bruno')
  const { titre, saint } = await boites(page)
  expect(saint!.haut).toBeGreaterThanOrEqual(titre!.bas - 1)
})

test('un jour de fête, aucun nom en tête de l’office', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/laudes/2026-11-01')
  await expect(titres(page).first()).toHaveText('Introduction')
  await expect(page.getByTestId('saint-du-jour')).toHaveCount(0)
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
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  await expect.poll(() => journal(page)).toEqual(['écran allumé', 'écran libre'])
})

// La fin de l'office : une perle d'or qui ferme, puis le chemin de l'accueil ;
// l'écran reste allumé, on lit peut-être encore le haut (2026-10-08).
test('la fin de l’office : une perle d’or, puis « Revenir à l’accueil »', async ({ page }) => {
  await espionner(page)
  await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await page
    .getByRole('list', { name: 'Offices du jour' })
    .getByRole('link', { name: /Complies/ })
    .click()
  const revenir = page.getByRole('button', { name: 'Revenir à l’accueil' })
  await revenir.scrollIntoViewIfNeeded()
  await expect(revenir).toBeInViewport()
  await expect(page.getByTestId('cloture').locator('.repere-perle')).toHaveAttribute(
    'data-couleur',
    'or',
  )
  // La clôture vient après la dernière partie.
  const apres = await page.evaluate(() => {
    const parties = document.querySelectorAll('[data-testid=office] h2')
    const derniere = parties[parties.length - 1].getBoundingClientRect().bottom
    return document.querySelector('[data-testid=cloture]')!.getBoundingClientRect().top > derniere
  })
  expect(apres).toBe(true)
  expect(await journal(page)).toEqual(['écran allumé'])
  await revenir.click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
})

test('une adresse d’office inconnue mène à l’accueil', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/messe/2026-10-06')
  await expect(page).toHaveURL('/')
  await page.goto('/office/laudes/2026-13-40')
  await expect(page).toHaveURL('/')
})
