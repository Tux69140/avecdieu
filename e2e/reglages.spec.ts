import { expect, test, type Page } from '@playwright/test'
import {
  commencer,
  espionner,
  journal,
  preparer,
  avancer,
  toucher,
  type Reglages,
} from './outils.ts'

// Phase 4 : réglages du chapelet (annonce, « Ô mon Jésus », Salve Regina,
// prier à plusieurs, affichage, vibrations) et reprise d'un chapelet interrompu.

const LUNDI = new Date(2026, 9, 5, 10, 0)
const MARDI = new Date(2026, 9, 6, 7, 0)
// Pas du déroulé complet : ouverture (0 à 6), puis 14 pas par dizaine.
const dizaine = (d: number) => 7 + (d - 1) * 14

const titrePriere = (page: Page) => page.getByTestId('priere').getByRole('heading', { level: 2 })
const reglage = (page: Page, nom: string | RegExp) => page.getByRole('switch', { name: nom })

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(LUNDI)
})

test.describe('écran des réglages', () => {
  test('s’ouvre depuis le seuil, montre les réglages par défaut, et y ramène', async ({ page }) => {
    await preparer(page)
    await page.goto('/chapelet')
    await page.getByRole('link', { name: 'Tous les réglages' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Réglages')
    await expect(reglage(page, 'Annonce des mystères')).toHaveAttribute('aria-checked', 'true')
    await expect(reglage(page, /Ô mon Jésus/)).toHaveAttribute('aria-checked', 'true')
    await expect(reglage(page, 'Salve Regina à la fin')).toHaveAttribute('aria-checked', 'true')
    await expect(reglage(page, 'Prier à plusieurs')).toHaveAttribute('aria-checked', 'false')
    await expect(page.getByRole('radio', { name: 'Texte complet' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(reglage(page, 'Vibrations')).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('button', { name: /Retour au chapelet/ }).click()
    await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  })

  test('chaque réglage se retient après redémarrage de l’app', async ({ page }) => {
    await preparer(page)
    await page.goto('/reglages')
    await reglage(page, 'Annonce des mystères').click()
    await reglage(page, /Ô mon Jésus/).click()
    await reglage(page, 'Salve Regina à la fin').click()
    await reglage(page, 'Prier à plusieurs').click()
    await page.getByRole('radio', { name: 'Compact' }).click()
    await reglage(page, 'Vibrations').click()

    await page.reload()
    for (const nom of ['Annonce des mystères', /Ô mon Jésus/, 'Salve Regina à la fin'])
      await expect(reglage(page, nom)).toHaveAttribute('aria-checked', 'false')
    await expect(reglage(page, 'Prier à plusieurs')).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('radio', { name: 'Compact' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(reglage(page, 'Vibrations')).toHaveAttribute('aria-checked', 'false')

    // Le seuil partage la même mémoire.
    await page.getByRole('button', { name: /Retour au chapelet/ }).click()
    await expect(page.getByRole('radio', { name: 'Compact' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await expect(reglage(page, 'Vibrations')).toHaveAttribute('aria-checked', 'false')
  })
})

test.describe('déroulé selon les réglages', () => {
  test('par défaut, chaque dizaine finit par le « Ô mon Jésus », le chapelet par le Salve Regina', async ({
    page,
  }) => {
    await commencer(page)
    await avancer(page, dizaine(2) - 2)
    await expect(titrePriere(page)).toHaveText('Gloire au Père')
    await toucher(page)
    await expect(titrePriere(page)).toHaveText('Ô mon Jésus')
    await expect(page.getByTestId('mystere')).toHaveText('Premier mystère L’Annonciation')
    await toucher(page)
    await expect(page.getByTestId('annonce')).toBeVisible()

    await avancer(page, dizaine(6) - dizaine(2))
    await expect(titrePriere(page)).toHaveText('Salve Regina')
    await expect(page.getByTestId('mystere')).toHaveCount(0)
    await toucher(page)
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  })

  test('sans « Ô mon Jésus », le Gloire au Père mène à la dizaine suivante', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { oMonJesus: false } })
    await avancer(page, dizaine(2) - 2)
    await expect(titrePriere(page)).toHaveText('Gloire au Père')
    await toucher(page)
    await expect(page.getByTestId('annonce')).toBeVisible()
  })

  test('sans Salve Regina, le dernier « Ô mon Jésus » mène à la fin', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { salveRegina: false } })
    await avancer(page, dizaine(6) - 1)
    await expect(titrePriere(page)).toHaveText('Ô mon Jésus')
    await toucher(page)
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  })

  test('sans annonce, ni écran d’annonce ni fruit : le titre du mystère reste', async ({
    page,
  }) => {
    await commencer(page, '/chapelet', { reglages: { annonce: false } })
    await avancer(page, 7)
    await expect(page.getByTestId('annonce')).toHaveCount(0)
    await expect(titrePriere(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('mystere')).toHaveText('Premier mystère L’Annonciation')
    await expect(page.getByText(/Fruit/)).toHaveCount(0)
  })

  test('sans annonce, en compact, ni fruit ni « Afficher la Lecture »', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { annonce: false, affichage: 'compact' } })
    await avancer(page, 7)
    await expect(titrePriere(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('mystere')).toHaveText('Premier mystère L’Annonciation')
    await expect(page.getByText(/Fruit/)).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Voir la prière' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Afficher la Lecture' })).toHaveCount(0)
  })

  test('sans annonce ni « Ô mon Jésus », le Salve Regina vient au bon rang', async ({ page }) => {
    // Ouverture 7, puis par dizaine : annonce ?, Notre Père, 10 Ave, Gloire, Ô mon Jésus ?
    const attendu = ({ annonce = true, oMonJesus = true, salveRegina = true }: Reglages) =>
      7 + 5 * (12 + Number(annonce) + Number(oMonJesus)) + Number(salveRegina)
    const combinaison: Reglages = { annonce: false, oMonJesus: false, salveRegina: true }
    await commencer(page, '/chapelet', { reglages: combinaison })
    await avancer(page, attendu(combinaison) - 1)
    await expect(titrePriere(page)).toHaveText('Salve Regina')
    await toucher(page)
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  })
})

