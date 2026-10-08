import { AxeBuilder } from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import {
  faireRevenirBandeau,
  avancer,
  commencer,
  deplierReglages,
  preparer,
  servirAelf,
  simulerTelephone,
  test,
} from './outils.ts'

// Contrôle automatique d'accessibilité (contrastes, titres, libellés ARIA) :
// échoue sur toute violation grave ou critique. Le clavier et le lecteur
// d'écran restent à vérifier à la main.
async function violationsGraves(page: Page) {
  // Un texte en plein fondu d'apparition n'a pas encore son contraste final.
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
  const { violations } = await new AxeBuilder({ page }).analyze()
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} : ${v.help} (${v.nodes.length} élément(s))`)
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 5, 10, 0))
})

test('seuil du chapelet', async ({ page }) => {
  await preparer(page)
  await page.goto('/chapelet')
  await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('aide aux gestes', async ({ page }) => {
  await preparer(page, { aide: true })
  await page.goto('/chapelet')
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  await expect(page.getByRole('dialog', { name: 'Prier avec l’app' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

// L'aide à la lecture de l'office, un jour en blanc (sa perle d'exemple).
async function aideDeLOffice(page: Page) {
  await servirAelf(page)
  await preparer(page, { aide: true })
  await page.goto('/office/laudes/2026-11-01')
  await expect(page.getByRole('dialog', { name: 'Lire un office' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
}

test('aide à la lecture de l’office', async ({ page }) => {
  await aideDeLOffice(page)
})

test('écran du chapelet, au signe de croix', async ({ page }) => {
  await commencer(page)
  expect(await violationsGraves(page)).toEqual([])
})

test('annonce d’un mystère', async ({ page }) => {
  await commencer(page)
  await avancer(page, 7)
  await expect(page.getByTestId('annonce')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('écran du chapelet, pendant une dizaine', async ({ page }) => {
  await commencer(page)
  await avancer(page, 10)
  await expect(page.getByTestId('mystere')).toBeVisible()
  // La croix qui ferme le chapelet est analysée avec l'écran.
  await expect(page.getByRole('button', { name: 'Fermer', exact: true })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('mode compact, prière et passage dépliés', async ({ page }) => {
  await commencer(page, '/chapelet', { affichage: 'compact' })
  await avancer(page, 8)
  await page.getByRole('button', { name: 'Voir la prière' }).click()
  await page.getByRole('button', { name: 'Afficher la Lecture' }).click()
  await expect(page.getByTestId('passage')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('écran de fin du chapelet', async ({ page }) => {
  await commencer(page)
  await avancer(page, 78)
  await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fermer', exact: true })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('écran des réglages', async ({ page }) => {
  await preparer(page)
  await page.goto('/reglages')
  await deplierReglages(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Réglages')
  expect(await violationsGraves(page)).toEqual([])
})

test('seuil d’un chapelet en cours', async ({ page }) => {
  await commencer(page)
  await avancer(page, 10)
  await page.goBack()
  await expect(page.getByRole('button', { name: 'Recommencer du début' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('prier à plusieurs, V/ et R/', async ({ page }) => {
  await commencer(page, '/chapelet', { reglages: { plusieurs: true } })
  await avancer(page, 3)
  await expect(page.getByTestId('marque-R')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('menu', async ({ page }) => {
  await preparer(page)
  await page.goto('/menu')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avec Dieu')
  expect(await violationsGraves(page)).toEqual([])
})

for (const [nom, heure, chemin] of [
  ['accueil, le soir', 21, '/'],
  ['accueil, le jour', 17, '/'],
  ['accueil d’un autre jour', 10, '/jour/2027-02-17'],
] as const) {
  test(nom, async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 5, heure, 0))
    await servirAelf(page)
    await preparer(page)
    await page.goto(chemin)
    await expect(page.getByTestId('bandeau').locator('.bandeau-pastille')).toBeVisible()
    expect(await violationsGraves(page)).toEqual([])
  })
}

test('accueil sans réponse de l’AELF', async ({ page }) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
  await preparer(page)
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

for (const office of ['laudes', 'lectures', 'complies']) {
  test(`office : ${office}`, async ({ page }) => {
    await servirAelf(page)
    await preparer(page)
    await page.goto(`/office/${office}/2026-10-06`)
    await expect(page.getByTestId('office')).toBeVisible()
    expect(await violationsGraves(page)).toEqual([])
  })
}

test('office : lien de l’invitatoire, prières courantes en entier, ajouts signalés', async ({
  page,
}) => {
  await servirAelf(page)
  await preparer(page, { reglages: { prieresEntieres: true, plusieurs: true } })
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  await page.goto('/office/lectures/2026-10-06')
  await expect(page.getByRole('button', { name: 'Le dire ici' })).toBeVisible()
  await expect(page.getByTestId('office')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

// Phase 7 : le bandeau de l'étape en cours, puis le sommaire ouvert.
async function bandeauPuisSommaire(page: Page) {
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  await faireRevenirBandeau(page)
  await expect(page.getByTestId('bandeau-office')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
  await page.getByTestId('bandeau-office').click()
  await expect(page.getByRole('dialog', { name: 'Sommaire · Laudes' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
}

test('office : bandeau et sommaire', async ({ page }) => {
  await servirAelf(page)
  await bandeauPuisSommaire(page)
})

test('office injoignable', async ({ page }) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort())
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByRole('alert')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('à propos', async ({ page }) => {
  await preparer(page)
  await page.goto('/a-propos')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avec Dieu')
  expect(await violationsGraves(page)).toEqual([])
})

test('premier lancement sans réseau : accueil et office', async ({ page }) => {
  await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
  await preparer(page)
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Prier le chapelet' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
  await page.goto('/office/laudes/2026-10-05')
  await expect(page.getByRole('alert')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('réglages dépliés, de jour puis de nuit', async ({ page }) => {
  await preparer(page)
  await page.goto('/reglages')
  await deplierReglages(page)
  expect(await violationsGraves(page)).toEqual([])
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit')
  expect(await violationsGraves(page)).toEqual([])
})

test('choix de la zone liturgique, puis sa confirmation', async ({ page }) => {
  // La confirmation ne vient que si des textes sont gardés : on attend la réserve.
  const demandes = await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await expect.poll(() => demandes.length).toBe(72)
  await page.goto('/reglages')
  await deplierReglages(page, 'Offices')
  await expect(page.getByTestId('hors-connexion')).toContainText('jusqu’au')
  await page.getByRole('button', { name: /^Zone liturgique/ }).click()
  await expect(page.getByRole('dialog', { name: 'Zone liturgique' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
  await page.getByRole('radio', { name: 'Suisse' }).click()
  await expect(page.getByRole('dialog', { name: 'Changer de zone ?' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

// Les fenêtres du premier rappel activé, et le choix du son déplié.
async function fenetresDesRappels(page: Page) {
  await simulerTelephone(page, {
    accord: 'prompt',
    exacte: false,
    fabricant: 'xiaomi',
    blocages: { batterie: true, arrierePlan: true, demarrage: true },
  })
  await preparer(page)
  await page.goto('/reglages')
  await deplierReglages(page, 'Rappels')
  await page.getByRole('switch', { name: 'Laudes, rappel' }).click()
  for (const [titre, bouton] of [
    ['Recevoir les rappels', 'Continuer'],
    ['A la minute près', 'Plus tard'],
    ['Sur un Xiaomi', 'Plus tard'],
    ['Démarrage automatique', 'Plus tard'],
  ]) {
    const fenetre = page.getByRole('dialog', { name: titre })
    await expect(fenetre).toBeVisible()
    expect(await violationsGraves(page)).toEqual([])
    await fenetre.getByRole('button', { name: bouton }).click()
  }
  await page.locator('.rappel-nom').nth(1).click()
  await expect(page.getByRole('radiogroup', { name: 'Son, Laudes' })).toBeVisible()
  await expect(page.locator('.rappels-avis')).toHaveCount(4)
  expect(await violationsGraves(page)).toEqual([])
}

test('rappels : fenêtres d’autorisation, avis et choix du son', async ({ page }) => {
  await fenetresDesRappels(page)
})

test('rappels bloqués : la ligne de l’accueil et le résumé, de jour puis de nuit', async ({
  page,
}) => {
  await servirAelf(page)
  await simulerTelephone(page, {
    accord: 'granted',
    blocages: { batterie: false, arrierePlan: true },
  })
  await preparer(page, { rappels: ['laudes'] })
  for (const chemin of ['/', '/reglages']) {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(chemin)
    await expect(page.getByText('Rappels bloqués par le téléphone').first()).toBeAttached()
    if (chemin === '/')
      await expect(page.getByTestId('bandeau').locator('.bandeau-pastille')).toBeVisible()
    expect(await violationsGraves(page)).toEqual([])
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit')
    expect(await violationsGraves(page)).toEqual([])
  }
})

test.describe('de nuit', () => {
  test('rappels : fenêtres d’autorisation, avis et choix du son', async ({ page }) => {
    await fenetresDesRappels(page)
  })

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await servirAelf(page)
  })

  test('accueil', async ({ page }) => {
    await preparer(page)
    await page.goto('/')
    await expect(page.getByTestId('bandeau').locator('.bandeau-pastille')).toBeVisible()
    expect(await violationsGraves(page)).toEqual([])
  })

  test('office', async ({ page }) => {
    await preparer(page)
    await page.goto('/office/laudes/2026-10-06')
    await expect(page.getByTestId('office')).toBeVisible()
    expect(await violationsGraves(page)).toEqual([])
  })

  test('aide à la lecture de l’office', async ({ page }) => {
    await aideDeLOffice(page)
  })

  test('office : bandeau et sommaire', async ({ page }) => {
    await bandeauPuisSommaire(page)
  })

  test('chapelet, seuil puis dizaine', async ({ page }) => {
    await preparer(page)
    await page.goto('/chapelet')
    expect(await violationsGraves(page)).toEqual([])
    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    await avancer(page, 10)
    expect(await violationsGraves(page)).toEqual([])
  })

  test('menu', async ({ page }) => {
    await preparer(page)
    await page.goto('/menu')
    expect(await violationsGraves(page)).toEqual([])
  })
})

test('lieu des heures solaires, villes trouvées et erreur', async ({ page }) => {
  await preparer(page)
  await page.goto('/lieu')
  await page.getByRole('searchbox', { name: 'Chercher une ville' }).fill('saint-den')
  await expect(page.getByRole('list', { name: 'Villes trouvées' })).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
  await page.getByRole('searchbox', { name: 'Chercher une ville' }).fill('Trifouilly')
  await expect(page.getByRole('alert')).toBeVisible()
  expect(await violationsGraves(page)).toEqual([])
})

test('heures solaires : rubrique et volet, de jour puis de nuit', async ({ page }) => {
  await preparer(page)
  await page.addInitScript(() => {
    const lieu = { nom: 'Lyon', pres: false, latitude: 45.75, longitude: 4.85 }
    localStorage.setItem('avec-dieu.lieu', JSON.stringify({ lieu }))
    localStorage.setItem('avec-dieu.heures-solaires', JSON.stringify({ actives: true }))
  })
  await page.goto('/reglages')
  await deplierReglages(page, 'Rappels')
  expect(await violationsGraves(page)).toEqual([])
  await page.getByRole('button', { name: /^Vêpres, heure solaire/ }).click()
  await expect(page.getByRole('dialog', { name: 'Vêpres' })).toBeVisible()
  await page.waitForFunction(() => document.getAnimations().length === 0)
  expect(await violationsGraves(page)).toEqual([])
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nuit')
  expect(await violationsGraves(page)).toEqual([])
})
