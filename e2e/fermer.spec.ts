import { expect, type Locator, type Page } from '@playwright/test'
import { avancer, commencer, preparer, servirAelf, test } from './outils.ts'

// Fermer, partout la même croix fine en haut à gauche, et le titre centré sur
// sa ligne (décisions du porteur du projet, 2026-10-08).

test.beforeEach(async ({ page }) => {
  // Le plus petit téléphone visé.
  await page.setViewportSize({ width: 360, height: 780 })
  await page.clock.setFixedTime(new Date(2026, 9, 5, 10, 0))
  await servirAelf(page)
})

const croix = (page: Page) => page.getByRole('button', { name: 'Fermer', exact: true })

// La croix : 48 px à toucher, en haut à gauche, un dessin de 18 px en sépia.
async function verifierCroix(page: Page) {
  const bouton = croix(page)
  await expect(bouton).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
  const boite = (await bouton.boundingBox())!
  expect(boite.width).toBe(48)
  expect(boite.height).toBe(48)
  expect(boite.x).toBeLessThan(24)
  const dessin = await bouton.locator('svg').evaluate((svg) => {
    const style = getComputedStyle(svg)
    const sepia = getComputedStyle(document.documentElement).getPropertyValue('--sepia')
    const temoin = document.createElement('i')
    temoin.style.color = sepia
    document.body.append(temoin)
    const attendu = getComputedStyle(temoin).color
    temoin.remove()
    return {
      largeur: svg.getBoundingClientRect().width,
      trait: style.stroke,
      attendu,
      chemin: svg.querySelector('path')?.getAttribute('d'),
    }
  })
  expect(dessin.largeur).toBe(18)
  expect(dessin.trait).toBe(dessin.attendu)
  return dessin.chemin
}

// Le texte centré sur l'écran, sur la ligne de la croix, sans passer dessous
// ni déborder.
async function verifierCentre(page: Page, texte: Locator) {
  const bouton = (await croix(page).boundingBox())!
  const largeurEcran = page.viewportSize()!.width
  const lignes = await texte.evaluate((e) => {
    const plage = document.createRange()
    plage.selectNodeContents(e)
    return [...plage.getClientRects()].map((r) => ({ x: r.x, y: r.y, l: r.width, h: r.height }))
  })
  expect(lignes.length).toBeGreaterThan(0)
  for (const ligne of lignes) {
    expect(ligne.x).toBeGreaterThanOrEqual(bouton.x + bouton.width)
    expect(ligne.x + ligne.l).toBeLessThanOrEqual(largeurEcran - bouton.width)
    expect(Math.abs(ligne.x + ligne.l / 2 - largeurEcran / 2)).toBeLessThan(2)
  }
  // Sur la ligne de la croix : la première ligne du texte la croise.
  const premiere = lignes[0]
  expect(premiere.y).toBeLessThan(bouton.y + bouton.height)
  expect(premiere.y + premiere.h).toBeGreaterThan(bouton.y)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    largeurEcran,
  )
}

for (const [nom, chemin, titre] of [
  ['menu', '/menu', 'Avec Dieu'],
  ['réglages', '/reglages', 'Réglages'],
  ['réglages · rappels', '/reglages/rappels', 'Rappels'],
  ['réglages · prières du chapelet', '/reglages/chapelet/prieres', 'Prières du chapelet'],
  ['réglages · zone liturgique', '/reglages/offices/zone', 'Zone liturgique'],
  ['à propos', '/a-propos', 'Avec Dieu'],
  ['lieu des heures solaires', '/lieu', 'Lieu des heures solaires'],
] as const) {
  test(`${nom} : la croix en haut à gauche, le titre centré sur sa ligne`, async ({ page }) => {
    await preparer(page)
    await page.goto(chemin)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toHaveText(titre)
    await verifierCroix(page)
    await verifierCentre(page, h1)
  })
}

test('seuil du chapelet : la croix sur la ligne de la date, le titre dessous', async ({ page }) => {
  await preparer(page)
  await page.goto('/chapelet')
  await verifierCroix(page)
  await verifierCentre(page, page.locator('.seuil-entete .ligne-date'))
  // La date seule, sur une ligne, en sépia, comme dans l'office (2026-10-08).
  const date = page.locator('.seuil-entete .ligne-date')
  await expect(date).toHaveText('lundi 5 octobre')
  await expect(date).toHaveCSS('color', 'rgb(107, 90, 72)')
  expect((await date.boundingBox())!.height).toBeLessThan(30)
})

test('la même croix partout, office et chapelet compris', async ({ page }) => {
  await preparer(page)
  const chemins = new Set<string | null | undefined>()
  for (const chemin of ['/menu', '/reglages', '/a-propos', '/lieu', '/chapelet']) {
    await page.goto(chemin)
    chemins.add(await verifierCroix(page))
  }
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  chemins.add(await verifierCroix(page))
  // Dans l'office, la croix reste sur la ligne de la date.
  await verifierCentre(page, page.locator('.office-date'))
  await page.goto('/chapelet')
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  chemins.add(await verifierCroix(page))
  expect([...chemins]).toHaveLength(1)
})

// Pendant la prière, la croix ramène au seuil, comme le retour d'Android ;
// celle du seuil ramène là d'où le chapelet a été ouvert (décision du porteur
// du projet, 2026-10-08).
test('chapelet : la croix ramène au seuil, puis celle du seuil d’où il a été ouvert', async ({
  page,
}) => {
  await preparer(page)
  await page.goto('/')
  await page.getByRole('list', { name: 'Chapelet' }).getByRole('link').click()
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  const chapelet = page.locator('main.chapelet')
  await expect(chapelet).toHaveAttribute('data-pas', '0')
  await verifierCroix(page)
  await verifierCentre(page, page.locator('.chapelet-entete .ligne-date'))
  // Le toucher sur la croix ramène au seuil sans faire avancer le chapelet.
  const boite = (await croix(page).boundingBox())!
  await page.touchscreen.tap(boite.x + boite.width / 2, boite.y + boite.height / 2)
  const reprendre = page.getByRole('button', { name: 'Reprendre le chapelet' })
  await expect(reprendre).toBeVisible()
  await expect(page).toHaveURL(/\/chapelet$/)
  // Le chapelet reprend où on l'avait laissé : au signe de croix.
  await reprendre.click()
  await expect(chapelet).toHaveAttribute('data-pas', '0')
  await croix(page).click()
  await croix(page).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByTestId('bandeau')).toBeVisible()
})

test('écran de fin du chapelet : la croix ramène au seuil', async ({ page }) => {
  await commencer(page)
  // Un lundi d'octobre : 77 pas, puis Salve, Litanies, oraison et saint Joseph.
  await avancer(page, 81)
  await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  await croix(page).click()
  await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
})
