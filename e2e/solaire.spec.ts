import { expect, type Page } from '@playwright/test'
import { preparer, servirAelf, simulerTelephone, telephone, test } from './outils.ts'

// Phase 12 : les heures solaires. Lyon, mercredi 7 octobre 2026 : lever vers
// 7 h 47, coucher vers 19 h 12 ; midi solaire vers 13 h 30.

const MAINTENANT = new Date(2026, 9, 7, 10, 0)
const LYON = { nom: 'Lyon', pres: false, latitude: 45.75, longitude: 4.85 }

// La mémoire du téléphone avant l'ouverture : un lieu, et le mode solaire.
async function enHeuresSolaires(page: Page, lieu: object = LYON, actives = true) {
  await page.addInitScript(
    ({ lieu, actives }) => {
      if (sessionStorage.getItem('solaire-prepare')) return
      sessionStorage.setItem('solaire-prepare', 'oui')
      localStorage.setItem('avec-dieu.lieu', JSON.stringify({ lieu, actualiser: false }))
      localStorage.setItem('avec-dieu.heures-solaires', JSON.stringify({ actives }))
    },
    { lieu, actives },
  )
}

const perle = (page: Page, office: string) => page.getByTestId(`perle-${office}`)
const centre = async (page: Page, office: string) => {
  const boite = (await perle(page, office).boundingBox())!
  return { x: boite.x + boite.width / 2, y: boite.y + boite.height / 2 }
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MAINTENANT)
  await servirAelf(page)
  await preparer(page)
})

test('le cadran solaire va du lever au coucher, les complies au bout des pointillés', async ({
  page,
}) => {
  await enHeuresSolaires(page)
  await page.goto('/')
  const cadran = page.locator('.cadran-zone svg')
  await expect(cadran).toContainText('lever')
  await expect(cadran).toContainText('coucher')
  await expect(cadran).not.toContainText('18 h')
  await expect(cadran.locator('.cadran-nuit')).toHaveCount(2)
  // Sexte au midi solaire, au sommet de l'arc.
  const sexte = await centre(page, 'sexte')
  const largeur = page.viewportSize()!.width
  expect(Math.abs(sexte.x - largeur / 2)).toBeLessThan(4)
  // Les vêpres au coucher, les complies plus bas, au bout des pointillés.
  const vepres = await centre(page, 'vepres')
  const complies = await centre(page, 'complies')
  expect(complies.x).toBeGreaterThan(vepres.x)
  expect(complies.y).toBeGreaterThan(vepres.y)
  await expect(perle(page, 'sexte')).toHaveAccessibleName(/^Sexte, 13 h \d\d$/)
})

// Réglages, puis la ligne Rappels, comme le priant.
const ouvrirRappels = async (page: Page) => {
  await page.goto('/reglages')
  await ligneRappels(page).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rappels')
}
const heures = (page: Page) => page.getByRole('radiogroup', { name: 'Heures des prières' })
const ligneRappels = (page: Page) => page.getByRole('link', { name: 'Rappels', exact: true })
const fermer = (page: Page) => page.getByRole('button', { name: 'Fermer', exact: true }).click()

