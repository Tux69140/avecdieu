import { expect, type Page } from '@playwright/test'
import {
  avancer,
  commencer,
  journal,
  toucher,
  type Reglages,
  preparer,
  servirAelf,
  espionner,
  test,
} from './outils.ts'

// Phase 4 : réglages du chapelet (annonce, « Ô mon Jésus », Salve Regina,
// prier à plusieurs, affichage, vibrations) et reprise d'un chapelet interrompu.

const LUNDI = new Date(2026, 9, 5, 10, 0)
const MARDI = new Date(2026, 9, 6, 7, 0)
// Pas du déroulé complet : ouverture (0 à 6), puis 14 pas par dizaine.
const dizaine = (d: number) => 7 + (d - 1) * 14
// Sans aucun texte de clôture (phase 16) ni prière aux intentions du
// Saint-Père (phase 18), le dernier « Ô mon Jésus » finit le chapelet.
const SANS_CLOTURE: Reglages = {
  saintPere: false,
  salveRegina: false,
  litanies: 'jamais',
  oraisonRosaire: false,
  saintJoseph: 'jamais',
}

const titrePriere = (page: Page) => page.getByTestId('priere').getByRole('heading', { level: 2 })
const reglage = (page: Page, nom: string | RegExp) => page.getByRole('switch', { name: nom })

// Les réglages s'ouvrent par le menu ☰ de l'accueil, puis page par page.
async function ouvrirReglages(page: Page, ...lignes: string[]) {
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('link', { name: 'Réglages' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Réglages')
  for (const ligne of lignes) await page.getByRole('link', { name: ligne, exact: true }).click()
}

// Les réglages du chapelet sont sur deux pages : Chapelet et Prières du chapelet.
const CHAPELET = '/reglages/chapelet'
const PRIERES = '/reglages/chapelet/prieres'
const fermer = (page: Page) => page.getByRole('button', { name: 'Fermer', exact: true }).click()

// Du seuil ou de l'accueil, le chapelet par le menu.
async function ouvrirChapelet(page: Page) {
  await page.getByRole('link', { name: 'Menu' }).click()
  await page.getByRole('link', { name: 'Chapelet' }).click()
}

const accueil = (page: Page) => expect(page.getByRole('link', { name: 'Menu' })).toBeVisible()

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(LUNDI)
  await servirAelf(page)
})

