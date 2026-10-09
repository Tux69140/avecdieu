import { expect, type Page } from '@playwright/test'
import {
  avancer,
  commencer,
  defilementArrete,
  derniereLigneVisible,
  glisser,
  preparer,
  test,
  toucher,
} from './outils.ts'

// Phase 16 : clôture enrichie et octobre. Intentions des trois premiers Je
// vous salue Marie, Salve Regina, Litanies, verset et oraison du Rosaire, Sous
// l'abri, prière à saint Joseph ; les Litanies et saint Joseph « en octobre ».

const LUNDI_5_OCTOBRE = new Date(2026, 9, 5, 20, 0)
const MERCREDI_30_SEPTEMBRE = new Date(2026, 8, 30, 20, 0)
// Ouverture (7 pas), puis 5 dizaines de 14 pas, puis la prière aux
// intentions du Saint-Père (3 pas, phase 18) : la clôture commence au pas 80.
const CLOTURE = 7 + 5 * 14 + 3

const titre = (page: Page) => page.getByTestId('priere').getByRole('heading', { level: 2 })
const chapelet = (page: Page) => page.locator('main.chapelet')
const defilement = (page: Page) => page.evaluate(() => window.scrollY)

// Jusqu'au premier texte de la clôture.
async function allerALaCloture(page: Page, saintPere = true) {
  await avancer(page, saintPere ? CLOTURE : CLOTURE - 3)
}

test('un chapelet d’octobre récité jusqu’à la fin passe par chaque texte de clôture', async ({
  page,
}) => {
  await page.clock.setFixedTime(LUNDI_5_OCTOBRE)
  // Sous l'abri est désactivé au départ : on l'active pour tout parcourir.
  await commencer(page, '/chapelet', { reglages: { sousLAbri: true } })

  // Les intentions, en rouge, sur les trois premiers Je vous salue Marie.
  await avancer(page, 3)
  for (const intention of ['Pour la foi.', 'Pour l’espérance.', 'Pour la charité.']) {
    await expect(titre(page)).toHaveText('Je vous salue Marie')
    await expect(page.getByTestId('intention')).toHaveText(intention)
    await avancer(page, 1)
  }
  await expect(titre(page)).toHaveText('Gloire au Père')
  await expect(page.getByTestId('intention')).toHaveCount(0)

  await avancer(page, CLOTURE - 6)
  const ordre = [
    'Salve Regina',
    'Litanies de la Sainte Vierge',
    'Oraison du Rosaire',
    'Sous l’abri de votre miséricorde',
    'Prière à saint Joseph',
  ]
  const grain = page.getByTestId('chapelet-dessine')
  const medaille = await grain.getAttribute('data-grain-courant')
  for (const nom of ordre) {
    await expect(titre(page)).toHaveText(nom)
    // Toute la clôture se dit sur la médaille.
    await expect(grain).toHaveAttribute('data-grain-courant', medaille!)
    // Le verset, une seule fois : avant l'oraison, plus à la fin du Salve Regina.
    await expect(page.getByTestId('marque-V')).toHaveCount(nom === 'Oraison du Rosaire' ? 1 : 0)
    await avancer(page, 1)
  }
  await expect(page.getByTestId('fin-chapelet')).toBeVisible()
})

test('l’oraison s’ouvre sur le verset, puis « Prions »', async ({ page }) => {
  await page.clock.setFixedTime(LUNDI_5_OCTOBRE)
  await commencer(page, '/chapelet', { reglages: { litanies: 'jamais' } })
  await allerALaCloture(page)
  await avancer(page, 1)
  await expect(titre(page)).toHaveText('Oraison du Rosaire')
  const strophes = page.getByTestId('strophe')
  await expect(strophes.first()).toContainText('Priez pour nous, sainte Mère de Dieu.')
  await expect(strophes.nth(1)).toHaveText(/^Prions\./)
})

test('le 30 septembre, ni Litanies ni saint Joseph ; sans oraison, le Salve garde son verset', async ({
  page,
}) => {
  await page.clock.setFixedTime(MERCREDI_30_SEPTEMBRE)
  await commencer(page, '/chapelet', { reglages: { oraisonRosaire: false } })
  await allerALaCloture(page)
  await expect(titre(page)).toHaveText('Salve Regina')
  await expect(page.getByTestId('marque-V')).toHaveCount(1)
  await expect(page.getByTestId('marque-R')).toHaveCount(1)
  await avancer(page, 1)
  await expect(page.getByTestId('fin-chapelet')).toBeVisible()
})

