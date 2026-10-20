import { expect, type Page } from '@playwright/test'
import {
  preparer,
  servirAelf,
  simulerTelephone,
  telephone,
  test,
  toucherNotification,
} from './outils.ts'

// Phase 19 : l'Angélus (le Regina Caeli au temps pascal) dans le menu, sur
// l'accueil et dans les rappels ; le choix des prières affichées sur l'accueil.

// Mercredi 7 octobre 2026, 10 h.
const MAINTENANT = new Date(2026, 9, 7, 10, 0)
// Jeudi 13 mai 2027, l'Ascension : temps pascal.
const TEMPS_PASCAL = new Date(2027, 4, 13, 10, 0)
const LYON = { nom: 'Lyon', pres: false, latitude: 45.75, longitude: 4.85 }

const journee = (page: Page) => page.getByRole('list', { name: 'Offices du jour' })
const nomsDeLaJournee = (page: Page) => journee(page).locator('.accueil-office-nom')
const repliees = (page: Page) => page.getByTestId('priere-courante')

test.beforeEach(async ({ page }) => {
  await servirAelf(page)
})

test('Menu › Prières : l’Angélus, ses Je vous salue Marie repliés qui se déplient', async ({
  page,
}) => {
  await page.clock.setFixedTime(MAINTENANT)
  await preparer(page)
  await page.goto('/menu/prieres')
  await expect(page.getByRole('navigation', { name: 'Prières' }).getByRole('link')).toHaveText([
    'Je crois en Dieu',
    'Gloire au Père',
    'Salve Regina',
    'Angélus',
    'Regina Caeli',
    'Prière à Marie',
    'Consécration à Jésus par Marie',
    'Je suis tout à vous',
    'Je confesse à Dieu',
  ])
  await page.getByRole('link', { name: 'Angélus' }).click()
  await expect(page).toHaveURL('/priere/angelus')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Angélus')
  await expect(page.getByText('L’ange du Seigneur apporta l’annonce à Marie,')).toBeVisible()
  await expect(repliees(page)).toHaveCount(3)
  const premier = repliees(page).first()
  await expect(premier.locator('summary')).toHaveText('Je vous salue, Marie,')
  await expect(premier.getByText('maintenant et à l’heure de notre mort.')).toBeHidden()
  await premier.locator('summary').click()
  await expect(premier.getByText('maintenant et à l’heure de notre mort.')).toBeVisible()
  await expect(page.getByText('jusqu’à la gloire de la résurrection.')).toBeVisible()
})

test('« Prières courantes en entier » : le Je vous salue Marie de l’Angélus écrit en entier', async ({
  page,
}) => {
  await page.clock.setFixedTime(MAINTENANT)
  await preparer(page, { reglages: { prieresEntieres: true } })
  await page.goto('/priere/angelus')
  await expect(repliees(page)).toHaveCount(0)
  await expect(page.getByText('pleine de grâce ;')).toHaveCount(3)
})

test('Accueil : les trois Angélus à leur heure, chacun avant l’office de la même heure', async ({
  page,
}) => {
  await page.clock.setFixedTime(MAINTENANT)
  await preparer(page)
  await page.goto('/')
  await expect(nomsDeLaJournee(page)).toHaveText([
    'Angélus',
    'Office des lectures',
    'Laudes',
    'Tierce',
    'Angélus',
    'Sexte',
    'None',
    'Angélus',
    'Vêpres',
    'Complies',
  ])
  const angelus = journee(page).getByRole('link', { name: /^Angélus/ })
  await expect(angelus.locator('.quand-heure')).toHaveText(['6 h', '12 h', '18 h'])
  await expect(angelus.first()).toContainText('~3 min')
  await angelus.nth(1).click()
  await expect(page).toHaveURL('/priere/angelus')
})

test('au temps pascal, le Regina Caeli remplace l’Angélus sur l’accueil', async ({ page }) => {
  await page.clock.setFixedTime(TEMPS_PASCAL)
  await preparer(page)
  await page.goto('/')
  const regina = journee(page).getByRole('link', { name: /^Regina Caeli/ })
  await expect(regina).toHaveCount(3)
  await expect(journee(page).getByRole('link', { name: /^Angélus/ })).toHaveCount(0)
  await regina.first().click()
  await expect(page).toHaveURL('/priere/regina-caeli')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Regina Caeli')
  await expect(page.getByText('Car le Seigneur est vraiment ressuscité, alléluia.')).toBeVisible()
})