test.describe('écran des réglages', () => {
  test('s’ouvre par le menu de l’accueil, montre les réglages par défaut, et y ramène', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/')
    await ouvrirReglages(page, 'Chapelet')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chapelet')
    await expect(reglage(page, 'Prier à plusieurs')).toHaveAttribute('aria-checked', 'false')
    await expect(page.getByRole('radio', { name: 'Texte complet' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(reglage(page, 'Vibrations')).toHaveAttribute('aria-checked', 'true')
    await page.getByRole('link', { name: 'Prières du chapelet' }).click()
    await expect(reglage(page, 'Annonce des mystères')).toHaveAttribute('aria-checked', 'true')
    await expect(reglage(page, /Ô mon Jésus/)).toHaveAttribute('aria-checked', 'true')
    await expect(reglage(page, 'Salve Regina')).toHaveAttribute('aria-checked', 'true')

    // La croix remonte d'un niveau à chaque fois, jusqu'à l'accueil.
    await fermer(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chapelet')
    await fermer(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Réglages')
    await fermer(page)
    await accueil(page)
  })

  test('chaque réglage se retient après redémarrage de l’app', async ({ page }) => {
    await preparer(page)
    await page.goto(PRIERES)
    await reglage(page, 'Annonce des mystères').click()
    await reglage(page, /Ô mon Jésus/).click()
    await reglage(page, 'Salve Regina').click()
    await page.goto(CHAPELET)
    await reglage(page, 'Prier à plusieurs').click()
    await page.getByRole('radio', { name: 'Compact' }).click()
    await reglage(page, 'Vibrations').click()

    await page.reload()
    await expect(reglage(page, 'Prier à plusieurs')).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('radio', { name: 'Compact' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(reglage(page, 'Vibrations')).toHaveAttribute('aria-checked', 'false')
    await page.goto(PRIERES)
    for (const nom of ['Annonce des mystères', /Ô mon Jésus/, 'Salve Regina'])
      await expect(reglage(page, nom)).toHaveAttribute('aria-checked', 'false')

    // Le seuil partage la même mémoire.
    await page.goto('/')
    await ouvrirChapelet(page)
    await expect(page.getByRole('radio', { name: 'Compact' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(reglage(page, 'Vibrations')).toHaveAttribute('aria-checked', 'false')
  })
  test('l’aide aux gestes, écartée par « Ne plus afficher », se rétablit ici', async ({ page }) => {
    await preparer(page, { aide: true })
    await page.goto('/chapelet')
    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    const aide = page.getByRole('dialog', { name: 'Prier avec l’app' })
    await aide.getByRole('checkbox', { name: 'Ne plus afficher' }).check()
    await aide.getByRole('button').last().click()
    // Retirée de la page, elle a enregistré son choix (l'événement « close »
    // arrive après la fermeture : un changement d'écran trop prompt le perdrait).
    await expect(aide).toHaveCount(0)
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('avec-dieu.aide-gestes')))
      .toBe('masquee')

    await page.goto(CHAPELET)
    await expect(reglage(page, 'Aide aux gestes')).toHaveAttribute('aria-checked', 'false')
    await reglage(page, 'Aide aux gestes').click()
    await expect(reglage(page, 'Aide aux gestes')).toHaveAttribute('aria-checked', 'true')

    await page.goto('/chapelet')
    await page.getByRole('button', { name: /Commencer le chapelet|Recommencer du début/ }).click()
    await expect(page.getByRole('dialog', { name: 'Prier avec l’app' })).toBeVisible()
  })

  test('« Réinitialiser l’app » demande confirmation, puis rend l’app comme neuve', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto(PRIERES)
    await reglage(page, 'Annonce des mystères').click()

    // Plus de fenêtre : la page explique, le bouton est dessous.
    await page.goto('/reglages')
    await page.getByRole('link', { name: 'Réinitialiser l’app' }).click()
    await expect(page).toHaveURL('/reglages/reinitialiser')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Réinitialiser l’app ?')
    await expect(page.locator('main')).toContainText(
      'Réglages, rappels, lieu et chapelet en cours sont effacés : l’app revient comme au premier lancement. Les textes enregistrés pour la semaine sont gardés.',
    )
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.getByRole('button', { name: 'Annuler' }).click()
    await expect(page).toHaveURL('/reglages')
    await page.goto(PRIERES)
    await expect(reglage(page, 'Annonce des mystères')).toHaveAttribute('aria-checked', 'false')

    await page.goto('/reglages/reinitialiser')
    await page.getByRole('button', { name: 'Réinitialiser', exact: true }).click()
    await accueil(page)
    await expect(page).toHaveURL(/\/$/)

    await ouvrirReglages(page, 'Chapelet')
    // L'aide aux gestes, écartée au départ du parcours, revient elle aussi.
    await expect(reglage(page, 'Aide aux gestes')).toHaveAttribute('aria-checked', 'true')
    await page.getByRole('link', { name: 'Prières du chapelet' }).click()
    await expect(reglage(page, 'Annonce des mystères')).toHaveAttribute('aria-checked', 'true')
  })
})

test.describe('déroulé selon les réglages', () => {
  test('par défaut, chaque dizaine finit par le « Ô mon Jésus », le chapelet par la clôture', async ({
    page,
  }) => {
    await commencer(page)
    await avancer(page, dizaine(2) - 2)
    await expect(titrePriere(page)).toHaveText('Gloire au Père')
    await toucher(page)
    await expect(titrePriere(page)).toHaveText('Ô mon Jésus')
    await expect(page.getByTestId('mystere')).toHaveText('1 · L’Annonciation')
    await toucher(page)
    await expect(page.getByTestId('annonce')).toBeVisible()

    await avancer(page, dizaine(6) - dizaine(2))
    // La prière aux intentions du Saint-Père (phase 18), puis la clôture.
    await expect(titrePriere(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('intention')).toHaveText('Aux intentions du Saint-Père.')
    await expect(page.getByTestId('mystere')).toHaveCount(0)
    await avancer(page, 3)
    await expect(titrePriere(page)).toHaveText('Salve Regina')
    await expect(page.getByTestId('mystere')).toHaveCount(0)
    // Un lundi d'octobre : Litanies, oraison et saint Joseph suivent.
    await avancer(page, 4)
    await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  })

  test('sans « Ô mon Jésus », le Gloire au Père mène à la dizaine suivante', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { oMonJesus: false } })
    await avancer(page, dizaine(2) - 2)
    await expect(titrePriere(page)).toHaveText('Gloire au Père')
    await toucher(page)
    await expect(page.getByTestId('annonce')).toBeVisible()
  })

  test('sans texte de clôture, le dernier « Ô mon Jésus » mène à la fin', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: SANS_CLOTURE })
    await avancer(page, dizaine(6) - 1)
    await expect(titrePriere(page)).toHaveText('Ô mon Jésus')
    await avancer(page, 1)
    await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  })

  // Prières vocales seules : rien du mystère (choix du porteur du projet, 2026-10-06).
  test('sans annonce, ni écran d’annonce, ni mystère, ni fruit', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { annonce: false } })
    await avancer(page, 7)
    await expect(page.getByTestId('annonce')).toHaveCount(0)
    await expect(titrePriere(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('compteur')).toHaveCount(0)
    await avancer(page, 1)
    await expect(page.getByTestId('compteur')).toHaveText('1 / 10')
    await expect(page.getByTestId('mystere')).toHaveCount(0)
    await expect(page.getByText(/mystère|Fruit/)).toHaveCount(0)
  })

  test('sans annonce, en compact, ni mystère, ni fruit, ni « Lire le passage »', async ({
    page,
  }) => {
    await commencer(page, '/chapelet', { reglages: { annonce: false, affichage: 'compact' } })
    await avancer(page, 7)
    await expect(titrePriere(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('mystere')).toHaveCount(0)
    await expect(page.getByText(/Fruit/)).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Voir la prière' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Lire le passage' })).toHaveCount(0)
  })

  test('sans annonce ni « Ô mon Jésus », le Salve Regina vient au bon rang', async ({ page }) => {
    // Ouverture 7, puis par dizaine : annonce ?, Notre Père, 10 Ave, Gloire, Ô mon Jésus ?
    const attendu = ({ annonce = true, oMonJesus = true, salveRegina = true }: Reglages) =>
      7 + 5 * (12 + Number(annonce) + Number(oMonJesus)) + Number(salveRegina)
    const combinaison: Reglages = {
      ...SANS_CLOTURE,
      annonce: false,
      oMonJesus: false,
      salveRegina: true,
    }
    await commencer(page, '/chapelet', { reglages: combinaison })
    await avancer(page, attendu(combinaison) - 1)
    await expect(titrePriere(page)).toHaveText('Salve Regina')
    await avancer(page, 1)
    await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  })
})

