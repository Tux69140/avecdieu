import { expect, type Page } from '@playwright/test'
import { glisser, glisserDepuis, preparer, servirAelf, test } from './outils.ts'

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
  await ouvrir(page, MARDI(18, 10))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  await expect(bandeau(page)).toContainText('27e semaine du temps ordinaire')
  await expect(bandeau(page)).toContainText('S. Bruno')
  // Une seule pastille, sans texte : ni rang, ni couleur de la mémoire.
  await expect(bandeau(page).getByRole('img')).toHaveCount(1)
  await expect(bandeau(page).getByRole('img', { name: 'Couleur liturgique : vert' })).toBeVisible()
  await expect(bandeau(page)).not.toContainText(/mémoire|vert/i)
  // Le saint seul, sans ses qualités ; le rang du jour en petit, le même chaque jour.
  await expect(bandeau(page).locator('.bandeau-titre')).toHaveText('S. Bruno')
  await expect(bandeau(page).locator('.bandeau-temps')).toHaveCSS('font-weight', '400')
})

test('un jour sans fête ni saint, rien en gros : le rang reste dans la petite ligne', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 9, 10, 10, 0))
  await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await expect(bandeau(page).locator('.bandeau-temps')).toHaveText('27e semaine du temps ordinaire')
  await expect(bandeau(page).locator('.bandeau-titre')).toHaveCount(0)
})

test('un dimanche, le titre dit le jour, sans ligne de semaine', async ({ page }) => {
  await ouvrir(page, MARDI(10), '/jour/2026-10-11')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dimanche 11 octobre')
  await expect(bandeau(page).locator('p')).toHaveText(['28e dimanche du temps ordinaire'])
})

