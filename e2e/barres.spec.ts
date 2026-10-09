import { expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  avancer,
  faireRevenirBandeau,
  commencer,
  defilementArrete,
  derniereLigneVisible,
  preparer,
  rosaireAuPassage,
  servirAelf,
  simulerTelephone,
  test,
  toucher,
} from './outils.ts'

// Sur le téléphone, l'app s'étend sous les barres d'Android (état en haut,
// navigation en bas), transparentes. Capacitor donne leur hauteur dans les
// variables --safe-area-inset-* ; on les simule ici comme sur le Xiaomi. Rien
// ne doit s'afficher sous les barres, ni en haut de page ni en défilant
// (défaut vu deux fois sur le téléphone du porteur du projet).
const HAUT = 40
const BAS = 48

async function simulerBarres(page: Page) {
  await page.addInitScript(
    ({ haut, bas }) => {
      // Le script passe avant que la page existe : on attend sa racine.
      const appliquer = () => {
        const racine = document.documentElement.style
        racine.setProperty('--safe-area-inset-top', `${haut}px`)
        racine.setProperty('--safe-area-inset-bottom', `${bas}px`)
      }
      if (document.documentElement) appliquer()
      else document.addEventListener('readystatechange', appliquer, { once: true })
    },
    { haut: HAUT, bas: BAS },
  )
}

// Ce qui s'affiche au point (x, y) de l'écran.
const auPoint = (page: Page, x: number, y: number) =>
  page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.className ?? '', [x, y])

async function verifierBarres(page: Page) {
  const { width, height } = page.viewportSize()!
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight)
  // En haut de page, au milieu, puis tout en bas.
  for (const y of [0, (hauteur - height) / 2, hauteur]) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    for (const x of [20, width / 2, width - 20]) {
      expect(await auPoint(page, x, HAUT / 2), `barre du haut, défilement ${y}`).toContain(
        'voile-barre',
      )
      expect(await auPoint(page, x, height - BAS / 2), `barre du bas, défilement ${y}`).toContain(
        'voile-barre',
      )
    }
  }
  // Rien d'utile ne commence sous la barre du haut.
  await page.evaluate(() => window.scrollTo(0, 0))
  const premier = await page.evaluate(() => {
    const visibles = [...document.querySelectorAll('main *')].filter(
      (e) => e.getBoundingClientRect().height > 0,
    )
    return Math.min(...visibles.map((e) => e.getBoundingClientRect().top))
  })
  expect(premier).toBeGreaterThanOrEqual(HAUT)
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await page.clock.setFixedTime(new Date(2026, 9, 5, 10, 0))
  await simulerBarres(page)
})

test('Capacitor fournit la hauteur des barres (réglage « css »)', () => {
  // Une valeur invalide a déjà privé l'app de la hauteur des barres.
  const config = readFileSync('capacitor.config.ts', 'utf8')
  expect(config).toMatch(/insetsHandling: 'css'/)
})

for (const [nom, chemin] of [
  ['seuil', '/chapelet'],
  ['seuil du Rosaire', '/rosaire'],
  ['chapelet ou Rosaire ?', '/chapelet-ou-rosaire'],
  ['menu', '/menu'],
  ['réglages', '/reglages'],
  ['réglages · rappels', '/reglages/rappels'],
  ['réglages · page d’une prière', '/reglages/rappels/laudes'],
  ['réglages · batterie', '/reglages/rappels/batterie'],
  ['réglages · chapelet', '/reglages/chapelet'],
  ['réglages · prières du chapelet', '/reglages/chapelet/prieres'],
  ['réglages · offices', '/reglages/offices'],
  ['réglages · zone liturgique', '/reglages/offices/zone'],
  ['réglages · affichage', '/reglages/affichage'],
  ['réglages · réinitialiser', '/reglages/reinitialiser'],
  ['à propos', '/a-propos'],
  ['lieu des heures solaires', '/lieu'],
  ['accueil', '/'],
  ['accueil d’un autre jour', '/jour/2026-10-11'],
  ['office', '/office/lectures/2026-10-06'],
  ['prière seule', '/priere/credo'],
]) {
  test(`${nom} : rien sous les barres d’Android`, async ({ page }) => {
    await servirAelf(page)
    await preparer(page)
    await page.goto(chemin)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Un office n'a sa longueur qu'une fois chargé.
    await expect(page.getByRole('status')).toHaveCount(0)
    await verifierBarres(page)
  })
}