test('passer aux heures solaires : choisir une ville, puis les heures suivent le soleil', async ({
  page,
}) => {
  const requetes: string[] = []
  page.on('request', (r) => requetes.push(r.url()))
  await page.goto('/reglages')
  await expect(ligneRappels(page)).toContainText('Aucun rappel')
  await ouvrirRappels(page)
  await heures(page).getByRole('radio', { name: 'Solaires' }).click()

  // Sans lieu connu, l'écran du lieu s'ouvre d'abord.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lieu des heures solaires')
  await expect(page.getByText('Une seule fois. La position reste sur le téléphone.')).toBeVisible()
  const champ = page.getByRole('searchbox', { name: 'Chercher une ville' })
  await champ.fill('saint-den')
  const villes = page.getByRole('list', { name: 'Villes trouvées' })
  await expect(villes).toContainText('Saint-Denis · La Réunion, France')
  await expect(villes).toContainText('Saint-Denis · Île-de-France, France')
  await champ.fill('lyon')
  await villes
    .getByRole('button', { name: /^Lyon · / })
    .first()
    .click()

  // Retour aux rappels, en heures solaires.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rappels')
  await expect(heures(page).getByRole('radio', { name: 'Solaires' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(
    page.getByText('Selon la course du soleil à Lyon, du lever au coucher.'),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Lieu : Lyon', exact: true })).toBeVisible()
  await expect(page.locator('.rappel-priere')).toContainText([
    'Office des lectures',
    'Laudes · lever',
    'Tierce',
    'Sexte · midi solaire',
    'None',
    'Vêpres · coucher',
    'Complies',
    'Chapelet',
  ])
  await expect(page.getByRole('link', { name: /^Laudes, heure solaire, 7 h 4\d$/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /^Sexte, heure solaire, 13 h \d\d$/ })).toBeVisible()
  // Les complies gardent l'horloge d'Android.
  await expect(page.getByLabel('Complies, heure')).toHaveValue('21:30')
  // La croix remonte aux Réglages, qui le résument.
  await fermer(page)
  await expect(ligneRappels(page)).toContainText('Heures solaires · Aucun rappel')

  // La liste des villes est dans l'app : rien n'est parti ailleurs.
  const ailleurs = requetes.filter(
    (url) => !url.startsWith('http://localhost:4173') && !url.startsWith('https://api.aelf.org/'),
  )
  expect(ailleurs).toEqual([])

  // L'accueil suit : sexte au midi solaire de Lyon.
  await page.goto('/')
  await expect(page.getByRole('list', { name: 'Offices du jour' })).toContainText(/Sexte13 h \d\d/)
})

test('revenir de l’écran du lieu sans choisir garde les heures fixes', async ({ page }) => {
  await ouvrirRappels(page)
  await heures(page).getByRole('radio', { name: 'Solaires' }).click()
  await fermer(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rappels')
  await expect(heures(page).getByRole('radio', { name: 'Fixes' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(page.getByLabel('Laudes, heure')).toHaveValue('07:00')
})

test('une ville introuvable : le message le dit', async ({ page }) => {
  await page.goto('/lieu')
  await page.getByRole('searchbox', { name: 'Chercher une ville' }).fill('Trifouilly')
  await expect(page.getByRole('alert')).toHaveText(
    '⚠ Aucune ville de ce nom dans la liste. Essayez une ville voisine de plus de 15 000 habitants, ou « Me localiser ».',
  )
})

test('« Me localiser » : la position du téléphone, nommée d’après la ville voisine', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: 45.69, longitude: 4.79 })
  await page.goto('/lieu')
  await page.getByRole('button', { name: 'Me localiser' }).click()
  // Revenu à l'accueil (l'écran a été ouvert directement) : le lieu est retenu.
  // Attendre ce retour, qui suit la position et la ville voisine : rouvrir
  // l'écran avant, sur une machine chargée, perdrait le lieu en chemin.
  await expect(page).not.toHaveURL(/\/lieu$/)
  await page.goto('/lieu')
  await expect(page.getByTestId('lieu-actuel')).toHaveText(/^Lieu actuel : Près de \S/)
})

test('position refusée par Android : le message et le chemin vers ses réglages', async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (_, erreur) =>
      erreur?.({ code: 1, message: '' } as GeolocationPositionError)
  })
  await page.goto('/lieu')
  await page.getByRole('button', { name: 'Me localiser' }).click()
  await expect(page.getByRole('alert')).toContainText(
    '⚠ Android refuse l’accès à la position. Cherchez plutôt une ville, ou autorisez la position dans les Paramètres du téléphone.',
  )
  await expect(
    page.getByRole('button', { name: 'Ouvrir les Paramètres du téléphone' }),
  ).toBeVisible()
})

test('position introuvable : le message le dit', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (_, erreur) =>
      erreur?.({ code: 2, message: '' } as GeolocationPositionError)
  })
  await page.goto('/lieu')
  await page.getByRole('button', { name: 'Me localiser' }).click()
  await expect(page.getByRole('alert')).toHaveText(
    '⚠ La position n’a pas pu être trouvée. Vérifiez que la localisation du téléphone est allumée, ou cherchez une ville.',
  )
})

