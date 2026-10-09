import { expect, type Page } from '@playwright/test'
import { avancer, commencer, glisser, preparer, servirAelf, test, toucher } from './outils.ts'

const AVE = 'Je vous salue Marie'
const JOYEUX = [
  'L’Annonciation',
  'La Visitation',
  'La Nativité',
  'La Présentation de Jésus au Temple',
  'Le Recouvrement de Jésus au Temple',
]

// Le déroulé attendu, écrit indépendamment du code : [prière, compteur, mystère],
// ou l'annonce d'un mystère (son titre).
type Attendu =
  | { annonce: string; priere?: undefined; compteur?: undefined; mystere?: undefined }
  | { priere: string; compteur?: string; mystere?: string; annonce?: undefined }
const DEROULE: Attendu[] = [
  { priere: 'Signe de croix' },
  { priere: 'Je crois en Dieu' },
  { priere: 'Notre Père' },
  ...[1, 2, 3].map((n) => ({ priere: AVE, compteur: `${n} / 3` })),
  { priere: 'Gloire au Père' },
  ...JOYEUX.flatMap((titre, d) => {
    const mystere = `${d + 1} · ${titre}`
    return [
      { annonce: titre },
      { priere: 'Notre Père', mystere },
      ...Array.from({ length: 10 }, (_, n) => ({
        priere: AVE,
        compteur: `${n + 1} / 10`,
        mystere,
      })),
      { priere: 'Gloire au Père', mystere },
      { priere: 'Ô mon Jésus', mystere },
    ]
  }),
  // La prière aux intentions du Saint-Père, activée au départ (phase 18).
  { priere: 'Notre Père' },
  { priere: AVE },
  { priere: 'Gloire au Père' },
  // Un lundi d'octobre, avec les réglages de départ : Litanies et saint Joseph
  // s'ajoutent, le verset passe avant l'oraison (phase 16).
  { priere: 'Salve Regina' },
  { priere: 'Litanies de la Sainte Vierge' },
  { priere: 'Oraison du Rosaire' },
  { priere: 'Prière à saint Joseph' },
]

// Un lundi : mystères joyeux.
const LUNDI = new Date(2026, 9, 5, 10, 0)

async function verifierPas(page: Page, attendu: Attendu, index: number) {
  if (attendu.annonce !== undefined) {
    await expect(
      page.getByTestId('annonce').getByRole('heading', { level: 2 }),
      `étape n° ${index + 1}`,
    ).toHaveText(attendu.annonce)
    return
  }
  const ecran = page.getByTestId('priere')
  await expect(ecran.getByRole('heading', { level: 2 }), `prière n° ${index + 1}`).toHaveText(
    attendu.priere,
  )
  if (attendu.compteur) await expect(page.getByTestId('compteur')).toHaveText(attendu.compteur)
  else await expect(page.getByTestId('compteur')).toHaveCount(0)
  if (attendu.mystere) await expect(page.getByTestId('mystere')).toHaveText(attendu.mystere)
  else await expect(page.getByTestId('mystere')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(LUNDI)
})

