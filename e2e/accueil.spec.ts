import { expect, test, type Page } from '@playwright/test'
import { preparer, servirAelf } from './outils.ts'

// Phase 8 : l'accueil « Aujourd'hui ». Le mardi 6 octobre 2026, la lune cède
// la place au soleil vers 8 h et revient vers 19 h 20 (centre de la France).

const MARDI = (heures: number, minutes = 0) => new Date(2026, 9, 6, heures, minutes)

async function ouvrir(page: Page, quand: Date, chemin = '/') {
  await page.clock.setFixedTime(quand)
  await servirAelf(page)
  await preparer(page)
  await page.goto(chemin)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

const moment = (page: Page) => page.getByTestId('moment')
const perle = (page: Page, office: string) => page.getByTestId(`perle-${office}`)
const bandeau = (page: Page) => page.getByTestId('bandeau')

test('le bandeau donne la date, la semaine, le saint et la couleur du jour', async ({ page }) => {
  await ouvrir(page, MARDI(17, 50))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  await expect(bandeau(page)).toContainText('27e semaine du temps ordinaire')
  await expect(bandeau(page)).toContainText('S. Bruno, prêtre')
  // Une seule pastille, sans texte : ni rang, ni couleur de la mémoire.
  await expect(bandeau(page).getByRole('img')).toHaveCount(1)
  await expect(bandeau(page).getByRole('img', { name: 'Couleur liturgique : vert' })).toBeVisible()
  await expect(bandeau(page)).not.toContainText(/mémoire|vert/i)
})

test('un dimanche, le titre dit le jour, sans ligne de semaine', async ({ page }) => {
  await ouvrir(page, MARDI(10), '/jour/2026-10-11')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dimanche 11 octobre')
  await expect(bandeau(page).locator('p')).toHaveText(['28e dimanche du temps ordinaire'])
})

for (const [heure, minutes, office, ecart, astre] of [
  [7, 30, 'Laudes', '7 h · depuis 30 min', 'lune'],
  [8, 10, 'Tierce', '9 h · dans 50 min', 'soleil'],
  [12, 10, 'Sexte', '12 h · depuis 10 min', 'soleil'],
  [17, 50, 'Vêpres', '18 h 30 · dans 40 min', 'soleil'],
  [18, 40, 'Vêpres', '18 h 30 · depuis 10 min', 'soleil'],
  [19, 45, 'Complies', '21 h 30 · dans 1 h 45', 'lune'],
  [23, 50, 'Complies', '21 h 30 · depuis 2 h 20', 'lune'],
] as const) {
  test(`à ${heure} h ${minutes}, prière du moment : ${office}`, async ({ page }) => {
    await ouvrir(page, MARDI(heure, minutes))
    await expect(moment(page)).toHaveText(`Prière du moment${office}${ecart}`)
    await expect(page.getByTestId(astre)).toBeVisible()
    await expect(page.getByTestId(astre === 'lune' ? 'soleil' : 'lune')).toHaveCount(0)
  })
}

test('à 18 h 40, chaque perle et chaque ligne a son état', async ({ page }) => {
  await ouvrir(page, MARDI(18, 40))
  for (const office of ['laudes', 'tierce', 'sexte', 'none'])
    await expect(perle(page, office)).toHaveAttribute('data-etat', 'passe')
  await expect(perle(page, 'vepres')).toHaveAttribute('data-etat', 'moment')
  await expect(perle(page, 'complies')).toHaveAttribute('data-etat', 'a-venir')
  // L'office des lectures, sans heure, n'a pas de perle.
  await expect(perle(page, 'lectures')).toHaveCount(0)
  const liste = page.getByRole('list', { name: 'Offices du jour' })
  await expect(liste.getByRole('listitem')).toHaveText([
    /Office des lectures\s*à toute heure/,
    /Laudes\s*7 h/,
    /Tierce\s*9 h/,
    /Sexte\s*12 h/,
    /None\s*15 h/,
    /Vêpres\s*18 h 30/,
    /Complies\s*21 h 30/,
  ])
  await expect(liste.getByRole('listitem').nth(1)).toHaveAttribute('data-etat', 'passe')
  await expect(liste.getByRole('listitem').nth(5)).toHaveAttribute('data-etat', 'moment')
})

test('la prière du moment change d’elle-même, sans rouvrir l’app', async ({ page }) => {
  await page.clock.install({ time: MARDI(19, 29) })
  await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await expect(moment(page)).toContainText('Vêpres')
  await page.clock.fastForward('01:00')
  await expect(moment(page)).toContainText('Complies')
  await expect(perle(page, 'vepres')).toHaveAttribute('data-etat', 'passe')
})

test('passé minuit, l’accueil passe au lendemain', async ({ page }) => {
  await page.clock.install({ time: MARDI(23, 59) })
  await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  await page.clock.fastForward('01:00')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mercredi 7 octobre')
  await expect(moment(page)).toContainText('Laudes')
  await expect(page).toHaveURL('/')
})

test('une perle, même passée, ouvre son office', async ({ page }) => {
  await ouvrir(page, MARDI(17, 50))
  await expect(perle(page, 'laudes')).toHaveAttribute('data-etat', 'passe')
  await perle(page, 'laudes').click()
  await expect(page).toHaveURL('/office/laudes/2026-10-06')
  await page.goBack()
  await perle(page, 'complies').click()
  await expect(page).toHaveURL('/office/complies/2026-10-06')
})

test('une ligne de la liste et la prière du moment ouvrent leur office', async ({ page }) => {
  await ouvrir(page, MARDI(17, 50))
  await page
    .getByRole('list', { name: 'Offices du jour' })
    .getByRole('link', { name: /Laudes/ })
    .click()
  await expect(page).toHaveURL('/office/laudes/2026-10-06')
  await page.getByRole('button', { name: /Retour/ }).click()
  await page
    .getByRole('list', { name: 'Offices du jour' })
    .getByRole('link', { name: /Office des lectures/ })
    .click()
  await expect(page).toHaveURL('/office/lectures/2026-10-06')
  await page.goBack()
  await moment(page).click()
  await expect(page).toHaveURL('/office/vepres/2026-10-06')
})

test('d’un jour à l’autre, l’adresse suit et le retour quitte l’accueil', async ({ page }) => {
  await ouvrir(page, MARDI(17, 50))
  const jours = page.getByRole('navigation', { name: 'Autres jours' })
  await expect(jours).toHaveText(/lun\. 5\s*Aujourd’hui\s*mer\. 7/)
  await jours.getByRole('link', { name: /Jour suivant/ }).click()
  await expect(page).toHaveURL('/jour/2026-10-07')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mercredi 7 octobre')
  await expect(bandeau(page)).toContainText('Bienheureuse Vierge Marie du Rosaire')
  await expect(bandeau(page).getByRole('img', { name: 'Couleur liturgique : blanc' })).toBeVisible()
  // Un autre jour : ni prière du moment, ni astre, toutes les perles pareilles.
  await expect(moment(page)).toHaveCount(0)
  await expect(page.getByTestId('soleil')).toHaveCount(0)
  await expect(page.getByTestId('lune')).toHaveCount(0)
  for (const office of ['laudes', 'vepres', 'complies'])
    await expect(perle(page, office)).toHaveAttribute('data-etat', 'a-venir')
  // Ses offices sont ceux de ce jour-là.
  await perle(page, 'laudes').click()
  await expect(page).toHaveURL('/office/laudes/2026-10-07')
  await page.goBack()
  await expect(page).toHaveURL('/jour/2026-10-07')

  await jours.getByRole('link', { name: /Jour précédent/ }).click()
  await jours.getByRole('link', { name: /Jour précédent/ }).click()
  await expect(page).toHaveURL('/jour/2026-10-05')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lundi 5 octobre')
  await jours.getByRole('link', { name: 'Revenir à aujourd’hui' }).click()
  await expect(page).toHaveURL('/')
  await expect(moment(page)).toBeVisible()
})

test('une adresse de jour invalide ou d’aujourd’hui mène à l’accueil', async ({ page }) => {
  await ouvrir(page, MARDI(10), '/jour/2026-10-06')
  await expect(page).toHaveURL('/')
  await page.goto('/jour/2026-13-40')
  await expect(page).toHaveURL('/')
})

test('sans réponse de l’AELF, la date reste et l’on peut réessayer', async ({ page }) => {
  await page.clock.setFixedTime(MARDI(17, 50))
  await preparer(page)
  let panne = true
  await page.route('https://api.aelf.org/**', (route) => {
    if (panne) return route.abort('internetdisconnected')
    return route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      path: 'src/aelf/exemples/informations-2026-10-06.json',
    })
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toHaveText(
    '⚠ Le jour liturgique n’a pas pu être récupéré. Réessayer',
  )
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  // Le reste de l'accueil ne dépend pas de l'AELF.
  await expect(moment(page)).toContainText('Vêpres')
  panne = false
  await page.getByRole('button', { name: 'Réessayer' }).click()
  await expect(bandeau(page)).toContainText('S. Bruno, prêtre')
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('rien ne sort de l’app que les demandes à l’AELF', async ({ page }) => {
  const externes: string[] = []
  page.on('request', (r) => {
    const url = r.url()
    if (!url.startsWith('http://localhost:4173/') && !url.startsWith('https://api.aelf.org/'))
      externes.push(url)
  })
  await page.clock.setFixedTime(MARDI(17, 50))
  const demandes = await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await expect(bandeau(page)).toContainText('S. Bruno')
  expect(demandes).toEqual(['https://api.aelf.org/v1/informations/2026-10-06/france'])
  expect(externes).toEqual([])
})
