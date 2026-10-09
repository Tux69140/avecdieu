import { expect, type Page } from '@playwright/test'
import {
  avancer,
  commencerRosaire,
  preparer,
  simulerTelephone,
  telephone,
  test,
  toucherNotification,
} from './outils.ts'

// Phase 17 : le Rosaire. Ouverture une fois, vingt dizaines de la série
// joyeuse à la glorieuse, une ligne en rouge à chaque passage de série, un
// repère « Série n sur 4 » toujours visible, clôture une fois (critère de
// succès 9) ; reprise au grain exact le jour même.

// Un jeudi d'octobre : Litanies et saint Joseph sont dits à la clôture.
const JEUDI = new Date(2026, 9, 8, 10, 0)
const VENDREDI = new Date(2026, 9, 9, 8, 0)

const SERIES = [
  ['joyeux', 'L’Annonciation'],
  ['lumineux', 'Le Baptême de Jésus au Jourdain'],
  ['douloureux', 'L’Agonie de Jésus à Gethsémani'],
  ['glorieux', 'La Résurrection'],
] as const
const PASSAGES = [
  null,
  'Les mystères joyeux sont achevés. Viennent les mystères lumineux.',
  'Les mystères lumineux sont achevés. Viennent les mystères douloureux.',
  'Les mystères douloureux sont achevés. Viennent les mystères glorieux.',
]
const ORDINAUX = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième']
// L'ouverture (7 pas), puis chaque dizaine (14 pas).
const OUVERTURE = 7
const DIZAINE = 14

const chapelet = (page: Page) => page.locator('main.chapelet')
const titre = (page: Page) => page.getByTestId('priere').getByRole('heading', { level: 2 })
const annonce = (page: Page) => page.getByTestId('annonce')
const serie = (page: Page) => page.getByRole('heading', { level: 1 })
const repere = (page: Page) => page.getByTestId('repere-serie')
const passage = (page: Page) => page.getByTestId('passage-serie')
// Un texte vu sans ses espaces insécables.
const texte = (locator: ReturnType<Page['locator']>) =>
  locator.evaluate((e) => e.textContent!.replace(/\u2060/g, '').replace(/[\u00a0\u202f]/g, ' '))

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(JEUDI)
})