test('réciter un chapelet complet, toucher par toucher, sans quitter l’app', async ({ page }) => {
  const requetesExternes: string[] = []
  // Seule l'AELF peut être jointe : la réserve des jours à venir, à l'ouverture.
  page.on('request', (r) => {
    const url = r.url()
    if (!url.startsWith('http://localhost:4173/') && !url.startsWith('https://api.aelf.org/'))
      requetesExternes.push(url)
  })

  await commencer(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mystères joyeux')

  let grainPrecedent = -1
  for (const [i, attendu] of DEROULE.entries()) {
    await verifierPas(page, attendu, i)
    // Le grain mis en évidence avance avec la prière, jamais de plus d'un grain.
    const grain = Number(
      await page.getByTestId('chapelet-dessine').getAttribute('data-grain-courant'),
    )
    expect(grain - grainPrecedent).toBeLessThanOrEqual(1)
    expect(grain).toBeGreaterThanOrEqual(grainPrecedent)
    grainPrecedent = grain
    if (attendu.annonce) {
      // L'annonce ne s'avance que par la grosse perle : un toucher ailleurs ne fait rien.
      await toucher(page)
      await verifierPas(page, attendu, i)
    }
    // Une prière plus haute que l'écran défile d'abord au toucher.
    await avancer(page, 1)
  }

  await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  // Toucher l'écran de fin ne fait rien.
  await toucher(page)
  await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  expect(requetesExternes).toEqual([])
})

test('glisser revient d’une prière en arrière, dans un sens comme dans l’autre', async ({
  page,
}) => {
  await commencer(page)
  await avancer(page, 5)
  await verifierPas(page, DEROULE[5], 5)

  await glisser(page, 160)
  await verifierPas(page, DEROULE[4], 4)
  await glisser(page, -160)
  await verifierPas(page, DEROULE[3], 3)

  // Avancer de nouveau reprend juste après.
  await toucher(page)
  await verifierPas(page, DEROULE[4], 4)
})

// Comme tout écran, chaque prière s'ouvre en haut : après une annonce qu'on a
// fait défiler, le Notre Père ne s'ouvre pas à mi-hauteur.
test('chaque prière s’ouvre en haut de l’écran', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await commencer(page)
  await avancer(page, 7)
  await expect(page.getByRole('button', { name: 'Commencer la dizaine' })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await avancer(page, 1)
  await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
    'Notre Père',
  )
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

// Le lecteur d'écran entend la prière qui arrive, et le chapelet dessiné dit
// où l'on en est, comme le fil de perles de l'office.
test('le lecteur d’écran suit la progression', async ({ page }) => {
  await commencer(page)
  const dessin = page.getByRole('img', { name: /^Chapelet/ })
  await expect(dessin).toHaveAccessibleName(`Chapelet, prière 1 sur ${DEROULE.length}`)
  const annonces = page.locator('[aria-live="polite"]').filter({ has: page.getByTestId('priere') })
  await expect(annonces).toHaveCount(1)
  const region = await annonces.elementHandle()
  await toucher(page)
  await expect(dessin).toHaveAccessibleName(`Chapelet, prière 2 sur ${DEROULE.length}`)
  // La même région annonce chaque prière : une région neuve resterait muette.
  expect(await region!.evaluate((e) => e.isConnected)).toBe(true)
  await expect(annonces).toContainText('Je crois en Dieu')
})

// De jour, le cercle des perles à venir est d'or foncé pour se détacher du
// parchemin ; la nuit, l'or suffit (choix du porteur du projet, 2026-10-08).
for (const [theme, cercle] of [
  ['jour', 'rgb(138, 106, 42)'],
  ['nuit', 'rgb(201, 164, 92)'],
] as const) {
  test(`les perles à venir, cerclées pour se voir (${theme})`, async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { theme } })
    await expect(page.locator('.grain-a-venir').first()).toHaveCSS('stroke', cercle)
  })
}

test('glisser au tout début ne fait rien', async ({ page }) => {
  await commencer(page)
  await glisser(page, 160)
  await verifierPas(page, DEROULE[0], 0)
})

test('glisser depuis l’écran de fin revient à la dernière prière', async ({ page }) => {
  await commencer(page)
  await avancer(page, DEROULE.length)
  await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  await glisser(page, 160)
  await verifierPas(page, DEROULE.at(-1)!, DEROULE.length - 1)
})

test('glisser en partant de « Revenir à l’accueil » revient aussi en arrière', async ({ page }) => {
  await commencer(page)
  await avancer(page, DEROULE.length)
  const lien = (await page.getByRole('button', { name: 'Revenir à l’accueil' }).boundingBox())!
  await glisser(page, 160, lien.y + lien.height / 2)
  await verifierPas(page, DEROULE.at(-1)!, DEROULE.length - 1)
})