test.describe('prier à plusieurs', () => {
  test('V/ et R/ marquent la part de chacun du Je vous salue Marie', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { plusieurs: true } })
    await avancer(page, 3)
    await expect(titrePriere(page)).toHaveText('Je vous salue Marie')
    const strophes = page.getByTestId('strophe')
    await expect(strophes.getByRole('img', { name: 'Verset' })).toHaveCount(1)
    await expect(strophes.getByRole('img', { name: 'Répons' })).toHaveCount(1)
    await expect(strophes.filter({ has: page.getByTestId('marque-R') })).toContainText(
      'Sainte Marie, Mère de Dieu',
    )
  })

  // Comme dans l'office : la part de tous en demi-gras, plus de « Tous »
  // (choix du porteur du projet, 2026-10-08). Le verset du Salve Regina garde
  // ses ℣. et ℟., en graisse normale ; il n'y est dit que sans l'oraison du
  // Rosaire (phase 16).
  test('les prières dites ensemble en demi-gras, jusqu’au verset du Salve Regina', async ({
    page,
  }) => {
    // Sans la prière aux intentions du Saint-Père, le Salve suit la dernière dizaine.
    await commencer(page, '/chapelet', {
      reglages: { plusieurs: true, oraisonRosaire: false, saintPere: false },
    })
    const vers = page.getByTestId('strophe').locator('span')
    await expect(page.getByText('Tous', { exact: true })).toHaveCount(0)
    await expect(vers.first()).toHaveCSS('font-weight', '600')
    await avancer(page, 1)
    await expect(titrePriere(page)).toHaveText('Je crois en Dieu')
    await expect(vers.first()).toHaveCSS('font-weight', '600')
    await avancer(page, 1)
    await expect(titrePriere(page)).toHaveText('Notre Père')
    for (const span of await vers.all()) await expect(span).toHaveCSS('font-weight', '400')
    await avancer(page, dizaine(6) - 2)
    await expect(titrePriere(page)).toHaveText('Salve Regina')
    await expect(vers.first()).toHaveCSS('font-weight', '600')
    const verset = vers.filter({ has: page.getByTestId('marque-V') })
    await expect(verset).toHaveCSS('font-weight', '400')
    await expect(page.getByText('Tous', { exact: true })).toHaveCount(0)
  })

  // Seul ou en groupe se décide au seuil, le même réglage que dans les
  // réglages (choix du porteur du projet, 2026-10-08).
  test('se choisit au seuil, et les réglages le retiennent', async ({ page }) => {
    await preparer(page)
    await page.goto('/chapelet')
    await reglage(page, 'Prier à plusieurs').click()
    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    await expect(page.getByTestId('strophe').locator('span').first()).toHaveCSS(
      'font-weight',
      '600',
    )
    await page.goto(CHAPELET)
    await expect(reglage(page, 'Prier à plusieurs')).toBeChecked()
  })

  test('l’aide dit ℣ ℟ et le demi-gras, à plusieurs seulement', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { plusieurs: true } })
    const aide = page.getByRole('dialog', { name: 'Prier avec l’app' })
    await page.getByRole('button', { name: 'Aide aux gestes' }).click()
    await expect(aide.getByRole('listitem')).toHaveCount(7)
    await expect(aide).toContainText(
      '℣. celui qui mène, ℟. ceux qui répondent. Seul, on dit les deux.',
    )
    await expect(aide).toContainText('En gras, ce que disent tous.')
  })

  test('seul, ni demi-gras ni marque, sauf le verset du Salve Regina', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { oraisonRosaire: false, saintPere: false } })
    await expect(page.getByTestId('strophe').locator('span').first()).toHaveCSS(
      'font-weight',
      '400',
    )
    await avancer(page, 3)
    await expect(titrePriere(page)).toHaveText('Je vous salue Marie')
    await expect(page.getByTestId('marque-V')).toHaveCount(0)
    await avancer(page, dizaine(6) - 3)
    await expect(titrePriere(page)).toHaveText('Salve Regina')
    await expect(page.getByTestId('marque-V')).toHaveCount(1)
    await expect(page.getByTestId('marque-R')).toHaveCount(1)
  })
})