test('un Rosaire complet se récite du début à la fin', async ({ page }) => {
  test.setTimeout(300_000)
  await commencerRosaire(page)
  await expect(serie(page)).toHaveText('Mystères joyeux')
  await expect(repere(page)).toHaveText('Série 1 sur 4')

  // L'ouverture, une seule fois.
  for (const nom of ['Signe de croix', 'Je crois en Dieu', 'Notre Père']) {
    await expect(titre(page)).toHaveText(nom)
    await avancer(page, 1)
  }
  await avancer(page, OUVERTURE - 3)

  // Les vingt dizaines, dans l'ordre ; le passage de série en tête de
  // l'annonce du premier mystère des séries 2 à 4, et nulle part ailleurs.
  for (const [s, [nomSerie, premier]] of SERIES.entries()) {
    for (let d = 1; d <= 5; d++) {
      const ou = `série ${s + 1}, dizaine ${d}`
      await expect(annonce(page).locator('.etiquette'), ou).toHaveText(`${ORDINAUX[d - 1]} mystère`)
      if (d === 1) await expect(annonce(page).getByRole('heading')).toHaveText(premier)
      await expect(serie(page), ou).toHaveText(`Mystères ${nomSerie}`)
      await expect(repere(page), ou).toHaveText(`Série ${s + 1} sur 4`)
      if (d === 1 && PASSAGES[s]) expect(await texte(passage(page))).toBe(PASSAGES[s])
      else await expect(passage(page), ou).toHaveCount(0)
      await avancer(page, DIZAINE)
    }
  }

  // La prière aux intentions du Saint-Père (phase 18), puis la clôture, une
  // seule fois, puis la fin.
  await expect(page.getByTestId('intention')).toHaveText('Aux intentions du Saint-Père.')
  for (const nom of [
    'Notre Père',
    'Je vous salue Marie',
    'Gloire au Père',
    'Salve Regina',
    'Litanies de la Sainte Vierge',
    'Oraison du Rosaire',
    'Prière à saint Joseph',
  ]) {
    await expect(titre(page)).toHaveText(nom)
    await expect(repere(page)).toHaveText('Série 4 sur 4')
    await avancer(page, 1)
  }
  await expect(page.getByRole('region', { name: 'Fin du Rosaire' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Rosaire terminé' })).toBeVisible()
  await expect(chapelet(page)).toHaveAttribute('data-pas', String(OUVERTURE + 20 * DIZAINE + 3 + 4))
})

test('le grain en cours est celui de la dizaine dans sa série : une boucle, parcourue quatre fois', async ({
  page,
}) => {
  await commencerRosaire(page)
  const dessin = page.getByTestId('chapelet-dessine')
  await avancer(page, OUVERTURE + 2)
  const premierAve = await dessin.getAttribute('data-grain-courant')
  await avancer(page, 5 * DIZAINE)
  await expect(repere(page)).toHaveText('Série 2 sur 4')
  await expect(titre(page)).toHaveText('Je vous salue Marie')
  await expect(dessin).toHaveAttribute('data-grain-courant', premierAve!)
})

test('sans annonce, le passage de série s’affiche au-dessus du Notre Père', async ({ page }) => {
  await preparer(page, {
    reglages: { annonce: false },
    rosaireEnCours: {
      jour: '2026-10-08',
      forme: 'rosaire',
      serie: 'joyeux',
      dizaine: 5,
      priere: 'o-mon-jesus',
      rang: 1,
    },
  })
  await page.goto('/rosaire')
  await page.getByRole('button', { name: 'Reprendre à la 1re série, 5e dizaine' }).click()
  await expect(titre(page)).toHaveText('Ô mon Jésus')
  await expect(passage(page)).toHaveCount(0)
  await avancer(page, 1)
  await expect(titre(page)).toHaveText('Notre Père')
  expect(await texte(passage(page))).toBe(PASSAGES[1])
  await expect(repere(page)).toHaveText('Série 2 sur 4')
  const ligne = (await passage(page).boundingBox())!
  expect(ligne.y + ligne.height).toBeLessThanOrEqual((await titre(page).boundingBox())!.y)
  await avancer(page, 1)
  await expect(passage(page)).toHaveCount(0)
})

test('un Rosaire interrompu en deuxième série reprend au grain exact, et passé minuit est abandonné', async ({
  page,
}) => {
  await commencerRosaire(page)
  // 2e série, 3e dizaine, 4e Je vous salue Marie.
  const vise = OUVERTURE + 5 * DIZAINE + 2 * DIZAINE + 2 + 3
  await avancer(page, vise)
  await expect(page.getByTestId('compteur')).toHaveText('4 / 10')
  await expect(page.getByTestId('mystere')).toHaveText(
    '3 · L’Annonce du Royaume de Dieu et l’appel à la conversion',
  )

  // Interrompu : l'app est rouverte plus tard dans la journée.
  await page.goto('/')
  await page.goto('/rosaire')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rosaire')
  await page.getByRole('button', { name: 'Reprendre à la 2e série, 3e dizaine' }).click()
  await expect(chapelet(page)).toHaveAttribute('data-pas', String(vise))
  await expect(page.getByTestId('compteur')).toHaveText('4 / 10')
  await expect(serie(page)).toHaveText('Mystères lumineux')
  await expect(repere(page)).toHaveText('Série 2 sur 4')

  // Le chapelet de la même série ne le prend pas pour le sien.
  await page.goto('/chapelet/lumineux')
  await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()

  // Le lendemain, il est abandonné.
  await page.clock.setFixedTime(VENDREDI)
  await page.goto('/rosaire')
  await expect(page.getByRole('button', { name: 'Commencer le Rosaire' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Reprendre/ })).toHaveCount(0)
})

test('un chapelet en cours ne se reprend pas dans le Rosaire', async ({ page }) => {
  await preparer(page)
  await page.addInitScript(() =>
    localStorage.setItem(
      'avec-dieu.en-cours',
      JSON.stringify({
        jour: '2026-10-08',
        serie: 'lumineux',
        dizaine: 3,
        priere: 'je-vous-salue-marie',
        rang: 4,
      }),
    ),
  )
  await page.goto('/rosaire')
  await expect(page.getByRole('button', { name: 'Commencer le Rosaire' })).toBeVisible()
  await page.goto('/chapelet/lumineux')
  await expect(page.getByRole('button', { name: 'Reprendre à la 3e dizaine' })).toBeVisible()
})

// Phase 18 : l'accueil montre toujours le Chapelet et le Rosaire, ce dernier
// sans heure (e2e/simplifie.spec.ts).
test('la ligne du Rosaire de l’accueil ouvre son seuil', async ({ page }) => {
  await preparer(page)
  await page.goto('/')
  const ligne = page.getByRole('list', { name: 'Chapelet et Rosaire' }).getByRole('link').nth(1)
  await expect(ligne).toHaveAccessibleName(/^Rosaire\s*, environ une heure quarante-cinq$/)
  await expect(ligne.getByTestId('duree').locator('[aria-hidden="true"]')).toHaveText('~1 h 45')
  await ligne.click()
  await expect(page).toHaveURL(/\/rosaire$/)
  await expect(page.getByRole('button', { name: 'Commencer le Rosaire' })).toBeVisible()
})

test('« Prières du Rosaire » sur le seuil du Rosaire ; « Prières du chapelet » dans les réglages', async ({
  page,
}) => {
  await preparer(page)
  await page.goto('/rosaire')
  await expect(page.getByRole('link', { name: 'Prières du chapelet' })).toHaveCount(0)
  await page.getByRole('link', { name: 'Prières du Rosaire' }).click()
  await expect(page).toHaveURL('/reglages/chapelet/prieres')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prières du Rosaire')
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(page).toHaveURL(/\/rosaire$/)

  await page.goto('/reglages/chapelet')
  await page.getByRole('link', { name: /^Prières du chapelet/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prières du chapelet')
})

// Le Rosaire n'a pas d'heure, donc pas de rappel : celui du chapelet ouvre
// toujours le chapelet (révisé le 2026-10-09 ; un ancien choix du Rosaire
// retenu est ignoré, vérifié par les tests unitaires). La croix de la prière
// ramène là où la notification a été touchée.
test('le rappel du chapelet ouvre toujours le chapelet', async ({ page }) => {
  await simulerTelephone(page, { accord: 'granted' })
  await preparer(page, { rappels: ['chapelet'] })
  await page.goto('/')
  await expect
    .poll(async () => (await telephone(page)).programmees[0])
    .toMatchObject({ titre: 'C’est l’heure du chapelet', route: '/chapelet' })
  await toucherNotification(page, '/chapelet')
  await expect(page).toHaveURL('/chapelet')
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  await expect(chapelet(page)).toHaveAttribute('data-pas', '0')
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(page).toHaveURL('/')
})
