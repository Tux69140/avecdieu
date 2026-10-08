import { expect, type Page } from '@playwright/test'
import { commencer, glisser, preparer, suivant, test, toucher } from './outils.ts'

// Phase 3 : annonce des mystères, mode compact, choix de la série, aide aux gestes.

const LUNDI = new Date(2026, 9, 5, 10, 0)
const titreAnnonce = (page: Page) => page.getByTestId('annonce').getByRole('heading', { level: 2 })
const perle = (page: Page) => page.getByRole('button', { name: 'Commencer la dizaine' })
const titrePriere = (page: Page) => page.getByTestId('priere').getByRole('heading', { level: 2 })

async function jusquALAnnonce(page: Page) {
  for (let i = 0; i < 7; i++) await toucher(page)
  await expect(titreAnnonce(page)).toHaveText('L’Annonciation')
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(LUNDI)
})

test.describe('annonce du mystère, en texte complet', () => {
  test('présente le titre, les fruits, la référence et le passage', async ({ page }) => {
    await commencer(page)
    await jusquALAnnonce(page)
    const annonce = page.getByTestId('annonce')
    await expect(annonce.getByText('Premier mystère')).toBeVisible()
    await expect(annonce).toContainText('Fruit du mystère l’humilité')
    await expect(annonce).toContainText('Montfort : « une profonde humilité de cœur »')
    await expect(page.getByTestId('passage')).toContainText('Lc 1, 26-38')
    await expect(page.getByTestId('passage')).toContainText('Le sixième mois, l’ange Gabriel')
  })

  test('un toucher hors de la grosse perle n’avance pas, un toucher sur la perle avance', async ({
    page,
  }) => {
    await commencer(page)
    await jusquALAnnonce(page)
    await toucher(page)
    await page.getByTestId('passage').tap()
    await page.keyboard.press('Space')
    await expect(titreAnnonce(page)).toHaveText('L’Annonciation')

    await perle(page).tap()
    await expect(titrePriere(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('mystere')).toHaveText('1 · L’Annonciation')
  })

  test('le mystère se lit au-dessus du filet, séparé du titre de la prière', async ({ page }) => {
    await commencer(page)
    await jusquALAnnonce(page)
    await perle(page).tap()
    await expect(titrePriere(page)).toHaveText('Notre Père')
    const mystere = (await page.getByTestId('mystere').boundingBox())!
    // Le filet est le bord haut de la section de la prière.
    const priere = (await page.getByTestId('priere').boundingBox())!
    expect(mystere.y + mystere.height).toBeLessThanOrEqual(priere.y)
    await expect(page.getByTestId('priere').getByTestId('mystere')).toHaveCount(0)
  })

  test('glisser vers le haut fait défiler le passage sans lancer la dizaine', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await commencer(page)
    await jusquALAnnonce(page)
    const avant = await page.evaluate(() => window.scrollY)
    await glisser(page, 0, 400, -250)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(avant + 100)
    await expect(titreAnnonce(page)).toHaveText('L’Annonciation')
  })

  test('glisser de côté revient au Gloire au Père de l’ouverture', async ({ page }) => {
    await commencer(page)
    await jusquALAnnonce(page)
    await glisser(page, 160)
    await expect(titrePriere(page)).toHaveText('Gloire au Père')
  })
})

test.describe('passages qui tournent', () => {
  test('le passage change après 6 lectures du mystère', async ({ page }) => {
    await commencer(page, '/chapelet', { lectures: { 'joyeux-1': 5 } })
    await jusquALAnnonce(page)
    await expect(page.getByTestId('passage')).toContainText('Lc 1, 26-38')
    // Passer l'annonce compte la 6e lecture.
    await perle(page).tap()
    await expect(titrePriere(page)).toHaveText('Notre Père')

    // Revenir sur ses pas ne compte pas une lecture de plus.
    await glisser(page, 160)
    await perle(page).tap()

    await page.goBack()
    await page.getByRole('button', { name: 'Recommencer du début' }).click()
    await expect(titrePriere(page)).toHaveText('Signe de croix')
    await jusquALAnnonce(page)
    await expect(page.getByTestId('passage')).toContainText('Mt 1, 18-25')
    const lectures = await page.evaluate(() => localStorage.getItem('avec-dieu.lectures'))
    expect(JSON.parse(lectures!)).toEqual({ 'joyeux-1': 6 })
  })
})

