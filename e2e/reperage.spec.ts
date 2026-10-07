import { expect, type Locator, type Page } from '@playwright/test'
import { preparer, servirAelf, test } from './outils.ts'

// Phase 7 : se repérer dans l'office. Un bandeau fixe nomme l'étape en cours
// (l'antienne compte avec son psaume) et montre la progression en fil de
// perles ; le sommaire conduit à n'importe quelle étape.

const MARDI = new Date(2026, 9, 6, 10, 0)

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await page.clock.setFixedTime(MARDI)
  await servirAelf(page)
  await preparer(page)
})

async function ouvrir(page: Page, chemin = '/office/laudes/2026-10-06') {
  await page.goto(chemin)
  await expect(page.getByTestId('office')).toBeVisible()
}

const bandeau = (page: Page) => page.getByTestId('bandeau-office')
const sommaire = (page: Page) => page.getByRole('dialog', { name: /^Sommaire/ })
const titre = (page: Page, nom: string) =>
  page.getByTestId('office').getByRole('heading', { level: 2, name: nom, exact: true })

// Amène un titre de partie juste sous le bandeau, comme un priant qui lit.
async function amenerSousLeBandeau(cible: Locator) {
  await cible.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 110))
}

// Ce que montre le fil : une lettre par perle (d = dite, c = en cours, v = à venir).
const fil = (page: Page) =>
  bandeau(page)
    .locator('[data-etat]')
    .evaluateAll((perles) =>
      perles
        .map((p) => ({ dite: 'd', courante: 'c', 'a-venir': 'v' })[p.getAttribute('data-etat')!])
        .join(''),
    )

test('le bandeau paraît dès que le titre sort de l’écran et nomme l’étape lue', async ({
  page,
}) => {
  await ouvrir(page)
  // À l'ouverture : l'en-tête, avec son lien vers le sommaire ; pas de bandeau.
  await expect(page.getByRole('button', { name: 'Sommaire', exact: true })).toBeVisible()
  await expect(bandeau(page)).toBeHidden()

  // L'antienne ouvre l'étape de son psaume.
  await amenerSousLeBandeau(titre(page, 'Antienne 1'))
  await expect(bandeau(page)).toBeVisible()
  await expect(bandeau(page).getByTestId('etape-courante')).toHaveText('Psaume 84')
  await expect.poll(() => fil(page)).toBe('dddcvvvvvvvvv')

  await amenerSousLeBandeau(titre(page, 'Psaume 84'))
  await expect(bandeau(page).getByTestId('etape-courante')).toHaveText('Psaume 84')

  await amenerSousLeBandeau(titre(page, 'Lecture brève · 1 Jn 4, 14-15'))
  await expect(bandeau(page).getByTestId('etape-courante')).toHaveText('Lecture brève')
  await expect.poll(() => fil(page)).toBe('ddddddcvvvvvv')

  // Tout en bas : la dernière étape.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(bandeau(page).getByTestId('etape-courante')).toHaveText('Bénédiction')
  await expect.poll(() => fil(page)).toBe('ddddddddddddc')

  // Remonté en haut, le bandeau s'efface.
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(bandeau(page)).toBeHidden()
})

test('le sommaire conduit à une étape, puis se referme', async ({ page }) => {
  await ouvrir(page)
  await page.getByRole('button', { name: 'Sommaire', exact: true }).click()
  await expect(sommaire(page)).toBeVisible()
  await expect(sommaire(page).getByRole('heading')).toHaveText('Sommaire · Laudes')
  const etapes = sommaire(page).getByRole('listitem').getByRole('button')
  await expect(sommaire(page).getByRole('listitem')).toHaveText([
    'Introduction',
    'Invitatoire',
    'Hymne · Soleil levant',
    'Psaume 84',
    'Cantique d’Isaïe (Is 26)',
    'Psaume 66',
    'Lecture brève · 1 Jn 4, 14-15',
    'Répons',
    'Cantique de Zacharie',
    'Intercession',
    'Notre Père',
    'Oraison',
    'Bénédiction',
  ])
  await expect(sommaire(page).locator('[aria-current="step"]')).toHaveText('Introduction')
  // Chaque étape se touche du doigt sans viser.
  for (const boite of await etapes.evaluateAll((bs) =>
    bs.map((b) => b.getBoundingClientRect().height),
  ))
    expect(boite).toBeGreaterThanOrEqual(47.9)

  await sommaire(page).getByRole('button', { name: 'Intercession' }).click()
  await expect(sommaire(page)).toBeHidden()
  await expect(bandeau(page).getByTestId('etape-courante')).toHaveText('Intercession')
  // Le titre de l'étape s'affiche juste sous le bandeau, pas derrière lui.
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
  const sousBandeau = (await bandeau(page).boundingBox())!
  const cible = (await titre(page, 'Intercession').boundingBox())!
  expect(cible.y).toBeGreaterThanOrEqual(sousBandeau.y + sousBandeau.height)
  expect(cible.y).toBeLessThan(sousBandeau.y + sousBandeau.height + 80)
  await expect(page).toHaveURL('/office/laudes/2026-10-06')

  await bandeau(page).click()
  await expect(sommaire(page).locator('[aria-current="step"]')).toHaveText('Intercession')
})