test('à plusieurs : la réponse des Litanies en demi-gras, l’Amen de l’oraison par tous', async ({
  page,
}) => {
  await page.clock.setFixedTime(LUNDI_5_OCTOBRE)
  await commencer(page, '/chapelet', { reglages: { plusieurs: true, salveRegina: false } })
  await allerALaCloture(page)
  await expect(titre(page)).toHaveText('Litanies de la Sainte Vierge')
  const invocations = page.getByTestId('invocation')
  await expect(invocations).toHaveCount(66)
  // L'invocation en graisse normale, la réponse, écrite quand elle change, en demi-gras.
  const sainteMarie = invocations.filter({ hasText: /^Sainte Marie,/ })
  await expect(sainteMarie).toHaveText('Sainte Marie, — priez pour nous.')
  await expect(sainteMarie).toHaveCSS('font-weight', '400')
  await expect(sainteMarie.locator('.reponse')).toHaveCSS('font-weight', '600')
  await expect(invocations.filter({ hasText: /^Mère du Christ,$/ })).toHaveCount(1)

  await avancer(page, 1)
  await expect(titre(page)).toHaveText('Oraison du Rosaire')
  const marques = page.getByTestId('strophe').filter({ has: page.getByTestId('marque-R') })
  await expect(marques.last()).toHaveText(/Amen\.$/)
  await expect(page.getByTestId('marque-V')).toHaveCount(2)

  await avancer(page, 1)
  await expect(titre(page)).toHaveText('Prière à saint Joseph')
  await expect(page.getByTestId('strophe').locator('span').first()).toHaveCSS('font-weight', '600')
})

// Une prière plus haute que l'écran : un toucher descend d'un écran en gardant
// deux lignes, puis, le bas affiché, passe à la suite (2026-10-08).
test('les Litanies défilent au toucher, puis le toucher passe à la suite', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await page.clock.setFixedTime(LUNDI_5_OCTOBRE)
  await commencer(page, '/chapelet', { reglages: { salveRegina: false } })
  await allerALaCloture(page)
  await expect(titre(page)).toHaveText('Litanies de la Sainte Vierge')
  const pas = await chapelet(page).getAttribute('data-pas')
  expect(await defilement(page)).toBe(0)
  await expect(page.getByRole('button', { name: 'Plus bas' })).toBeVisible()

  // La dernière ligne entièrement visible avant le toucher le reste après.
  const ligne = await derniereLigneVisible(page)
  await toucher(page)
  await expect.poll(() => defilement(page)).toBeGreaterThan(0)
  const descente = await defilementArrete(page)
  expect(descente).toBeGreaterThan(300)
  expect(ligne - descente).toBeGreaterThanOrEqual(0)
  // Environ deux lignes gardées : la descente d'un écran, moins deux lignes.
  expect(ligne - descente).toBeLessThan(80)
  await expect(chapelet(page)).toHaveAttribute('data-pas', pas!)

  // On touche jusqu'en bas : la page descend, la prière ne change pas.
  const plusBas = page.getByRole('button', { name: 'Plus bas' })
  await expect(async () => {
    if (await plusBas.isVisible()) await toucher(page)
    await expect(plusBas).toBeHidden({ timeout: 500 })
  }).toPass()
  await expect(chapelet(page)).toHaveAttribute('data-pas', pas!)
  await expect(page.getByTestId('invocation').last()).toBeInViewport()

  // Un toucher qui arrête un défilement en mouvement ne compte pas.
  // La page bouge à chaque image pendant une seconde ; on touche une fois le
  // mouvement lancé.
  await page.evaluate(
    () =>
      new Promise<void>((lance) => {
        const fin = performance.now() + 1000
        let images = 0
        const bouger = () => {
          window.scrollBy(0, images % 2 === 0 ? -2 : 2)
          if (++images === 3) lance()
          if (performance.now() < fin) requestAnimationFrame(bouger)
        }
        requestAnimationFrame(bouger)
      }),
  )
  await toucher(page)
  await expect(chapelet(page)).toHaveAttribute('data-pas', pas!)

  // Le bas affiché et la page immobile, le toucher passe à l'oraison.
  await avancer(page, 1)
  await expect(titre(page)).toHaveText('Oraison du Rosaire')
  expect(await defilement(page)).toBe(0)
})

test('le glissement recule toujours, même au milieu des Litanies', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await page.clock.setFixedTime(LUNDI_5_OCTOBRE)
  // Sans Salve Regina ni prière aux intentions du Saint-Père, les Litanies
  // suivent le dernier « Ô mon Jésus ».
  await commencer(page, '/chapelet', {
    reglages: { salveRegina: false, saintPere: false },
  })
  await allerALaCloture(page, false)
  await toucher(page)
  await expect.poll(() => defilement(page)).toBeGreaterThan(300)
  await glisser(page, 160, 300)
  await expect(titre(page)).toHaveText('Ô mon Jésus')
})

