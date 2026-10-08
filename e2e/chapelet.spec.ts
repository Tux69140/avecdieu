import { expect, type Page } from '@playwright/test'
import { commencer, glisser, preparer, servirAelf, suivant, test, toucher } from './outils.ts'

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
  { priere: 'Salve Regina' },
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
    await suivant(page)
  }

  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  // Toucher l'écran de fin ne fait rien.
  await toucher(page)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  expect(requetesExternes).toEqual([])
})

test('glisser revient d’une prière en arrière, dans un sens comme dans l’autre', async ({
  page,
}) => {
  await commencer(page)
  for (let i = 0; i < 5; i++) await toucher(page)
  await verifierPas(page, DEROULE[5], 5)

  await glisser(page, 160)
  await verifierPas(page, DEROULE[4], 4)
  await glisser(page, -160)
  await verifierPas(page, DEROULE[3], 3)

  // Avancer de nouveau reprend juste après.
  await toucher(page)
  await verifierPas(page, DEROULE[4], 4)
})

test('glisser au tout début ne fait rien', async ({ page }) => {
  await commencer(page)
  await glisser(page, 160)
  await verifierPas(page, DEROULE[0], 0)
})

test('glisser depuis l’écran de fin revient au Salve Regina', async ({ page }) => {
  await commencer(page)
  for (let i = 0; i < DEROULE.length; i++) await suivant(page)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  await glisser(page, 160)
  await verifierPas(page, DEROULE.at(-1)!, DEROULE.length - 1)
})

test('glisser en partant du bouton Recommencer revient aussi en arrière', async ({ page }) => {
  await commencer(page)
  for (let i = 0; i < DEROULE.length; i++) await suivant(page)
  const bouton = (await page.getByRole('button', { name: 'Recommencer' }).boundingBox())!
  await glisser(page, 160, bouton.y + bouton.height / 2)
  await verifierPas(page, DEROULE.at(-1)!, DEROULE.length - 1)
})

test('le bouton Recommencer repart du signe de croix', async ({ page }) => {
  await commencer(page)
  for (let i = 0; i < DEROULE.length; i++) await suivant(page)
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await verifierPas(page, DEROULE[0], 0)
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
  for (let i = 0; i < 7; i++) await toucher(page)
  await expect(page.getByTestId('annonce').getByRole('heading', { level: 2 })).toHaveText(
    'Le Baptême de Jésus au Jourdain',
  )
  await suivant(page)
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
  for (let i = 0; i < 3; i++) await toucher(page)
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