test('près de la fin, une étape courte reste celle qu’on a choisie', async ({ page }) => {
  // Aux vêpres, l'oraison ne peut pas monter jusqu'à la ligne de lecture :
  // la page bute avant sur la fin de l'office.
  await ouvrir(page, '/office/vepres/2026-10-06')
  for (const etape of ['Notre Père', 'Oraison']) {
    await page
      .getByRole('button', { name: /Sommaire/ })
      .first()
      .click()
    await sommaire(page).getByRole('button', { name: etape, exact: true }).click()
    await expect(sommaire(page)).toBeHidden()
    await expect(bandeau(page).getByTestId('etape-courante')).toHaveText(etape)
  }
  // Le priant fait défiler (l'oraison a mené tout en bas) : le bandeau reprend la lecture.
  await page.evaluate(() => window.scrollBy(0, -40))
  // Un doigt qui fait défiler dure plusieurs images, pas une seule.
  await page.evaluate(() => new Promise((fin) => requestAnimationFrame(() => setTimeout(fin))))
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(bandeau(page).getByTestId('etape-courante')).toHaveText('Bénédiction')
})

test('le sommaire se referme par le retour d’Android, un toucher à côté ou Échap', async ({
  page,
}) => {
  await ouvrir(page)
  await amenerSousLeBandeau(titre(page, 'Psaume 66'))
  const position = await page.evaluate(() => scrollY)

  // Le bouton retour d'Android remonte l'historique : il referme le volet,
  // sans quitter l'office ni perdre sa place.
  await bandeau(page).click()
  await expect(sommaire(page)).toBeVisible()
  await page.goBack()
  await expect(sommaire(page)).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Laudes')
  expect(await page.evaluate(() => scrollY)).toBe(position)

  // Un toucher sur le texte assombri, sous le volet.
  await bandeau(page).click()
  await expect(sommaire(page)).toBeVisible()
  await page.mouse.click(180, 630)
  await expect(sommaire(page)).toBeHidden()

  await bandeau(page).click()
  await expect(sommaire(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(sommaire(page)).toBeHidden()
  // Fermé, le volet n'a pas laissé d'étape fantôme dans l'historique.
  await expect
    .poll(() => page.evaluate(() => (history.state as { usr?: unknown } | null)?.usr ?? null))
    .toBeNull()
  await page.goBack()
  await expect(page).not.toHaveURL('/office/laudes/2026-10-06')
})

test('le fil de perles reste lisible à 360 px pour l’office le plus long', async ({ page }) => {
  // Le dimanche, l'office des lectures qui ouvre la journée : 14 étapes.
  await ouvrir(page, '/office/lectures/2026-10-04')
  await amenerSousLeBandeau(titre(page, 'Te Deum'))
  await expect(bandeau(page)).toBeVisible()
  const perles = await bandeau(page)
    .locator('[data-etat]')
    .evaluateAll((ps) =>
      ps.map((p) => p.getBoundingClientRect()).map((r) => [r.left, r.right, r.width]),
    )
  expect(perles).toHaveLength(14)
  for (const [gauche, droite, largeur] of perles) {
    expect(gauche).toBeGreaterThanOrEqual(16)
    expect(droite).toBeLessThanOrEqual(360 - 16)
    expect(largeur).toBeGreaterThanOrEqual(8)
  }
  // Des perles bien séparées, qu'on compte d'un coup d'œil.
  for (let i = 1; i < perles.length; i++)
    expect(perles[i][0] - perles[i - 1][1]).toBeGreaterThanOrEqual(6)
})