// La fin comme celle de l'office : une perle d'or, puis le chemin de
// l'accueil, sans titre ni « Recommencer » (choix du porteur du projet, 2026-10-08).
test('la fin du chapelet : une perle d’or, puis « Revenir à l’accueil »', async ({ page }) => {
  await commencer(page)
  await avancer(page, DEROULE.length)
  const fin = page.getByTestId('fin-chapelet')
  await expect(fin.locator('.repere-perle')).toHaveAttribute('data-couleur', 'or')
  await expect(fin.getByRole('heading')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Recommencer/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Revenir à l’accueil' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByTestId('bandeau')).toBeVisible()
})

test('le Credo s’affiche en strophes, comme dans le recueil', async ({ page }) => {
  await commencer(page)
  await toucher(page)
  await verifierPas(page, DEROULE[1], 1)
  const strophes = page.getByTestId('strophe')
  await expect(strophes).toHaveCount(4)
  await expect(strophes.last()).toHaveText('Amen.')
})

test('le clavier fait avancer et reculer (espace, flèches)', async ({ page }) => {
  await commencer(page)
  await verifierPas(page, DEROULE[0], 0)
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowRight')
  await verifierPas(page, DEROULE[2], 2)
  await page.keyboard.press('ArrowLeft')
  await verifierPas(page, DEROULE[1], 1)
})

test.describe('série du jour', () => {
  const jours: [string, number, string][] = [
    ['lundi', 5, 'Mystères joyeux'],
    ['mardi', 6, 'Mystères douloureux'],
    ['mercredi', 7, 'Mystères glorieux'],
    ['jeudi', 8, 'Mystères lumineux'],
    ['vendredi', 9, 'Mystères douloureux'],
    ['samedi', 10, 'Mystères joyeux'],
    ['dimanche', 11, 'Mystères glorieux'],
  ]
  for (const [jour, quantieme, titre] of jours) {
    test(`le ${jour}, ${titre.toLowerCase()}`, async ({ page }) => {
      await page.clock.setFixedTime(new Date(2026, 9, quantieme, 10, 0))
      await commencer(page)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre)
    })
  }
})

test('une série choisie par l’adresse remplace celle du jour', async ({ page }) => {
  await commencer(page, '/chapelet/lumineux')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mystères lumineux')
  await avancer(page, 7)
  await expect(page.getByTestId('annonce').getByRole('heading', { level: 2 })).toHaveText(
    'Le Baptême de Jésus au Jourdain',
  )
  await avancer(page, 1)
  await expect(page.getByTestId('mystere')).toHaveText('1 · Le Baptême de Jésus au Jourdain')
})

test('le chapelet s’ouvre par le menu de l’accueil, et son retour y ramène', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/')
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('link', { name: 'Chapelet' }).click()
  await expect(page).toHaveURL(/\/chapelet$/)
  await page.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: 'Menu' })).toBeVisible()
})

test('le compteur se place à droite du titre, sur sa ligne, le titre restant centré', async ({
  page,
}) => {
  // Le plus petit téléphone visé.
  await page.setViewportSize({ width: 360, height: 760 })
  await commencer(page)
  await avancer(page, 3)
  await expect(page.getByTestId('compteur')).toHaveText('1 / 3')
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)

  const titre = (await page.getByTestId('priere').getByRole('heading', { level: 2 }).boundingBox())!
  const compteur = (await page.getByTestId('compteur').boundingBox())!
  // Même ligne : les deux boîtes se recouvrent verticalement.
  expect(compteur.y).toBeLessThan(titre.y + titre.height)
  expect(compteur.y + compteur.height).toBeGreaterThan(titre.y)
  // À droite du titre, sans le chevaucher ni sortir de l'écran.
  expect(compteur.x).toBeGreaterThanOrEqual(titre.x + titre.width)
  expect(compteur.x + compteur.width).toBeLessThanOrEqual(360)
  // Titre centré sur l'écran, à une vingtaine de pixels près sur un petit écran.
  expect(Math.abs(titre.x + titre.width / 2 - 180)).toBeLessThan(20)
})