test('accueil, rappels bloqués : l’alerte, sur sa propre ligne, reste sous la barre du haut', async ({
  page,
}) => {
  await servirAelf(page)
  await simulerTelephone(page, { accord: 'denied' })
  await preparer(page, { rappels: ['laudes'] })
  await page.goto('/')
  const alerte = page.getByRole('link', { name: 'Rappels bloqués par le téléphone' })
  await expect(alerte).toBeVisible()
  await verifierBarres(page)
  expect((await alerte.boundingBox())!.y).toBeGreaterThanOrEqual(HAUT)
})

test('chapelet : rien sous les barres d’Android', async ({ page }) => {
  await commencer(page)
  await verifierBarres(page)
  // La croix qui ferme le chapelet se touche sous la barre d'état, pas dedans.
  const croix = page.getByRole('button', { name: 'Fermer', exact: true })
  expect((await croix.boundingBox())!.y).toBeGreaterThanOrEqual(HAUT)
})

test('Rosaire, passage de série : rien sous les barres d’Android', async ({ page }) => {
  await rosaireAuPassage(page, '2026-10-05')
  await verifierBarres(page)
})

test('office : le bandeau et le sommaire s’écartent des barres d’Android', async ({ page }) => {
  await servirAelf(page)
  await preparer(page)
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  await faireRevenirBandeau(page)
  const bandeau = page.getByTestId('bandeau-office')
  await expect(bandeau).toBeVisible()
  await verifierBarres(page)
  await faireRevenirBandeau(page)
  await expect(bandeau).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
  expect((await bandeau.boundingBox())!.y).toBeGreaterThanOrEqual(HAUT)

  await bandeau.click()
  const volet = page.getByRole('dialog', { name: 'Sommaire · Laudes' })
  await expect(volet).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
  const boite = (await volet.boundingBox())!
  expect(boite.y).toBeGreaterThanOrEqual(HAUT)
  expect(boite.y + boite.height).toBeLessThanOrEqual(page.viewportSize()!.height - BAS)
})

test('les fenêtres d’aide de l’office et du chapelet s’écartent des barres d’Android', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await servirAelf(page)
  await preparer(page, { aide: true })
  const hauteur = page.viewportSize()!.height
  for (const [chemin, nom] of [
    ['/office/laudes/2026-10-06', 'Lire un office'],
    ['/chapelet', 'Prier avec l’app'],
  ]) {
    await page.goto(chemin)
    if (chemin === '/chapelet')
      await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    const fenetre = page.getByRole('dialog', { name: nom })
    await expect(fenetre).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
    const boite = (await fenetre.boundingBox())!
    expect(boite.y, nom).toBeGreaterThanOrEqual(HAUT)
    expect(boite.y + boite.height, nom).toBeLessThanOrEqual(hauteur - BAS)
  }
})

test('annonce d’un mystère : la grosse perle reste au-dessus de la barre du bas', async ({
  page,
}) => {
  await commencer(page)
  await avancer(page, 7)
  const perle = page.getByRole('button', { name: 'Commencer la dizaine' })
  await expect(perle).toBeVisible()
  const boite = (await perle.boundingBox())!
  expect(boite.y + boite.height).toBeLessThanOrEqual(page.viewportSize()!.height - BAS)
  await verifierBarres(page)
})

// À partir de 20 px, le chapelet dessiné rapetisse et les espaces se
// resserrent : un Je vous salue tient entre les barres à 20 px (choix du
// porteur du projet, 2026-10-08). À 18 px, rien ne change.
for (const tailleTexte of [18, 20]) {
  test(`chapelet, texte à ${tailleTexte} px : un Je vous salue tient entre les barres`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await commencer(page, '/chapelet', { reglages: { tailleTexte } })
    // Le premier Je vous salue Marie porte son intention (phase 16) : il tient aussi.
    await avancer(page, 3)
    await expect(page.getByTestId('intention')).toHaveText('Pour la foi.')
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
    const ouverture = (await page.locator('.priere-texte').boundingBox())!
    expect(ouverture.y + ouverture.height).toBeLessThanOrEqual(780 - BAS)
    await avancer(page, 6)
    await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
      'Je vous salue Marie',
    )
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
    const dessin = (await page.getByTestId('chapelet-dessine').boundingBox())!
    // Le dessin ne rapetisse qu'au-delà de la taille par défaut.
    if (tailleTexte === 18) expect(dessin.height).toBeGreaterThan(100)
    else expect(dessin.height).toBeLessThan(80)
    const texte = (await page.locator('.priere-texte').boundingBox())!
    expect(texte.y + texte.height).toBeLessThanOrEqual(780 - BAS)
    await expect(page.getByRole('button', { name: 'Plus bas' })).toBeHidden()
  })
}