test.describe('mode compact', () => {
  test('le basculement se retient, et l’annonce se fait sur le Notre Père', async ({ page }) => {
    await preparer(page)
    await page.goto('/chapelet')
    await page.getByRole('radio', { name: 'Compact' }).click()
    await expect(page.getByRole('radio', { name: 'Compact' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await page.reload()
    await expect(page.getByRole('radio', { name: 'Compact' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()

    // Seuls le nom de la prière et le compteur.
    await expect(titrePriere(page)).toHaveText('Signe de croix')
    await expect(page.getByTestId('strophe')).toHaveCount(0)

    for (let i = 0; i < 7; i++) await toucher(page)
    await expect(page.getByTestId('annonce')).toHaveCount(0)
    await expect(titrePriere(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('mystere')).toHaveText('1 · L’Annonciation')
    await expect(page.getByText('Fruit : l’humilité')).toBeVisible()
    await toucher(page)
    await expect(page.getByTestId('compteur')).toHaveText('1 / 10')
  })

  test('« Voir la prière » et « Afficher la Lecture » déplient sans faire avancer', async ({
    page,
  }) => {
    await commencer(page, '/chapelet', { affichage: 'compact' })
    for (let i = 0; i < 8; i++) await toucher(page)
    await expect(page.getByTestId('compteur')).toHaveText('1 / 10')

    await page.getByRole('button', { name: 'Voir la prière' }).tap()
    await expect(page.getByTestId('strophe').first()).toContainText('Je vous salue, Marie')
    await page.getByRole('button', { name: 'Afficher la Lecture' }).tap()
    await expect(page.getByTestId('passage')).toContainText('Lc 1, 26-38')
    await expect(page.getByTestId('compteur')).toHaveText('1 / 10')

    // Au grain suivant, la prière se replie ; le passage reste ouvert pendant la dizaine.
    await page.getByRole('button', { name: 'Masquer la prière' }).tap()
    await expect(page.getByTestId('strophe')).toHaveCount(0)
    await page.getByRole('button', { name: 'Voir la prière' }).tap()
    await toucher(page)
    await expect(page.getByTestId('compteur')).toHaveText('2 / 10')
    await expect(page.getByTestId('strophe')).toHaveCount(0)
    await expect(page.getByTestId('passage')).toBeVisible()
    await page.getByRole('button', { name: 'Masquer la Lecture' }).tap()
    await expect(page.getByTestId('passage')).toHaveCount(0)
  })
})

test('en compact, les liens restent sous le titre quand la prière ou le passage se déplient', async ({
  page,
}) => {
  // Le plus petit téléphone visé : les libellés longs y passeraient à la ligne.
  await page.setViewportSize({ width: 360, height: 760 })
  await commencer(page, '/chapelet', { affichage: 'compact' })
  for (let i = 0; i < 8; i++) await toucher(page)
  await expect(page.getByTestId('compteur')).toHaveText('1 / 10')
  const position = async (nom: RegExp) => {
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
    const boite = (await page.getByRole('button', { name: nom }).boundingBox())!
    // Position dans la page, que l'écran ait défilé ou non.
    const y = Math.round(boite.y + (await page.evaluate(() => window.scrollY)))
    return `${Math.round(boite.x)},${y}`
  }
  const priere = /^(Voir|Masquer) la prière$/
  const passage = /^(Afficher|Masquer) la Lecture$/
  const avant = [await position(priere), await position(passage)]
  await page.getByRole('button', { name: 'Voir la prière' }).tap()
  expect([await position(priere), await position(passage)]).toEqual(avant)
  await page.getByRole('button', { name: 'Afficher la Lecture' }).tap()
  expect([await position(priere), await position(passage)]).toEqual(avant)
})

test.describe('choix de la série', () => {
  const SERIES: [string, string, string][] = [
    ['Mystères lumineux', 'Le jeudi', 'Le Baptême de Jésus au Jourdain'],
    ['Mystères douloureux', 'Le mardi et le vendredi', 'L’Agonie de Jésus à Gethsémani'],
    ['Mystères glorieux', 'Le mercredi et le dimanche', 'La Résurrection'],
  ]
  for (const [serie, jours, premier] of SERIES) {
    test(`${serie.toLowerCase()} s’ouvrent depuis le seuil`, async ({ page }) => {
      await preparer(page)
      await page.goto('/chapelet')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mystères joyeux')
      const lien = page.getByRole('link', { name: new RegExp(serie) })
      await expect(lien).toContainText(jours)
      await lien.click()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(serie)
      await expect(page.getByText(/^Chapelet\s·\s/)).toBeVisible()
      await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
      // Une touche pressée avant que l'écran soit prêt serait perdue.
      await expect(titrePriere(page)).toHaveText('Signe de croix')
      for (let i = 0; i < 7; i++) await toucher(page)
      await expect(titreAnnonce(page)).toHaveText(premier)
    })
  }

  test('les mystères du jour restent à portée depuis une autre série', async ({ page }) => {
    await preparer(page)
    await page.goto('/chapelet/glorieux')
    const lien = page.getByRole('link', { name: /Mystères joyeux/ })
    await expect(lien).toContainText('Le lundi et le samedi · aujourd’hui')
    await lien.click()
    await expect(page).toHaveURL(/\/chapelet$/)
    await expect(page.getByText(/^Chapelet\sdu\sjour\s·\s/)).toBeVisible()
  })

  test('changer plusieurs fois de mystères n’empile pas les seuils : un retour suffit', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/')
    await page.goto('/chapelet')
    for (const serie of [/Mystères glorieux/, /Mystères douloureux/, /Mystères lumineux/]) {
      await page.getByRole('link', { name: serie }).click()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(serie)
    }
    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
  })

  test('le retour d’Android ramène du chapelet à son seuil', async ({ page }) => {
    await commencer(page)
    await toucher(page)
    await page.goBack()
    await expect(page.getByRole('button', { name: 'Reprendre le chapelet' })).toBeVisible()
  })
})

test.describe('aide aux gestes', () => {
  test('s’ouvre au début du chapelet sans que ses touchers fassent avancer', async ({ page }) => {
    await preparer(page, { aide: true })
    await page.goto('/chapelet')
    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    const aide = page.getByRole('dialog', { name: 'Prier avec l’app' })
    await expect(aide).toBeVisible()
    await aide.getByText('Glissez de côté').tap()
    await page.getByRole('button', { name: 'J’ai compris' }).tap()
    await expect(aide).toHaveCount(0)
    await expect(titrePriere(page)).toHaveText('Signe de croix')

    // Elle revient à l'ouverture suivante, faute d'avoir coché « Ne plus afficher ».
    await page.goBack()
    await page.getByRole('button', { name: 'Reprendre le chapelet' }).click()
    await expect(aide).toBeVisible()
  })

  test('« Ne plus afficher » la retire pour de bon', async ({ page }) => {
    await preparer(page, { aide: true })
    await page.goto('/chapelet')
    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    await page.getByLabel('Ne plus afficher').check()
    await page.getByRole('button', { name: 'J’ai compris' }).click()
    await suivant(page)
    await expect(titrePriere(page)).toHaveText('Je crois en Dieu')

    // Après redémarrage de l'app, le chapelet reprend, sans l'aide.
    await page.reload()
    await expect(titrePriere(page)).toHaveText('Je crois en Dieu')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})

test.describe('« Plus bas »', () => {
  test('signale la suite du seuil sur un petit écran, puis s’efface en bas', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await preparer(page)
    await page.goto('/chapelet')
    const indice = page.getByRole('button', { name: 'Plus bas' })
    await expect(indice).toBeVisible()
    // « Plus bas » et son chevron sur une seule ligne : le libellé tient sur
    // une ligne, et le chevron est à sa hauteur.
    const { ligne, chevron } = await indice.evaluate((b) => {
      const plage = document.createRange()
      plage.selectNodeContents(b)
      const lignes = [...plage.getClientRects()].filter((r) => r.width > 0)
      const svg = b.querySelector('svg')!.getBoundingClientRect()
      return {
        ligne: {
          haut: Math.min(...lignes.map((r) => r.top)),
          bas: Math.max(...lignes.map((r) => r.bottom)),
        },
        chevron: svg.top + svg.height / 2,
      }
    })
    expect(ligne.bas - ligne.haut).toBeLessThan(30)
    expect(chevron).toBeGreaterThan(ligne.haut)
    expect(chevron).toBeLessThan(ligne.bas)
    await indice.click()
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(indice).toHaveCount(0)
  })

  test('apparaît au-dessus de la grosse perle quand le passage continue', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await commencer(page)
    await jusquALAnnonce(page)
    await expect(page.getByRole('button', { name: 'Plus bas' })).toBeVisible()
  })
})