test.describe('vibrations', () => {
  test('sur un appareil sans vibreur (tablette), le réglage n’apparaît pas', async ({ page }) => {
    await page.addInitScript(() => Reflect.deleteProperty(Navigator.prototype, 'vibrate'))
    await preparer(page)
    await page.goto('/chapelet')
    await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Compact' })).toBeVisible()
    await expect(reglage(page, 'Vibrations')).toHaveCount(0)
    await page.goto(CHAPELET)
    await expect(reglage(page, 'Prier à plusieurs')).toBeVisible()
    await expect(reglage(page, 'Vibrations')).toHaveCount(0)
  })

  test('se coupent depuis le seuil, puis se rétablissent', async ({ page }) => {
    await espionner(page)
    await preparer(page)
    await page.goto('/chapelet')
    await reglage(page, 'Vibrations').click()
    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    await expect(titrePriere(page)).toHaveText('Signe de croix')
    await avancer(page, 8)
    await expect(titrePriere(page)).toHaveText('Notre Père')
    expect((await journal(page)).filter((e) => e.startsWith('vibre'))).toEqual([])

    await page.goBack()
    await reglage(page, 'Vibrations').click()
    await page.getByRole('button', { name: 'Reprendre à la 1re dizaine' }).click()
    // Une touche pressée avant que la prière reprise soit affichée serait perdue.
    await expect(titrePriere(page)).toHaveText('Notre Père')
    // Le seuil, plus long depuis la phase 18, a défilé : un toucher qui
    // suivrait de trop près la remise en haut de la page ne compterait pas.
    await avancer(page, 1)
    await expect(page.getByTestId('compteur')).toHaveText('1 / 10')
    await expect.poll(() => journal(page)).toContain('vibre 40')
  })
})