for (const [heure, minutes, office, horaire, astre] of [
  [7, 30, 'Laudes', '7 h', 'lune'],
  [8, 40, 'Tierce', '9 h', 'soleil'],
  [12, 10, 'Sexte', '12 h', 'soleil'],
  [18, 10, 'Vêpres', '18 h 30', 'soleil'],
  [18, 40, 'Vêpres', '18 h 30', 'soleil'],
  [21, 15, 'Complies', '21 h 30', 'lune'],
  [22, 15, 'Complies', '21 h 30', 'lune'],
] as const) {
  test(`à ${heure} h ${minutes}, prière du moment : ${office}`, async ({ page }) => {
    await ouvrir(page, MARDI(heure, minutes))
    // Le badge sur la ligne de l'office, dans la liste : plus d'encadré à part.
    // Entre l'heure et le badge, la durée (phase 15).
    await expect(moment(page)).toHaveText(
      new RegExp(`^${office}${horaire}~\\d+ min, environ [a-z]+ minutesPrière du moment$`),
    )
    await expect(
      page.getByRole('list', { name: 'Offices du jour' }).getByTestId('moment'),
    ).toHaveCount(1)
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
  // Vêpres passées, le chapelet de 20 h est la prochaine prière.
  await expect(moment(page)).toContainText('Chapelet')
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
  // En pleine nuit, aucune prière n'est du moment : les laudes le seront à 6 h 30.
  await expect(moment(page)).toHaveCount(0)
  await expect(page).toHaveURL('/')
})

test('une perle, même passée, ouvre son office', async ({ page }) => {
  await ouvrir(page, MARDI(18, 10))
  await expect(perle(page, 'laudes')).toHaveAttribute('data-etat', 'passe')
  await perle(page, 'laudes').click()
  await expect(page).toHaveURL('/office/laudes/2026-10-06')
  await page.goBack()
  await perle(page, 'complies').click()
  await expect(page).toHaveURL('/office/complies/2026-10-06')
})

test('une ligne de la liste et la prière du moment ouvrent leur office', async ({ page }) => {
  await ouvrir(page, MARDI(18, 10))
  await page
    .getByRole('list', { name: 'Offices du jour' })
    .getByRole('link', { name: /Laudes/ })
    .click()
  await expect(page).toHaveURL('/office/laudes/2026-10-06')
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
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
  await ouvrir(page, MARDI(18, 10))
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

test('premier lancement sans réseau : la date reste, le chapelet est proposé', async ({ page }) => {
  await page.clock.setFixedTime(MARDI(18, 10))
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
    '⚠ Les offices demandent une première connexion à internet. Une fois connecté, l’app ' +
      'enregistre une semaine de textes d’avance. Le chapelet, lui, se prie dès maintenant.' +
      'Prier le chapelet',
  )
  await expect(page.getByRole('link', { name: 'Prier le chapelet' })).toHaveAttribute(
    'href',
    '/chapelet',
  )
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  // Aucun office ne peut s'ouvrir : tous atténués, aucun badge (il serait
  // trompeur), le chapelet seul en pleine couleur.
  const offices = page.getByRole('list', { name: 'Offices du jour' }).getByRole('listitem')
  await expect(offices).toHaveCount(7)
  for (const office of await offices.all())
    await expect(office).toHaveAttribute('data-etat', 'passe')
  await expect(page.getByTestId('moment')).toHaveCount(0)
  const chapelet = page.getByRole('list', { name: 'Chapelet' }).getByRole('listitem')
  await expect(chapelet).not.toHaveAttribute('data-etat', /./)
  // Le réseau revient : le jour se charge de lui-même, et le badge revient.
  panne = false
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await expect(bandeau(page)).toContainText('S. Bruno')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(moment(page)).toContainText('Vêpres')
})

test('rien ne sort de l’app que les demandes à l’AELF', async ({ page }) => {
  const externes: string[] = []
  page.on('request', (r) => {
    const url = r.url()
    if (!url.startsWith('http://localhost:4173/') && !url.startsWith('https://api.aelf.org/'))
      externes.push(url)
  })
  await page.clock.setFixedTime(MARDI(18, 10))
  const demandes = await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await expect(bandeau(page)).toContainText('S. Bruno')
  // La réserve des jours à venir : 9 jours de 8 ressources, chacune une fois.
  await expect.poll(() => demandes.length).toBe(72)
  expect(demandes.every((d) => /^https:\/\/api\.aelf\.org\/v1\/\w+\/[\d-]+\/france$/.test(d))).toBe(
    true,
  )
  expect(new Set(demandes).size).toBe(72)
  expect(externes).toEqual([])
})

test.describe('glisser sur le cadran', () => {
  // Le milieu du cadran, à l'écart des perles.
  const milieu = async (page: Page) => {
    // Le jour change en redessinant l'accueil : le cadran peut être remplacé
    // entre deux lectures, redemander sa boîte jusqu'à l'avoir.
    let boite: { y: number; height: number } | null = null
    await expect
      .poll(async () => (boite = await page.locator('.accueil-cadran').boundingBox()))
      .not.toBeNull()
    return boite!.y + boite!.height / 2
  }

  test('vers la gauche, le jour suivant ; vers la droite, le jour précédent', async ({ page }) => {
    await ouvrir(page, MARDI(18, 10))
    await glisser(page, -160, await milieu(page))
    await expect(page).toHaveURL('/jour/2026-10-07')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mercredi 7 octobre')
    await glisser(page, 160, await milieu(page))
    await expect(page).toHaveURL('/')
    await glisser(page, 160, await milieu(page))
    await expect(page).toHaveURL('/jour/2026-10-05')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lundi 5 octobre')
  })

  test('un geste vertical ou trop court ne change pas de jour', async ({ page }) => {
    await ouvrir(page, MARDI(18, 10))
    await glisser(page, 0, await milieu(page), 160)
    await glisser(page, -30, await milieu(page))
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mardi 6 octobre')
  })

  test('un glissement parti d’une perle change de jour sans ouvrir l’office', async ({ page }) => {
    await ouvrir(page, MARDI(18, 10))
    const sexte = (await perle(page, 'sexte').boundingBox())!
    await glisserDepuis(page, sexte.x + sexte.width / 2, sexte.y + sexte.height / 2, -120)
    await expect(page).toHaveURL('/jour/2026-10-07')
  })
})

test('le chapelet sous les offices : du moment l’heure qui suit son heure, puis atténué', async ({
  page,
}) => {
  await ouvrir(page, MARDI(18, 10))
  const chapelet = page.getByRole('list', { name: 'Chapelet' }).getByRole('listitem')
  await expect(chapelet).toHaveText(/^Chapelet20 h20 min, vingt minutes$/)
  await expect(chapelet).toHaveAttribute('data-etat', 'a-venir')
  // À l'heure de son rappel, le chapelet porte le badge, pas les complies.
  await page.clock.setFixedTime(MARDI(20, 5))
  await page.reload()
  await expect(chapelet).toHaveAttribute('data-etat', 'moment')
  await expect(moment(page)).toHaveText(/^Chapelet20 h20 min, vingt minutesPrière du moment$/)
  await expect(page.getByTestId('moment')).toHaveCount(1)
  await page.clock.setFixedTime(MARDI(21, 5))
  await page.reload()
  await expect(chapelet).toHaveAttribute('data-etat', 'passe')
  await expect(moment(page)).toContainText('Complies')
  await chapelet.getByRole('link').click()
  await expect(page).toHaveURL(/\/chapelet$/)
})