test.describe('réglages de la fin du chapelet', () => {
  test('libellés, ordre et valeurs de départ, retenus après redémarrage', async ({ page }) => {
    await preparer(page)
    // Réglages › Chapelet › Prières du chapelet, dans l'ordre où elles se disent.
    await page.goto('/reglages')
    await page.getByRole('link', { name: 'Chapelet' }).click()
    await page.getByRole('link', { name: 'Prières du chapelet' }).click()
    await expect(page).toHaveURL('/reglages/chapelet/prieres')
    const rubrique = page.locator('main')
    const noms = await rubrique
      .locator('.interrupteur-libelle, .choix-frequence-libelle, h2')
      .allTextContents()
    expect(noms).toEqual([
      'Ouverture',
      'Intentions des trois premiers Je vous salue Marie',
      'Chaque dizaine',
      'Annonce des mystères',
      '« Ô mon Jésus » après chaque dizaine',
      'Fin du chapelet',
      'Prière aux intentions du Saint-Père',
      'Salve Regina',
      'Litanies de la Sainte Vierge',
      'Oraison du Rosaire',
      'Sous l’abri de votre miséricorde',
      'Prière à saint Joseph',
    ])
    const interrupteur = (nom: string) => page.getByRole('switch', { name: nom, exact: true })
    const choix = (nom: string) => page.getByRole('radiogroup', { name: nom })
    await expect(
      interrupteur('Intentions des trois premiers Je vous salue Marie'),
    ).toHaveAccessibleDescription('La foi, l’espérance, la charité.')
    await expect(interrupteur('Oraison du Rosaire')).toHaveAccessibleDescription(
      'Précédée du verset “Priez pour nous, sainte Mère de Dieu”.',
    )
    for (const nom of ['Intentions des trois premiers Je vous salue Marie', 'Salve Regina'])
      await expect(interrupteur(nom)).toHaveAttribute('aria-checked', 'true')
    await expect(interrupteur('Oraison du Rosaire')).toHaveAttribute('aria-checked', 'true')
    await expect(interrupteur('Sous l’abri de votre miséricorde')).toHaveAttribute(
      'aria-checked',
      'false',
    )
    for (const nom of ['Litanies de la Sainte Vierge', 'Prière à saint Joseph']) {
      await expect(choix(nom).getByRole('radio')).toHaveText(['En octobre', 'Toujours', 'Jamais'])
      await expect(choix(nom).getByRole('radio', { name: 'En octobre' })).toHaveAttribute(
        'aria-checked',
        'true',
      )
    }
    await expect(rubrique).toContainText('Octobre est le mois du Rosaire.')
    await expect(rubrique).toContainText('Demandée par Léon XIII pour le mois du Rosaire.')

    await choix('Litanies de la Sainte Vierge').getByRole('radio', { name: 'Toujours' }).click()
    await choix('Prière à saint Joseph').getByRole('radio', { name: 'Jamais' }).click()
    await interrupteur('Sous l’abri de votre miséricorde').click()
    await interrupteur('Intentions des trois premiers Je vous salue Marie').click()
    await page.reload()
    await expect(
      choix('Litanies de la Sainte Vierge').getByRole('radio', { name: 'Toujours' }),
    ).toHaveAttribute('aria-checked', 'true')
    await expect(
      choix('Prière à saint Joseph').getByRole('radio', { name: 'Jamais' }),
    ).toHaveAttribute('aria-checked', 'true')
    await expect(interrupteur('Sous l’abri de votre miséricorde')).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(interrupteur('Intentions des trois premiers Je vous salue Marie')).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  test('sans intentions, les trois premiers Je vous salue Marie n’en portent pas', async ({
    page,
  }) => {
    await page.clock.setFixedTime(LUNDI_5_OCTOBRE)
    await commencer(page, '/chapelet', { reglages: { intentions: false } })
    await avancer(page, 3)
    await expect(titre(page)).toHaveText('Je vous salue Marie')
    await expect(page.getByTestId('intention')).toHaveCount(0)
  })

  test('en compact, l’intention reste affichée', async ({ page }) => {
    await page.clock.setFixedTime(LUNDI_5_OCTOBRE)
    await commencer(page, '/chapelet', { affichage: 'compact' })
    await avancer(page, 3)
    await expect(page.getByTestId('intention')).toHaveText('Pour la foi.')
  })
})

test('« A propos » : l’en-tête ouvert, quatre rubriques repliées', async ({ page }) => {
  await preparer(page)
  await page.goto('/a-propos')
  await expect(page.getByText(/^Version \d+\.\d+$/)).toBeVisible()
  await expect(page.getByText('Rien ne quitte votre téléphone', { exact: false })).toBeVisible()
  const rubriques = page.locator('.rubrique-titre button')
  await expect(rubriques).toHaveText([
    'Textes',
    'Chapelet et Rosaire',
    'Cloches des rappels',
    'Heures solaires',
  ])
  for (const bouton of await rubriques.all())
    await expect(bouton).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText(/Léon XIII/)).toBeHidden()

  await page.getByRole('button', { name: 'Chapelet et Rosaire' }).click()
  await expect(
    page.getByText(
      'Ordre de la fin du chapelet : celui des feuillets de prière en usage en France',
      { exact: false },
    ),
  ).toBeVisible()
  await expect(
    page.getByText(/demandées par Léon XIII en 1883 \(Supremi apostolatus officio\)/),
  ).toBeVisible()
  await expect(
    page.getByText(/la prière à saint Joseph, qu’il a demandée en 1889 \(Quamquam pluries\)/),
  ).toBeVisible()
  await expect(page.getByText(/© AELF, Paris/)).toBeHidden()
  await page.getByRole('button', { name: 'Chapelet et Rosaire' }).click()
  await expect(page.getByText(/Léon XIII/)).toBeHidden()
})