test.describe('reprise d’un chapelet interrompu', () => {
  // 3e dizaine, 4e Je vous salue Marie.
  const AVE_3_4 = dizaine(3) + 5

  async function verifierAve34(page: Page) {
    await expect(titrePriere(page)).toHaveText('Je vous salue Marie')
    await expect(page.getByTestId('compteur')).toHaveText('4 / 10')
    await expect(page.getByTestId('mystere')).toHaveText('3 · La Nativité')
  }

  test('rouverte le jour même, l’app s’ouvre sur l’accueil et le seuil reprend au même grain', async ({
    page,
    context,
  }) => {
    await commencer(page)
    await avancer(page, AVE_3_4)
    await verifierAve34(page)
    const grain = await page.getByTestId('chapelet-dessine').getAttribute('data-grain-courant')
    await page.close()

    // L'app relancée par Android s'ouvre toujours sur l'accueil (choix du
    // porteur du projet, 2026-10-06) ; le seuil du chapelet propose la reprise.
    const relance = await context.newPage()
    await servirAelf(relance)
    await relance.clock.setFixedTime(new Date(2026, 9, 5, 22, 30))
    await relance.goto('/')
    await accueil(relance)
    await ouvrirChapelet(relance)
    await relance.getByRole('button', { name: 'Reprendre à la 3e dizaine' }).click()
    await verifierAve34(relance)
    await expect(relance.getByTestId('chapelet-dessine')).toHaveAttribute(
      'data-grain-courant',
      grain!,
    )
    await relance.goBack()
    await relance.getByRole('button', { name: 'Recommencer du début' }).click()
    await expect(titrePriere(relance)).toHaveText('Signe de croix')
  })

  test('rouverte le lendemain, l’app repart au début avec la série du jour', async ({
    page,
    context,
  }) => {
    await commencer(page)
    await avancer(page, AVE_3_4)
    await verifierAve34(page)
    await page.close()

    const lendemain = await context.newPage()
    await servirAelf(lendemain)
    await lendemain.clock.setFixedTime(MARDI)
    await lendemain.goto('/')
    await ouvrirChapelet(lendemain)
    await expect(lendemain.getByRole('heading', { level: 1 })).toHaveText('Mystères douloureux')
    await expect(lendemain.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
    await lendemain.getByRole('link', { name: /Mystères joyeux/ }).click()
    await expect(lendemain.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  })

  test('un réglage changé en cours de route reprend à la même prière', async ({ page }) => {
    await commencer(page)
    await avancer(page, AVE_3_4)
    await page.goBack()
    await page.getByRole('button', { name: 'Fermer', exact: true }).click()
    await ouvrirReglages(page, 'Chapelet', 'Prières du chapelet')
    // Sans « Ô mon Jésus », les deux premières dizaines ont une prière de moins.
    await reglage(page, /Ô mon Jésus/).click()
    for (let i = 0; i < 3; i++) await fermer(page)
    await ouvrirChapelet(page)
    const reprendre = page.getByRole('button', { name: 'Reprendre à la 3e dizaine' })
    // L'ordinal en exposant, comme partout dans l'app (« 3ᵉ »).
    await expect(reprendre.locator('sup')).toHaveText('e')
    await reprendre.click()
    await verifierAve34(page)
  })

  test('un chapelet terminé ne se reprend pas', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: SANS_CLOTURE })
    await avancer(page, dizaine(6))
    await expect(page.getByTestId('fin-chapelet')).toBeVisible()
    await page.goBack()
    await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  })
})
