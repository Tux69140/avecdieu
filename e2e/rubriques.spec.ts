import { expect, type Page } from '@playwright/test'
import { deplierReglages, preparer, servirAelf, test } from './outils.ts'

// Phase 6 : l'office complet, reconstitué selon les rubriques validées par le
// porteur du projet (R1 à R11, src/recueil/office.ts).

const MARDI = new Date(2026, 9, 6, 10, 0)
const ROUGE_RUBRIQUE = 'rgb(158, 42, 31)'

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MARDI)
})

// À l'écran, un liant invisible suit le trait d'union d'un mot composé.
const lie = (texte: string) => texte.replace(/(?<=\p{L})-(?=\p{L})/gu, '-\u2060')
const titres = (page: Page) => page.getByTestId('office').getByRole('heading', { level: 2 })
// Une partie, par son titre : les sections n'ont pas de nom (deux « Antienne »
// porteraient le même).
const partie = (page: Page, libelle: string) =>
  page
    .getByTestId('office')
    .locator('section')
    .filter({ has: page.getByRole('heading', { level: 2, name: libelle, exact: true }) })

async function ouvrir(page: Page, office: string) {
  await page.goto(`/office/${office}/2026-10-06`)
  await expect(titres(page).first()).toHaveText('Introduction')
}

test('l’invitatoire suit le premier office ouvert, et le lien le déplace', async ({ page }) => {
  const demandes = await servirAelf(page)
  await preparer(page)

  // Les laudes ouvertes d'abord : elles portent l'invitatoire.
  await ouvrir(page, 'laudes')
  await expect(titres(page).nth(1)).toHaveText('Invitatoire')
  await expect(partie(page, 'Introduction')).toContainText('Seigneur, ouvre mes lèvres')
  await expect(page.getByRole('button', { name: 'Le dire ici' })).toHaveCount(0)

  // L'office des lectures, ouvert ensuite, commence par « Dieu, viens à mon aide ».
  await ouvrir(page, 'lectures')
  await expect(titres(page).nth(1)).toHaveText(/^Hymne/)
  await expect(partie(page, 'Introduction')).toContainText('Dieu, viens à mon aide')
  await expect(partie(page, 'Introduction')).toContainText('Alléluia.')
  // Il emprunte l'invitatoire aux laudes : les deux offices sont demandés à l'AELF.
  expect(demandes).toContain('https://api.aelf.org/v1/laudes/2026-10-06/france')
  expect(demandes).toContain('https://api.aelf.org/v1/lectures/2026-10-06/france')

  // La raison avant l'action : le lien y déplace l'invitatoire, signalé comme ajout.
  await expect(page.locator('.office-invitatoire')).toHaveText(
    'L’invitatoire était aux laudes. Le dire ici',
  )
  await page.getByRole('button', { name: 'Le dire ici' }).click()
  await expect(titres(page).nth(1)).toHaveText('Invitatoire')
  await expect(titres(page).nth(2)).toHaveText('Psaume 94')
  await expect(partie(page, 'Introduction')).toContainText('Seigneur, ouvre mes lèvres')
  await expect(partie(page, 'Invitatoire')).toHaveAttribute('data-ajoutee', 'oui')
  // La lecture reprend sur l'invitatoire, même au lecteur d'écran.
  await expect(partie(page, 'Invitatoire').getByRole('heading')).toBeFocused()
  await expect(page.getByRole('button', { name: 'Le dire ici' })).toHaveCount(0)

  // Les laudes l'ont perdu, et proposent à leur tour de le reprendre.
  await ouvrir(page, 'laudes')
  await expect(titres(page).nth(1)).toHaveText(/^Hymne/)
  await expect(page.locator('.office-invitatoire')).toHaveText(
    'L’invitatoire était à l’office des lectures. Le dire ici',
  )
})

test('un office des lectures que l’AELF ne donne pas ne prend pas l’invitatoire', async ({
  page,
}) => {
  await servirAelf(page)
  // Comme le dimanche de Pâques, où la Vigile pascale le remplace.
  await page.route('https://api.aelf.org/v1/lectures/**', (route) =>
    route.fulfill({ status: 404, body: 'introuvable' }),
  )
  await preparer(page)
  await page.goto('/office/lectures/2026-10-06')
  await expect(page.getByRole('alert')).toContainText('L’AELF ne propose pas cet office')
  await ouvrir(page, 'laudes')
  await expect(titres(page).nth(1)).toHaveText('Invitatoire')
})