test('la page d’un office solaire : décalage, limite, et l’heure du jour', async ({ page }) => {
  await enHeuresSolaires(page)
  await ouvrirRappels(page)
  // L'heure solaire ouvre la page de la prière, plus de fenêtre.
  await page.getByRole('link', { name: /^Laudes, heure solaire/ }).click()
  await expect(page).toHaveURL('/reglages/rappels/laudes')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const volet = page.locator('main')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Laudes')
  await expect(volet).toContainText('Au lever du soleil')
  // En heures solaires, ni horloge pour l'heure : le soleil la donne.
  await expect(page.getByLabel('Laudes, heure')).toHaveCount(0)
  await expect(volet.getByLabel('Décalage')).toHaveText('0 min')
  const aujourdhui = volet.getByTestId('volet-aujourdhui')
  const avant = await aujourdhui.textContent()
  await expect(volet).toContainText(/Lever du soleil à Lyon : 7 h 4\d/)
  await volet.getByRole('button', { name: 'Plus tard de 5 minutes' }).click()
  await expect(volet.getByLabel('Décalage')).toHaveText('+5 min')
  await expect(aujourdhui).not.toHaveText(avant!)
  // Pas avant 7 h 00, activée d'origine ; 8 h 30 l'emporte sur le lever.
  await expect(volet.getByRole('switch', { name: 'Pas avant, limite' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await volet.getByLabel('Pas avant, heure').fill('08:30')
  await expect(aujourdhui).toHaveText('Aujourd’hui : 8 h 30')
  await volet.getByRole('switch', { name: 'Pas avant, limite' }).click()
  await expect(aujourdhui).not.toHaveText('Aujourd’hui : 8 h 30')
  // Le son se choisit sur la même page.
  await expect(page.getByRole('radiogroup', { name: 'Son, Laudes' })).toBeVisible()
  await fermer(page)
  await expect(page).toHaveURL('/reglages/rappels')

  // La page de tierce n'a pas de limite.
  await page.getByRole('link', { name: /^Tierce, heure solaire/ }).click()
  await expect(page.locator('main')).toContainText('Fin de la 3e heure du jour')
  await expect(page.getByRole('switch', { name: /limite/ })).toHaveCount(0)
})

test('les rappels sonnent à l’heure du soleil de chaque jour', async ({ page }) => {
  await simulerTelephone(page, { accord: 'granted' })
  await enHeuresSolaires(page)
  await ouvrirRappels(page)
  await page.getByRole('switch', { name: 'Sexte, rappel' }).click()
  await expect.poll(async () => (await telephone(page)).programmees.length).toBeGreaterThan(25)
  const minutes = (await telephone(page)).programmees.map((n) => {
    const quand = new Date(n.quand)
    return quand.getHours() * 60 + quand.getMinutes()
  })
  // Midi solaire de Lyon : vers 13 h 23 en octobre, 12 h 30 en novembre.
  expect(minutes[0]).toBeGreaterThan(13 * 60 + 15)
  expect(minutes.at(-1)).toBeLessThan(12 * 60 + 40)
})

test('en voyage, l’option déplace le lieu au-delà de 50 km, pas en deçà', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['geolocation'])
  await page.addInitScript(() => {
    if (sessionStorage.getItem('voyage')) return
    sessionStorage.setItem('voyage', 'oui')
    localStorage.setItem(
      'avec-dieu.lieu',
      JSON.stringify({
        lieu: { nom: 'Lyon', pres: false, latitude: 45.75, longitude: 4.85 },
        actualiser: true,
      }),
    )
  })
  // À Villeurbanne : rien ne change.
  await context.setGeolocation({ latitude: 45.77, longitude: 4.88 })
  await page.goto('/lieu')
  await expect(page.getByTestId('lieu-actuel')).toHaveText('Lieu actuel : Lyon')
  // À Marseille : le lieu suit, sans rien demander.
  await context.setGeolocation({ latitude: 43.3, longitude: 5.37 })
  await page.reload()
  await expect(page.getByTestId('lieu-actuel')).toHaveText('Lieu actuel : Près de Marseille')
})