// Les Litanies, plus hautes que l'écran : rien sous les barres en défilant,
// et chaque toucher descend sans rien cacher sous la barre du haut (phase 16).
test('Litanies : rien sous les barres, le toucher descend entre elles', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await commencer(page, '/chapelet', { reglages: { salveRegina: false, saintPere: false } })
  await avancer(page, 77)
  await expect(page.getByTestId('invocation').first()).toBeVisible()
  await verifierBarres(page)
  // La dernière ligne entière au-dessus du signal « Plus bas » reste visible
  // sous la barre du haut après le toucher (deux lignes gardées).
  await expect(page.getByRole('button', { name: 'Plus bas' })).toBeVisible()
  const ligne = await derniereLigneVisible(page)
  // verifierBarres vient de faire défiler la page : un toucher trop prompt
  // l'arrêterait seulement, et ne compterait pas.
  await expect(async () => {
    await toucher(page)
    await expect.poll(() => page.evaluate(() => scrollY), { timeout: 500 }).toBeGreaterThan(0)
  }).toPass()
  expect(await defilementArrete(page)).toBeGreaterThan(300)
  expect(ligne - (await page.evaluate(() => scrollY))).toBeGreaterThanOrEqual(HAUT)
})

test('rappels : la fenêtre d’autorisation s’écarte des barres d’Android', async ({ page }) => {
  await simulerTelephone(page, { accord: 'prompt' })
  await preparer(page)
  await page.goto('/reglages/rappels')
  await verifierBarres(page)
  await page.getByRole('switch', { name: 'Laudes, rappel' }).click()
  const fenetre = page.getByRole('dialog', { name: 'Recevoir les rappels' })
  await expect(fenetre).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
  const boite = (await fenetre.boundingBox())!
  expect(boite.y).toBeGreaterThanOrEqual(HAUT)
  expect(boite.y + boite.height).toBeLessThanOrEqual(page.viewportSize()!.height - BAS)
})

// Objectif validé : à 360 × 780, l'accueil tient en un écran jusqu'au bas de
// la liste, complies comprises. Depuis la phase 18, le Chapelet et le Rosaire
// l'ouvrent ; la navigation des jours est montée sur la ligne du ☰ pour
// regagner la place (choix du porteur du projet, 2026-10-09).
for (const [nom, jour, titreDuJour, lignesDuTitre, derniere] of [
  ['titre d’une ligne', new Date(2026, 9, 6, 12, 15), 'S. Bruno', 1, /^Complies/],
  [
    'saint sur deux lignes',
    new Date(2026, 9, 15, 12, 15),
    'Ste Thérèse de Jésus (d’Avila)',
    2,
    /^Complies/,
  ],
] as const) {
  test(`accueil, ${nom} : tout tient jusqu’à la ligne ${derniere.source.slice(1)}, barres comprises`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.clock.setFixedTime(jour)
    await servirAelf(page)
    await preparer(page)
    await page.goto('/')
    const titre = page.getByTestId('bandeau').locator('.bandeau-titre')
    await expect(titre).toHaveText(titreDuJour)
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
    const lignes = await titre.evaluate(
      (t) => t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight),
    )
    expect(Math.round(lignes)).toBe(lignesDuTitre)
    const ligne = (await page
      .getByRole('list', { name: 'Offices du jour' })
      .getByRole('link', { name: derniere })
      .boundingBox())!
    expect(ligne.y + ligne.height).toBeLessThanOrEqual(page.viewportSize()!.height - BAS)
  })
}

// Phase 18 : l'intention du mois mène à la partie « Aux intentions du
// Saint-Père » de la page d'aide, dont le titre s'arrête sous la barre du haut.
test('aide aux intentions du Saint-Père : le titre de la partie sous la barre du haut', async ({
  page,
}) => {
  await preparer(page, {
    enCours: {
      jour: '2026-10-05',
      forme: 'chapelet',
      serie: 'joyeux',
      dizaine: 5,
      priere: 'o-mon-jesus',
      rang: 1,
    },
  })
  await page.goto('/chapelet')
  await page.getByRole('button', { name: 'Reprendre à la 5e dizaine' }).click()
  await avancer(page, 1)
  await verifierBarres(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('link', { name: /^Ce mois-/ }).click()
  const partie = page.getByRole('heading', { name: /^Aux intentions du Saint-/ })
  await expect(partie).toBeInViewport()
  await expect.poll(async () => (await partie.boundingBox())!.y).toBeGreaterThanOrEqual(HAUT)
  await verifierBarres(page)
})