test('Gloire au Père et Notre Père repliés sur leur première ligne, dépliés d’un toucher', async ({
  page,
}) => {
  await servirAelf(page)
  await preparer(page)
  await ouvrir(page, 'laudes')

  const psaume = partie(page, 'Psaume 84')
  const gloire = psaume.getByTestId('priere-courante')
  await expect(gloire.locator('summary')).toHaveText(
    lie('Gloire au Père, et au Fils et au Saint-Esprit,'),
  )
  await expect(gloire.getByText('au Dieu qui est, qui était et qui vient,')).toBeHidden()
  await gloire.locator('summary').click()
  await expect(gloire.getByText('au Dieu qui est, qui était et qui vient,')).toBeVisible()
  // Après le Gloire, l'antienne reprise, sous sa consigne (R13).
  await expect(psaume.locator('.bloc').last().locator('.office-rubrique')).toHaveText(
    'On reprend l’antienne.',
  )
  await expect(psaume.locator('.bloc').last().locator('.office-strophe')).toHaveText(
    'Par amour de cette terre, tu ôtes le péché de ton peuple, et ta gloire habite chez nous.',
  )

  const notrePere = partie(page, 'Notre Père').getByTestId('priere-courante')
  await expect(notrePere.locator('summary')).toHaveText('Notre Père, qui es aux cieux,')
  await notrePere.locator('summary').click()
  await expect(notrePere).toContainText(lie('mais délivre-nous du Mal.'))
})

test('réglages : prières courantes en entier, et ajouts sans filet', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/reglages')
  await deplierReglages(page, 'Offices')
  for (const [nom, avant] of [
    ['Prières courantes en entier', 'false'],
    ['Signaler les ajouts de l’app', 'true'],
  ]) {
    const bascule = page.getByRole('switch', { name: nom })
    await expect(bascule).toHaveAttribute('aria-checked', avant)
    await bascule.click()
    await expect(bascule).not.toHaveAttribute('aria-checked', avant)
  }

  await ouvrir(page, 'laudes')
  const office = page.getByTestId('office')
  await expect(office.locator('summary')).toHaveCount(0)
  await expect(partie(page, 'Psaume 84')).toContainText('au Dieu qui est, qui était et qui vient,')
  const ajout = partie(page, 'Psaume 84').locator('.bloc[data-ajoute="oui"]').first()
  await expect(ajout).toHaveCSS('border-left-style', 'none')
})

test('ajouts signalés par un filet rouge, sans texte', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await ouvrir(page, 'laudes')
  const ajout = partie(page, 'Psaume 84').locator('.bloc[data-ajoute="oui"]').first()
  await expect(ajout).toHaveCSS('border-left-color', ROUGE_RUBRIQUE)
  await expect(ajout).toHaveCSS('border-left-style', 'solid')
  await expect(partie(page, 'Bénédiction')).toHaveCSS('border-left-color', ROUGE_RUBRIQUE)
  // Le texte de l'AELF, lui, n'a pas de filet.
  await expect(partie(page, 'Psaume 84').locator('.bloc').first()).toHaveCSS(
    'border-left-style',
    'none',
  )
})

test('à plusieurs, « Tous » précède chaque Gloire au Père', async ({ page }) => {
  await servirAelf(page)
  await preparer(page, { reglages: { plusieurs: true } })
  await ouvrir(page, 'vepres')
  const gloires = page.getByTestId('priere-courante').filter({ hasText: 'Gloire au Père' })
  // L'introduction, deux psaumes, le cantique et le Magnificat.
  await expect(gloires).toHaveCount(5)
  for (const gloire of await gloires.all())
    await expect(gloire.locator('.office-rubrique')).toHaveText('Tous')
})

test('complies : examen de conscience après l’introduction', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await ouvrir(page, 'complies')
  await expect(titres(page).nth(1)).toHaveText('Examen de conscience')
  await expect(partie(page, 'Examen de conscience').locator('summary')).toHaveText(
    lie('Je confesse à Dieu tout-puissant,'),
  )
  await expect(titres(page).nth(2)).toHaveText(/^Hymne/)
})