test('Réglages › Accueil : une prière masquée quitte l’accueil, et l’office sa perle', async ({
  page,
}) => {
  await page.clock.setFixedTime(MAINTENANT)
  await preparer(page)
  await page.goto('/reglages')
  const ligne = page.getByRole('link', { name: /^Accueil/ })
  await expect(ligne).toContainText('Prières affichées')
  await ligne.click()
  await expect(page).toHaveURL('/reglages/accueil')
  const bascules = page.getByRole('switch')
  await expect(bascules).toHaveCount(12)
  for (const bascule of await bascules.all()) await expect(bascule).toBeChecked()
  for (const nom of ['Rosaire', 'Tierce', 'Angélus de midi']) {
    await page.getByRole('switch', { name: nom, exact: true }).click()
    await expect(page.getByRole('switch', { name: nom, exact: true })).not.toBeChecked()
  }
  await page.goto('/')
  await expect(nomsDeLaJournee(page)).toHaveText([
    'Angélus',
    'Office des lectures',
    'Laudes',
    'Sexte',
    'None',
    'Angélus',
    'Vêpres',
    'Complies',
  ])
  await expect(page.getByRole('list', { name: 'Chapelet et Rosaire' })).toHaveText(/^Chapelet/)
  await expect(page.getByTestId('perle-tierce')).toHaveCount(0)
  await expect(page.getByTestId('perle-sexte')).toHaveCount(1)
})

test('le rappel de l’Angélus de midi, puis son toucher qui ouvre la prière', async ({ page }) => {
  await page.clock.setFixedTime(MAINTENANT)
  await simulerTelephone(page, { accord: 'granted' })
  await preparer(page)
  await page.goto('/reglages/rappels')
  await expect(page.locator('.rappel .rappel-priere')).toHaveText([
    'Angélus du matin',
    'Office des lectures',
    'Laudes',
    'Tierce',
    'Angélus de midi',
    'Sexte',
    'None',
    'Angélus du soir',
    'Vêpres',
    'Complies',
    'Chapelet',
  ])
  await page.getByRole('switch', { name: 'Angélus de midi, rappel' }).click()
  await expect.poll(async () => (await telephone(page)).programmees.length).toBe(31)
  const [premiere] = (await telephone(page)).programmees
  expect(premiere).toMatchObject({
    titre: 'C’est l’heure de l’Angélus',
    texte: 'L’ange du Seigneur apporta l’annonce à Marie.',
    route: '/priere/angelus',
    canal: 'rappel-angelus_village-vibreur',
  })
  expect(new Date(premiere.quand)).toEqual(new Date(2026, 9, 7, 12, 0))
  await toucherNotification(page, '/priere/angelus')
  await expect(page).toHaveURL('/priere/angelus')
})

test('en heures solaires, l’Angélus du matin au lever, avec sa limite à lui', async ({ page }) => {
  await page.clock.setFixedTime(MAINTENANT)
  await page.addInitScript((lieu) => {
    if (sessionStorage.getItem('solaire-prepare')) return
    sessionStorage.setItem('solaire-prepare', 'oui')
    localStorage.setItem('avec-dieu.lieu', JSON.stringify({ lieu, actualiser: false }))
    localStorage.setItem('avec-dieu.heures-solaires', JSON.stringify({ actives: true }))
  }, LYON)
  await preparer(page)
  await page.goto('/reglages/rappels')
  await expect(page.locator('.rappel .rappel-priere').first()).toHaveText(
    'Angélus du matin · lever',
  )
  await page.getByRole('link', { name: 'Angélus du matin · lever' }).click()
  await expect(page).toHaveURL('/reglages/rappels/angelus-matin')
  await expect(page.getByText('Au lever du soleil')).toBeVisible()
  await expect(page.getByText('Pas avant 7 h 00')).toBeVisible()
  // Le 7 octobre à Lyon, le soleil se lève vers 7 h 47 : la limite n'agit pas.
  await expect(page.getByTestId('volet-aujourdhui')).toHaveText(/Aujourd’hui : 7 h 4\d/)
  await expect(page.getByText(/^Lever du soleil à Lyon : 7 h 4\d$/)).toBeVisible()
})

// Les trois prières de saint Louis-Marie de Montfort (2026-10-20). Des extraits
// sans ponctuation ni trait d'union : l'app y pose des signes invisibles.
for (const [titre, chemin, debut, fin] of [
  ['Prière à Marie', '/priere/priere-a-marie', 'Fille bien', 'à glorifier pleinement Jésus en moi'],
  [
    'Consécration à Jésus par Marie',
    '/priere/consecration',
    'Ô Sagesse éternelle et incarnée,',
    'en toutes choses un si parfait disciple',
  ],
  [
    'Je suis tout à vous',
    '/priere/tout-a-vous',
    'Je suis tout à vous, et tout ce que j’ai vous appartient,',
    'ô mon aimable Jésus, par Marie votre sainte Mère.',
  ],
] as const) {
  test(`Menu › Prières : ${titre}, de Montfort`, async ({ page }) => {
    await page.clock.setFixedTime(MAINTENANT)
    await preparer(page)
    await page.goto('/menu/prieres')
    await page.getByRole('link', { name: titre, exact: true }).click()
    await expect(page).toHaveURL(chemin)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre)
    await expect(page.getByText(debut)).toBeVisible()
    await expect(page.getByText(fin)).toBeAttached()
  })
}
