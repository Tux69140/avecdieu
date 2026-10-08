import { expect, type Page } from '@playwright/test'
import { preparer, servirAelf, simulerTelephone, test } from './outils.ts'

// Un rappel que le téléphone bloque en silence (batterie, arrière-plan,
// démarrage automatique, notifications refusées) se voit sans déplier la
// rubrique : son résumé et une ligne de l'accueil le disent (décisions du
// porteur du projet, 2026-10-08).

const MAINTENANT = new Date(2026, 9, 6, 10, 0)
const BRUN_BRIQUE = 'rgb(122, 59, 30)'
const ALERTE = '⚠ Rappels bloqués par le téléphone ›'

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MAINTENANT)
  await servirAelf(page)
})

const boutonRappels = (page: Page) => page.getByRole('button', { name: 'Rappels', exact: true })
const resume = (page: Page) => page.locator('.reglages-rappels .rubrique-resume')
const ligneAlerte = (page: Page) =>
  page.getByRole('link', { name: 'Rappels bloqués par le téléphone' })

// Un Xiaomi au démarrage automatique coupé, laudes activées.
async function xiaomiBloque(page: Page) {
  await simulerTelephone(page, {
    accord: 'granted',
    fabricant: 'xiaomi',
    blocages: { batterie: false, arrierePlan: false, demarrage: true },
  })
  await preparer(page, { rappels: ['laudes'] })
}

test('bloqués : le résumé le dit en brun brique, et le lecteur d’écran l’entend', async ({
  page,
}) => {
  await xiaomiBloque(page)
  await page.goto('/reglages')
  await expect(boutonRappels(page)).toHaveAttribute('aria-expanded', 'false')
  await expect(resume(page)).toHaveText('⚠ Rappels bloqués par le téléphone')
  await expect(resume(page)).toHaveCSS('color', BRUN_BRIQUE)
  // Le résumé est caché au lecteur d'écran : une phrase cachée à l'œil le dit.
  await expect(page.locator('.reglages-rappels .cache-a-l-oeil')).toHaveText(
    'Rappels bloqués par le téléphone.',
  )
  // Une fois dépliée, la rubrique montre l'avis du démarrage automatique.
  await boutonRappels(page).click()
  await expect(page.locator('.rappels-avis')).toHaveText([/Le démarrage automatique est désactivé/])
})

for (const [cas, telephone, rappels, attendu] of [
  [
    'notifications refusées',
    { accord: 'denied' as const },
    ['vepres'],
    '⚠ Rappels bloqués par le téléphone',
  ],
  [
    'arrière-plan interdit',
    { accord: 'granted' as const, blocages: { batterie: false, arrierePlan: true } },
    ['vepres'],
    '⚠ Rappels bloqués par le téléphone',
  ],
  [
    'économiseur de batterie d’un Samsung',
    {
      accord: 'granted' as const,
      fabricant: 'samsung' as const,
      blocages: { batterie: true, arrierePlan: false },
    },
    ['vepres'],
    '⚠ Rappels bloqués par le téléphone',
  ],
  // Un retard possible n'est pas un blocage.
  [
    '« Alarmes et rappels » absente',
    { accord: 'granted' as const, exacte: false },
    ['vepres'],
    'Vêpres',
  ],
  // Sans rappel activé, rien à bloquer.
  ['aucun rappel activé', { accord: 'denied' as const }, [], 'Aucun rappel'],
] as const) {
  test(`résumé de la rubrique : ${cas}`, async ({ page }) => {
    await simulerTelephone(page, telephone)
    await preparer(page, { rappels: [...rappels] })
    await page.goto('/reglages')
    await expect(resume(page)).toHaveText(attendu)
    // L'accueil dit la même chose que le résumé.
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(ligneAlerte(page)).toHaveCount(attendu.startsWith('⚠') ? 1 : 0)
  })
}

test('l’accueil le signale, sans cacher les complies ; un toucher ouvre la rubrique', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await xiaomiBloque(page)
  await page.goto('/')
  const ligne = ligneAlerte(page)
  await expect(ligne).toHaveText(ALERTE)
  await expect(ligne).toHaveCSS('color', BRUN_BRIQUE)
  await expect(ligne).toBeInViewport()
  // L'accueil montre toujours tout jusqu'aux complies sans défiler.
  const complies = page
    .getByRole('list', { name: 'Offices du jour' })
    .getByRole('link', { name: /^Complies/ })
  const boite = (await complies.boundingBox())!
  expect(boite.y + boite.height).toBeLessThanOrEqual(780)

  await ligne.click()
  await expect(page).toHaveURL('/reglages')
  await expect(boutonRappels(page)).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.rappels-avis')).toHaveCount(1)
  // Le retour ramène à l'accueil.
  await page.goBack()
  await expect(page).toHaveURL('/')
})

test('relu au retour dans l’app : réglé dans les Paramètres, l’alerte s’en va', async ({
  page,
}) => {
  await xiaomiBloque(page)
  await page.goto('/')
  await expect(ligneAlerte(page)).toBeVisible()
  // Le priant active le démarrage automatique, puis revient dans l'app.
  await page.evaluate(() => {
    const t = (window as unknown as { __telephone: { blocages: { demarrage?: boolean } } })
      .__telephone
    t.blocages = { ...t.blocages, demarrage: false }
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(ligneAlerte(page)).toHaveCount(0)
})

test('un autre jour aussi, puisque les rappels se jouent sur tous les jours', async ({ page }) => {
  await xiaomiBloque(page)
  await page.goto('/jour/2026-10-11')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dimanche 11 octobre')
  await expect(ligneAlerte(page)).toBeVisible()
})
