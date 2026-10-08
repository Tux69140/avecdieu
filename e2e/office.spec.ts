import { readFileSync } from 'node:fs'
import { expect, type Page } from '@playwright/test'
import { deplierReglages, espionner, journal, preparer, servirAelf, test } from './outils.ts'

// À l'écran, un liant invisible suit le trait d'union d'un mot composé.
const lie = (texte: string) => texte.replace(/(?<=\p{L})-(?=\p{L})/gu, '-\u2060')

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

test('premier lancement sans réseau : pourquoi, puis le réseau ou le chapelet', async ({
  page,
}) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
  await preparer(page)
  await page.goto('/office/vepres/2026-10-06')
  const alerte = page.getByRole('alert')
  await expect(alerte).toHaveText(
    '⚠ Les textes des offices ne sont pas encore sur le téléphone.' +
      'L’app les reçoit de l’AELF par internet, puis en garde une semaine d’avance.' +
      lie('Activez le Wi-Fi ou les données mobiles : l’office s’affichera de lui-même.') +
      'Ou priez le chapelet, qui ne demande aucune connexion.' +
      'RéessayerPrier le chapelet',
  )
  await expect(alerte.getByRole('link', { name: 'Prier le chapelet' })).toHaveAttribute(
    'href',
    '/chapelet',
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

test('le saint du jour en petit à gauche du titre, qui reste centré, et « ? » à droite', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('saint-du-jour')).toHaveText('S. Bruno')
  const { titre, saint } = await boites(page)
  expect((titre!.gauche + titre!.droite) / 2).toBeCloseTo(180, 0)
  expect(saint!.droite).toBeLessThan(titre!.gauche)
  expect(saint!.gauche).toBeGreaterThanOrEqual(16)
  expect(saint!.haut).toBeLessThan(titre!.bas)
  expect(saint!.bas).toBeGreaterThan(titre!.haut)
  const aide = await page.getByRole('button', { name: 'Aide à la lecture' }).boundingBox()
  expect(aide!.x).toBeGreaterThan(titre!.droite)
  expect(aide!.width).toBe(48)
  expect(aide!.height).toBe(48)
})

test('un nom de saint long tient à gauche du titre, sur plusieurs lignes', async ({ page }) => {
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
  expect(saint!.droite).toBeLessThan(titre!.gauche)
  expect(saint!.gauche).toBeGreaterThanOrEqual(16)
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

test('le jour de Pâques, une note et le chemin des laudes, sans ton d’erreur', async ({ page }) => {
  // Le dimanche de Pâques, la Vigile pascale tient lieu d'office des lectures.
  await servirAelf(page)
  await preparer(page)
  // Une note, pas une erreur (choix du porteur du projet, 2026-10-08).
  await page.goto('/office/lectures/2027-03-28')
  await expect(page.locator('.office-note')).toContainText(
    'Le jour de Pâques, la Vigile pascale tient lieu d’office des lectures.',
  )
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Réessayer' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Revenir à l’accueil' })).toBeVisible()
  await page.getByRole('button', { name: 'Prier les laudes' }).click()
  await expect(page).toHaveURL('/office/laudes/2027-03-28')
})

test('un autre office absent de l’AELF : le dire, sans parler de panne', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/tierce/2026-10-08')
  await expect(page.getByRole('alert')).toHaveText(
    /^⚠ L’AELF ne propose pas cet office pour ce jour\.$/,
  )
  await expect(page.getByRole('button', { name: 'Revenir à l’accueil' })).toBeVisible()
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
  // L'accueil n'est pas empilé une seconde fois : le retour d'Android quitte l'app.
  expect(await page.evaluate(() => (history.state as { idx: number }).idx)).toBe(0)
})

test('une adresse d’office inconnue mène à l’accueil', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/messe/2026-10-06')
  await expect(page).toHaveURL('/')
  await page.goto('/office/laudes/2026-13-40')
  await expect(page).toHaveURL('/')
})

// Retouches de la critique de l'écran des offices (2026-10-08).
test.describe('à 360 px', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test('« 1er » en exposant dans la date de l’office et de l’accueil', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 10, 1, 10, 0))
    await servirAelf(page)
    await preparer(page)
    await page.goto('/office/laudes/2026-11-01')
    await expect(page.locator('.office-date sup')).toHaveText('er')
    await page.goto('/')
    await expect(page.locator('.bandeau-date sup')).toHaveText('er')
  })

  test('aucune région de l’office ne porte le nom d’une autre', async ({ page }) => {
    await servirAelf(page)
    await preparer(page)
    await page.goto('/office/complies/2026-10-06')
    await expect(titres(page).first()).toHaveText('Introduction')
    await expect(page.getByTestId('office').getByRole('region')).toHaveCount(0)
  })

  test('« Plus bas » et une prière repliée d’une ligne : 48 px à toucher', async ({ page }) => {
    await servirAelf(page)
    await preparer(page)
    await page.goto('/office/laudes/2026-10-06')
    const indice = page.getByRole('button', { name: 'Plus bas' })
    await expect(indice).toBeVisible()
    const touchable = await indice.evaluate((b) => {
      const style = getComputedStyle(b)
      return (
        b.getBoundingClientRect().height -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom)
      )
    })
    expect(touchable).toBeGreaterThanOrEqual(48)
    // « Notre Père… », replié sur une ligne : un toucher 8 px au-dessus le déplie.
    const notrePere = page.locator('.priere-repliee summary', { hasText: 'Notre Père' })
    await notrePere.scrollIntoViewIfNeeded()
    const boite = (await notrePere.boundingBox())!
    expect(boite.height).toBeLessThan(48)
    await page.mouse.click(boite.x + 40, boite.y - 8)
    await expect(page.locator('.priere-repliee', { hasText: 'Notre Père' })).toHaveAttribute(
      'open',
      '',
    )
  })
})

test('aucun mot coupé en fin de ligne dans le texte prié (2026-10-08)', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/complies/2026-10-06')
  await expect(titres(page).first()).toHaveText('Introduction')
  const cesures = await page.evaluate(() =>
    [...document.querySelectorAll('.office-strophe')].map((p) => getComputedStyle(p).hyphens),
  )
  expect(new Set(cesures)).toEqual(new Set(['manual']))
})

test('« Saint-Esprit » ne se coupe pas à son trait d’union, à 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  const gloire = page.locator('.priere-repliee summary', { hasText: 'Gloire au Père' }).first()
  await gloire.scrollIntoViewIfNeeded()
  // Le mot entier tient sur une seule ligne : un seul rectangle.
  const morceaux = await gloire.evaluate((summary) => {
    const marcheur = document.createTreeWalker(summary, NodeFilter.SHOW_TEXT)
    for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) {
      const debut = n.textContent!.indexOf('Saint-')
      if (debut < 0) continue
      const plage = document.createRange()
      plage.setStart(n, debut)
      plage.setEnd(n, n.textContent!.indexOf('Esprit') + 'Esprit'.length)
      return [...plage.getClientRects()].filter((r) => r.width > 0).length
    }
    return -1
  })
  expect(morceaux).toBe(1)
})
