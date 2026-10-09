import { expect, type Page } from '@playwright/test'
import { preparer, servirAelf, simulerTelephone, test } from './outils.ts'

// Les réglages en pages emboîtées, comme les Paramètres d'Android
// (arborescence validée par le porteur du projet, 2026-10-08) : chaque ligne
// ouvre sa page ; la croix comme le retour d'Android remontent d'un niveau.

const titre = (page: Page) => page.getByRole('heading', { level: 1 })
const fermer = (page: Page) => page.getByRole('button', { name: 'Fermer', exact: true }).click()

// Le chemin depuis Réglages, ligne par ligne, avec l'adresse et le titre de chaque page.
const ARBORESCENCE: [string[], string, string][] = [
  [['Heures et rappels'], '/reglages/rappels', 'Heures et rappels'],
  [['Heures et rappels', 'Laudes'], '/reglages/rappels/laudes', 'Laudes'],
  [['Heures et rappels', 'Laudes', 'Son'], '/reglages/rappels/laudes/son', 'Son'],
  [
    ['Heures et rappels', 'Rappels bloqués ? Régler la batterie'],
    '/reglages/rappels/batterie',
    'Sur un Xiaomi',
  ],
  [['Chapelet et Rosaire'], '/reglages/chapelet', 'Chapelet et Rosaire'],
  [
    ['Chapelet et Rosaire', 'Prières du chapelet'],
    '/reglages/chapelet/prieres',
    'Prières du chapelet',
  ],
  [['Offices'], '/reglages/offices', 'Offices'],
  [['Offices', 'Zone liturgique'], '/reglages/offices/zone', 'Zone liturgique'],
  [['Affichage'], '/reglages/affichage', 'Affichage'],
  [['Réinitialiser l’app'], '/reglages/reinitialiser', 'Réinitialiser l’app ?'],
]

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 6, 10, 0))
  await servirAelf(page)
  await simulerTelephone(page, {
    accord: 'granted',
    fabricant: 'xiaomi',
    blocages: { batterie: false, arrierePlan: false, demarrage: false },
  })
  await preparer(page)
})

// Du menu de l'accueil aux Réglages, puis de ligne en ligne.
async function ouvrir(page: Page, lignes: string[]) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('link', { name: 'Réglages' }).click()
  await expect(titre(page)).toHaveText('Réglages')
  for (const ligne of lignes) await page.getByRole('link', { name: ligne }).first().click()
}

for (const [lignes, chemin, nom] of ARBORESCENCE) {
  test(`${lignes.join(' › ')} : s’ouvre par sa ligne, la croix et le retour remontent`, async ({
    page,
  }) => {
    // Aller par les lignes, revenir par la croix, niveau par niveau.
    await ouvrir(page, lignes)
    await expect(page).toHaveURL(chemin)
    await expect(titre(page)).toHaveText(nom)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    // La page parente : l'adresse sans son dernier morceau.
    const parente = (c: string) => c.slice(0, c.lastIndexOf('/'))
    for (let c = chemin; c !== '/reglages';) {
      await fermer(page)
      c = parente(c)
      await expect(page).toHaveURL(c)
    }
    await fermer(page)
    await expect(page).toHaveURL('/')

    // Le retour d'Android fait de même.
    await ouvrir(page, lignes)
    await expect(page).toHaveURL(chemin)
    for (let c = chemin; c !== '/reglages';) {
      await page.goBack()
      c = parente(c)
      await expect(page).toHaveURL(c)
    }
    await page.goBack()
    await expect(page).toHaveURL('/')
  })
}

test('ouverte directement, une page profonde remonte à sa page parente', async ({ page }) => {
  await page.goto('/reglages/chapelet/prieres')
  await fermer(page)
  await expect(page).toHaveURL('/reglages/chapelet')
  await fermer(page)
  await expect(page).toHaveURL('/reglages')
  await fermer(page)
  await expect(page).toHaveURL('/')
})

test('une prière inconnue ramène à la page des rappels', async ({ page }) => {
  await page.goto('/reglages/rappels/inconnue')
  await expect(page).toHaveURL('/reglages/rappels')
  await expect(titre(page)).toHaveText('Heures et rappels')
})
