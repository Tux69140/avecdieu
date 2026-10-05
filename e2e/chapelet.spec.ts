import { expect, test, type Page } from '@playwright/test'

const AVE = 'Je vous salue Marie'
const ORDINAUX = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième']
const JOYEUX = [
  'L’Annonciation',
  'La Visitation',
  'La Nativité',
  'La Présentation de Jésus au Temple',
  'Le Recouvrement de Jésus au Temple',
]

// Le déroulé attendu, écrit indépendamment du code : [prière, compteur, mystère].
type Attendu = { priere: string; compteur?: string; mystere?: string }
const DEROULE: Attendu[] = [
  { priere: 'Signe de croix' },
  { priere: 'Je crois en Dieu' },
  { priere: 'Notre Père' },
  ...[1, 2, 3].map((n) => ({ priere: AVE, compteur: `${n} / 3` })),
  { priere: 'Gloire au Père' },
  ...JOYEUX.flatMap((titre, d) => {
    const mystere = `${ORDINAUX[d]} mystère ${titre}`
    return [
      { priere: 'Notre Père', mystere },
      ...Array.from({ length: 10 }, (_, n) => ({ priere: AVE, compteur: `${n + 1} / 10`, mystere })),
      { priere: 'Gloire au Père', mystere },
    ]
  }),
]

// Un lundi : mystères joyeux.
const LUNDI = new Date(2026, 9, 5, 10, 0)

async function toucher(page: Page) {
  // Un toucher n'importe où : ici, au tiers bas de l'écran.
  const { width, height } = page.viewportSize()!
  await page.touchscreen.tap(width / 2, (height * 2) / 3)
}

// Glissement au doigt, de vrais événements tactiles.
async function glisser(page: Page, dx: number, y = page.viewportSize()!.height / 2) {
  const { width } = page.viewportSize()!
  const cdp = await page.context().newCDPSession(page)
  const x0 = width / 2 - dx / 2
  const point = (x: number) => [{ x, y }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(x0) })
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(x0 + (dx * i) / 8) })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

async function verifierPas(page: Page, attendu: Attendu, index: number) {
  const ecran = page.getByTestId('priere')
  await expect(ecran.getByRole('heading', { level: 2 }), `prière n° ${index + 1}`).toHaveText(attendu.priere)
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
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:4173/')) requetesExternes.push(r.url())
  })

  await page.goto('/chapelet')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mystères joyeux')

  let grainPrecedent = -1
  for (const [i, attendu] of DEROULE.entries()) {
    await verifierPas(page, attendu, i)
    // Le grain mis en évidence avance avec la prière, jamais de plus d'un grain.
    const grain = Number(await page.getByTestId('chapelet-dessine').getAttribute('data-grain-courant'))
    expect(grain - grainPrecedent).toBeLessThanOrEqual(1)
    expect(grain).toBeGreaterThanOrEqual(grainPrecedent)
    grainPrecedent = grain
    await toucher(page)
  }

  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  // Toucher l'écran de fin ne fait rien.
  await toucher(page)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  expect(requetesExternes).toEqual([])
})

test('glisser revient d’une prière en arrière, dans un sens comme dans l’autre', async ({ page }) => {
  await page.goto('/chapelet')
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
  await page.goto('/chapelet')
  await glisser(page, 160)
  await verifierPas(page, DEROULE[0], 0)
})

test('glisser depuis l’écran de fin revient au dernier Gloire au Père', async ({ page }) => {
  await page.goto('/chapelet')
  for (let i = 0; i < DEROULE.length; i++) await toucher(page)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  await glisser(page, 160)
  await verifierPas(page, DEROULE.at(-1)!, DEROULE.length - 1)
})

test('glisser en partant du bouton Recommencer revient aussi en arrière', async ({ page }) => {
  await page.goto('/chapelet')
  for (let i = 0; i < DEROULE.length; i++) await toucher(page)
  const bouton = (await page.getByRole('button', { name: 'Recommencer' }).boundingBox())!
  await glisser(page, 160, bouton.y + bouton.height / 2)
  await verifierPas(page, DEROULE.at(-1)!, DEROULE.length - 1)
})

test('le bouton Recommencer repart du signe de croix', async ({ page }) => {
  await page.goto('/chapelet')
  for (let i = 0; i < DEROULE.length; i++) await toucher(page)
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await verifierPas(page, DEROULE[0], 0)
})

test('le clavier fait avancer et reculer (espace, flèches)', async ({ page }) => {
  await page.goto('/chapelet')
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
      await page.goto('/chapelet')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre)
    })
  }
})

test('une série choisie par l’adresse remplace celle du jour', async ({ page }) => {
  await page.goto('/chapelet/lumineux')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mystères lumineux')
  for (let i = 0; i < 7; i++) await toucher(page)
  await expect(page.getByTestId('mystere')).toHaveText('Premier mystère Le Baptême de Jésus au Jourdain')
})

test('l’accueil mène au chapelet en attendant la phase 8', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/chapelet$/)
})