test.describe('prier à plusieurs', () => {
  test('V/ et R/ marquent la part de chacun du Je vous salue Marie', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { plusieurs: true } })
    await avancer(page, 3)
    await expect(titrePriere(page)).toHaveText('Je vous salue Marie')
    const strophes = page.getByTestId('strophe')
    await expect(strophes.getByRole('img', { name: 'V/' })).toHaveCount(1)
    await expect(strophes.getByRole('img', { name: 'R/' })).toHaveCount(1)
    await expect(strophes.filter({ has: page.getByTestId('marque-R') })).toContainText(
      'Sainte Marie, Mère de Dieu',
    )
  })

  test('seul, aucune marque, sauf le verset du Salve Regina', async ({ page }) => {
    await commencer(page)
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
    await toucher(page)
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
    await expect(page.getByTestId('mystere')).toHaveText('Troisième mystère La Nativité')
  }

  test('rouverte le jour même, l’app revient au même grain', async ({ page, context }) => {
    await commencer(page)
    await avancer(page, AVE_3_4)
    await verifierAve34(page)
    const grain = await page.getByTestId('chapelet-dessine').getAttribute('data-grain-courant')
    await page.close()

    // L'app relancée par Android repart de l'accueil.
    const relance = await context.newPage()
    await relance.clock.setFixedTime(new Date(2026, 9, 5, 22, 30))
    await relance.goto('/')
    await verifierAve34(relance)
    await expect(relance.getByTestId('chapelet-dessine')).toHaveAttribute(
      'data-grain-courant',
      grain!,
    )

    // Le retour mène au seuil, qui propose de reprendre ou de recommencer.
    await relance.goBack()
    await relance.getByRole('button', { name: 'Reprendre à la 3e dizaine' }).click()
    await verifierAve34(relance)
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
    await lendemain.clock.setFixedTime(MARDI)
    await lendemain.goto('/')
    await expect(lendemain.getByRole('heading', { level: 1 })).toHaveText('Mystères douloureux')
    await expect(lendemain.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
    await lendemain.getByRole('link', { name: /Mystères joyeux/ }).click()
    await expect(lendemain.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  })

  test('un réglage changé en cours de route reprend à la même prière', async ({ page }) => {
    await commencer(page)
    await avancer(page, AVE_3_4)
    await page.goBack()
    await page.getByRole('link', { name: 'Tous les réglages' }).click()
    await reglage(page, 'Annonce des mystères').click()
    await page.getByRole('button', { name: /Retour au chapelet/ }).click()
    await page.getByRole('button', { name: 'Reprendre à la 3e dizaine' }).click()
    await verifierAve34(page)
  })

  test('un chapelet terminé ne se reprend pas', async ({ page }) => {
    await commencer(page, '/chapelet', { reglages: { salveRegina: false } })
    await avancer(page, dizaine(6))
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
    await page.goBack()
    await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  })
})
