import { expect, type Page } from '@playwright/test'
import { avancer, preparer, servirAelf, test, type Reglages } from './outils.ts'

// Phase 18, chapelet simplifié (décisions du porteur du projet, 2026-10-09) :
// la prière aux intentions du Saint-Père et l'intention du mois, « L’essentiel
// seulement », « Facultatif » sur les prières d'usage, le Chapelet et le
// Rosaire sur l'accueil et dans le menu.

// Mardi 6 octobre 2026 : les mystères douloureux, l'intention d'octobre.
const MARDI = (h = 10, m = 0) => new Date(2026, 9, 6, h, m)
const OCTOBRE = 'pour la pastorale de la santé mentale'

test.use({ viewport: { width: 360, height: 780 } })

const titre = (page: Page) => page.getByTestId('priere').getByRole('heading', { level: 2 })
const chapelet = (page: Page) => page.locator('main.chapelet')
const lienDuMois = (page: Page) => page.getByRole('link', { name: /^Ce mois-/ })
// « Ce mois-ci » ne se coupe pas à son trait d'union : un liant invisible le suit.
const CE_MOIS_CI = 'Ce mois-\u2060ci\u00a0:'

// Reprend le chapelet du jour sur une prière de la cinquième dizaine.
async function reprendreDizaine5(
  page: Page,
  priere: string,
  reglages: Reglages = {},
  jour = '2026-10-06',
) {
  await preparer(page, {
    reglages,
    enCours: { jour, forme: 'chapelet', serie: 'douloureux', dizaine: 5, priere, rang: 1 },
  })
  await page.goto('/chapelet/douloureux')
  await page.getByRole('button', { name: 'Reprendre à la 5e dizaine' }).click()
  await expect(chapelet(page)).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MARDI())
  await servirAelf(page)
})

test.describe('prière aux intentions du Saint-Père', () => {
  test('après la dernière dizaine : Notre Père, Je vous salue Marie, Gloire au Père, puis le Salve Regina', async ({
    page,
  }) => {
    await reprendreDizaine5(page, 'o-mon-jesus')
    await expect(titre(page)).toHaveText('Ô mon Jésus')
    await avancer(page, 1)
    await expect(titre(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('intention')).toHaveText('Aux intentions du Saint-Père.')
    // Dessous, en petit, l'intention du mois ; le chevron ne se lit pas.
    await expect(lienDuMois(page)).toHaveAccessibleName(`${CE_MOIS_CI} ${OCTOBRE}`)
    await expect(lienDuMois(page)).toHaveText(`${CE_MOIS_CI} ${OCTOBRE}\u00a0›`)
    const ligne = (await page.getByTestId('intention').boundingBox())!
    expect((await lienDuMois(page).boundingBox())!.y).toBeGreaterThanOrEqual(
      ligne.y + ligne.height - 1,
    )
    await avancer(page, 1)
    await expect(titre(page)).toHaveText('Je vous salue Marie')
    await expect(page.getByTestId('compteur')).toHaveCount(0)
    await expect(page.getByTestId('intention')).toHaveCount(0)
    await expect(lienDuMois(page)).toHaveCount(0)
    await avancer(page, 1)
    await expect(titre(page)).toHaveText('Gloire au Père')
    await avancer(page, 1)
    await expect(titre(page)).toHaveText('Salve Regina')
  })

  test('le lien ouvre la partie « Aux intentions du Saint-Père » sans avancer ; la croix ramène au grain exact', async ({
    page,
  }) => {
    await reprendreDizaine5(page, 'o-mon-jesus')
    await avancer(page, 1)
    const pas = await chapelet(page).getAttribute('data-pas')
    await lienDuMois(page).tap()
    await expect(page).toHaveURL('/chapelet-ou-rosaire#aux-intentions-du-saint-pere')
    const partie = page.getByRole('heading', { name: /^Aux intentions du Saint-\u2060?Père$/ })
    await expect(partie).toBeInViewport()
    await expect(
      page.getByText(/^Prier aux intentions du Saint-\u2060?Père, c’est s’unir/),
    ).toBeVisible()
    await expect(page.getByText(/Ailleurs, l’indulgence est partielle\.$/)).toBeVisible()
    const duMois = page.getByTestId('intention-du-mois')
    await expect(duMois).toHaveText(
      /^Ce mois-\u2060ci\s*:\s*Prions pour que la pastorale de la santé mentale se développe/,
    )
    await page.getByRole('button', { name: 'Fermer', exact: true }).click()
    await expect(chapelet(page)).toHaveAttribute('data-pas', pas!)
    await expect(titre(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('intention')).toHaveText('Aux intentions du Saint-Père.')
  })

  test('sans intention connue pour le mois, la petite ligne disparaît', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2028, 0, 4, 10, 0))
    await preparer(page, {
      enCours: {
        jour: '2028-01-04',
        forme: 'chapelet',
        serie: 'douloureux',
        dizaine: 5,
        priere: 'o-mon-jesus',
        rang: 1,
      },
    })
    await page.goto('/chapelet')
    await page.getByRole('button', { name: 'Reprendre à la 5e dizaine' }).click()
    await avancer(page, 1)
    await expect(titre(page)).toHaveText('Notre Père')
    await expect(page.getByTestId('intention')).toHaveText('Aux intentions du Saint-Père.')
    await expect(lienDuMois(page)).toHaveCount(0)
    // La page d'aide garde sa partie, sans intention du mois.
    await page.goto('/chapelet-ou-rosaire')
    await expect(
      page.getByRole('heading', { name: /^Aux intentions du Saint-\u2060?Père$/ }),
    ).toBeVisible()
    await expect(page.getByTestId('intention-du-mois')).toHaveCount(0)
  })

  test('se règle sous « Fin du chapelet », en premier ; coupée, le Salve Regina suit la dernière dizaine', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/reglages/chapelet/prieres')
    const fin = page.locator('h2', { hasText: 'Fin du chapelet' })
    await expect(fin).toBeVisible()
    const premier = page.locator('h2:has-text("Fin du chapelet") + .interrupteur [role="switch"]')
    await expect(premier).toHaveAccessibleName('Prière aux intentions du Saint-Père')
    await expect(premier).toHaveAttribute('aria-checked', 'true')
    await premier.click()
    await expect(premier).toHaveAttribute('aria-checked', 'false')

    await page.evaluate(() =>
      localStorage.setItem(
        'avec-dieu.en-cours',
        JSON.stringify({
          jour: '2026-10-06',
          forme: 'chapelet',
          serie: 'douloureux',
          dizaine: 5,
          priere: 'o-mon-jesus',
          rang: 1,
        }),
      ),
    )
    await page.goto('/chapelet/douloureux')
    await page.getByRole('button', { name: 'Reprendre à la 5e dizaine' }).click()
    await avancer(page, 1)
    await expect(titre(page)).toHaveText('Salve Regina')
  })

  test('ouverte du seuil du Rosaire, la page des prières dit « Fin du Rosaire »', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/rosaire')
    await page.getByRole('link', { name: 'Prières du Rosaire' }).click()
    await expect(page.locator('h2', { hasText: 'Fin du Rosaire' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'Fin du chapelet' })).toHaveCount(0)
  })
})

test.describe('« L’essentiel seulement »', () => {
  const essentiel = (page: Page) => page.getByRole('switch', { name: 'L’essentiel seulement' })
  // La durée sous le titre du seuil.
  const duree = (page: Page) => page.locator('.seuil-duree').getByTestId('duree')

  test('sur le seuil : son aide, les durées raccourcies, le signe de croix puis les dizaines', async ({
    page,
  }) => {
    await preparer(page, { reglages: { oMonJesus: false, sousLAbri: true } })
    await page.goto('/chapelet')
    await expect(essentiel(page)).toHaveAttribute('aria-checked', 'false')
    await expect(essentiel(page)).toHaveAccessibleDescription(
      'Le signe de croix, puis les cinq dizaines : l’annonce du mystère, un Notre Père, dix Je vous salue Marie, un Gloire au Père.',
    )
    await expect(duree(page)).toHaveText(/, vingt minutes$/)
    await essentiel(page).click()
    await expect(essentiel(page)).toHaveAttribute('aria-checked', 'true')
    await expect(duree(page)).toHaveText(/^~15 min, environ quinze minutes$/)
    // Le seuil du Rosaire raccourcit de même, et l'aide y compte ses vingt
    // dizaines ; Réglages › Chapelet, commun aux deux, ne dit pas le nombre.
    await page.goto('/rosaire')
    await expect(duree(page)).toHaveText(/^~1 h 15, environ une heure quinze$/)
    await expect(essentiel(page)).toHaveAccessibleDescription(
      /^Le signe de croix, puis les vingt dizaines\s:/,
    )
    await page.goto('/reglages/chapelet')
    await expect(essentiel(page)).toHaveAccessibleDescription(
      /^Le signe de croix, puis les dizaines\s:/,
    )
    await page.goto('/chapelet')

    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    await expect(titre(page)).toHaveText('Signe de croix')
    await expect(page.getByTestId('facultatif')).toHaveCount(0)
    await avancer(page, 1)
    await expect(page.getByRole('button', { name: 'Commencer la dizaine' })).toBeVisible()
    await expect(page.getByTestId('annonce')).toContainText('Premier mystère')
  })

  test('la dernière dizaine achevée, le chapelet est fini', async ({ page }) => {
    await reprendreDizaine5(page, 'gloire-au-pere', { essentiel: true })
    await expect(titre(page)).toHaveText('Gloire au Père')
    await avancer(page, 1)
    await expect(page.getByTestId('fin-chapelet')).toBeVisible()
  })

  test('les réglages fins restent intacts ; leur page le dit en tête', async ({ page }) => {
    await preparer(page, { reglages: { essentiel: true, intentions: false, saintPere: false } })
    await page.goto('/reglages/chapelet/prieres')
    const avis = page.getByText('L’essentiel seulement est activé.')
    await expect(avis).toBeVisible()
    const premier = page.locator('main h2').first()
    expect((await avis.boundingBox())!.y).toBeLessThan((await premier.boundingBox())!.y)
    const reglage = (nom: string) => page.getByRole('switch', { name: nom })
    await expect(reglage('Intentions des trois premiers Je vous salue Marie')).toHaveAttribute(
      'aria-checked',
      'false',
    )
    await expect(reglage('Prière aux intentions du Saint-Père')).toHaveAttribute(
      'aria-checked',
      'false',
    )
    await expect(reglage('Salve Regina')).toHaveAttribute('aria-checked', 'true')

    // Désactivé dans Réglages › Chapelet : l'avis disparaît, rien d'autre ne change.
    await page.goto('/reglages/chapelet')
    await expect(essentiel(page)).toHaveAttribute('aria-checked', 'true')
    await essentiel(page).click()
    await page.goto('/reglages/chapelet/prieres')
    await expect(avis).toHaveCount(0)
    await expect(reglage('Prière aux intentions du Saint-Père')).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  test('l’accueil et le menu donnent les durées raccourcies', async ({ page }) => {
    await preparer(page, { reglages: { essentiel: true } })
    await page.goto('/')
    const lignes = page.getByRole('list', { name: 'Chapelet et Rosaire' }).getByRole('link')
    await expect(lignes.nth(0)).toHaveAccessibleName(/^Chapelet.*, environ quinze minutes$/)
    await expect(lignes.nth(1)).toHaveAccessibleName(/^Rosaire.*, environ une heure quinze$/)
    await page.goto('/menu')
    const menu = page.getByRole('list', { name: 'Chapelet et prières' }).getByRole('link')
    await expect(menu.nth(0)).toHaveAccessibleName(/^Chapelet.*, environ quinze minutes$/)
    await expect(menu.nth(1)).toHaveAccessibleName(/^Rosaire.*, environ une heure quinze$/)
  })
})

// « Facultatif » sous le compteur, aligné strictement dessous et jamais plus
// large que lui ; sans compteur, à sa place. Il ne fait passer aucun titre à
// la ligne ni n'allonge l'écran.
async function verifierFacultatif(page: Page, facultatif: boolean) {
  const marque = page.getByTestId('facultatif')
  if (!facultatif) {
    await expect(marque).toHaveCount(0)
    return
  }
  await expect(marque).toHaveText('facultatif')
  await expect(marque).toBeVisible()
  const compteur = page.getByTestId('compteur')
  const m = (await marque.boundingBox())!
  const h2 = titre(page)
  if ((await compteur.count()) > 0) {
    const c = (await compteur.boundingBox())!
    expect(m.width).toBeLessThanOrEqual(c.width + 0.5)
    expect(Math.abs(m.x + m.width - (c.x + c.width))).toBeLessThanOrEqual(0.5)
    expect(Math.abs(m.x - c.x)).toBeLessThanOrEqual(1)
    expect(m.y).toBeGreaterThanOrEqual(c.y + c.height - 1)
  } else {
    // À la place du compteur : à droite du titre, sur sa ligne.
    const t = (await h2.boundingBox())!
    expect(m.x).toBeGreaterThanOrEqual(t.x + t.width)
  }
  // Sans la marque, ni le titre ni la page ne changent de hauteur.
  const mesurer = () =>
    page.evaluate(() => ({
      titre: document.querySelector('[data-testid="priere"] h2')!.getBoundingClientRect().height,
      page: document.documentElement.scrollHeight,
      tete: document.querySelector('.priere-tete')!.getBoundingClientRect().height,
    }))
  const avec = await mesurer()
  await marque.evaluate((e) => ((e as HTMLElement).style.display = 'none'))
  expect(await mesurer()).toEqual(avec)
  await marque.evaluate((e) => ((e as HTMLElement).style.display = ''))
}

test.describe('« Facultatif »', () => {
  test('sur toute l’ouverture sauf le signe de croix, sur le « Ô mon Jésus », jamais sur la dizaine', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/chapelet')
    await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
    const attendus: [string, boolean][] = [
      ['Signe de croix', false],
      ['Je crois en Dieu', true],
      ['Notre Père', true],
      ['Je vous salue Marie', true],
      ['Je vous salue Marie', true],
      ['Je vous salue Marie', true],
      ['Gloire au Père', true],
    ]
    for (const [i, [nom, facultatif]] of attendus.entries()) {
      if (i > 0) await avancer(page, 1)
      await expect(titre(page)).toHaveText(nom)
      await verifierFacultatif(page, facultatif)
    }
    // L'annonce, puis la dizaine : rien n'y est facultatif, sauf le « Ô mon Jésus ».
    await avancer(page, 1)
    await expect(page.getByTestId('facultatif')).toHaveCount(0)
    await avancer(page, 1)
    await expect(titre(page)).toHaveText('Notre Père')
    await verifierFacultatif(page, false)
    await avancer(page, 1)
    await expect(page.getByTestId('compteur')).toHaveText('1 / 10')
    await verifierFacultatif(page, false)
    await avancer(page, 10)
    await expect(titre(page)).toHaveText('Gloire au Père')
    await verifierFacultatif(page, false)
    await avancer(page, 1)
    await expect(titre(page)).toHaveText('Ô mon Jésus')
    await verifierFacultatif(page, true)
  })

  test('sur toute la fin, en octobre, Sous l’abri compris', async ({ page }) => {
    await reprendreDizaine5(page, 'o-mon-jesus', { sousLAbri: true })
    const fin = [
      'Notre Père',
      'Je vous salue Marie',
      'Gloire au Père',
      'Salve Regina',
      'Litanies de la Sainte Vierge',
      'Oraison du Rosaire',
      'Sous l’abri de votre miséricorde',
      'Prière à saint Joseph',
    ]
    for (const nom of fin) {
      await avancer(page, 1)
      await expect(titre(page)).toHaveText(nom)
      await verifierFacultatif(page, true)
    }
  })

  test('le lecteur d’écran entend « facultatif »', async ({ page }) => {
    await reprendreDizaine5(page, 'o-mon-jesus')
    const tete = page.getByTestId('priere').locator('.priere-tete')
    await expect(tete).toContainText('facultatif')
    await expect(page.getByTestId('facultatif')).not.toHaveAttribute('aria-hidden', 'true')
  })
})

test.describe('accueil et menu', () => {
  const lignes = (page: Page) =>
    page.getByRole('list', { name: 'Chapelet et Rosaire' }).getByRole('link')

  test('l’accueil : le Chapelet et le Rosaire en tête de liste, au-dessus de l’office des lectures', async ({
    page,
  }) => {
    await page.clock.setFixedTime(MARDI(18, 10))
    await preparer(page)
    await page.goto('/')
    await expect(lignes(page)).toHaveCount(2)
    // « ~20 h » à l'œil, « vers 20 h » au lecteur d'écran.
    await expect(lignes(page).nth(0)).toHaveText(/^Chapelet~vers 20 h20 min/)
    await expect(lignes(page).nth(0)).toHaveAccessibleName(
      /^Chapelet\s*vers 20 h\s*, vingt minutes$/,
    )
    await expect(lignes(page).nth(1)).toHaveText(/^Rosaire~1 h 45/)
    await expect(lignes(page).nth(1)).toHaveAccessibleName(
      /^Rosaire\s*, environ une heure quarante-cinq$/,
    )
    const lectures = page.getByRole('link', { name: /^Office des lectures/ })
    expect((await lignes(page).nth(1).boundingBox())!.y).toBeLessThan(
      (await lectures.boundingBox())!.y,
    )
    // Plus de ligne du chapelet sous les complies.
    await expect(page.getByRole('list', { name: 'Chapelet', exact: true })).toHaveCount(0)
    for (const ligne of await lignes(page).all())
      expect((await ligne.boundingBox())!.height).toBe(48)
  })

  // Chaque ligne ouvre son seuil, sans rien retenir : le Rosaire ouvert, la
  // ligne du Chapelet ouvre toujours le chapelet (révisé le 2026-10-09).
  test('chaque ligne ouvre son seuil', async ({ page }) => {
    await preparer(page)
    await page.goto('/')
    await lignes(page).nth(1).click()
    await expect(page).toHaveURL('/rosaire')
    await expect(page.getByRole('button', { name: 'Commencer le Rosaire' })).toBeVisible()
    await page.goBack()
    await lignes(page).nth(0).click()
    await expect(page).toHaveURL('/chapelet')
    await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
  })

  test('« Prière du moment » ne concerne que le Chapelet', async ({ page }) => {
    await page.clock.setFixedTime(MARDI(20, 5))
    await preparer(page)
    await page.goto('/')
    await expect(page.getByTestId('moment')).toHaveCount(1)
    await expect(page.getByTestId('moment')).toHaveAccessibleName(/^Chapelet/)
    await expect(lignes(page).nth(0).locator('..')).toHaveAttribute('data-etat', 'moment')
    await expect(lignes(page).nth(1)).not.toContainText('Prière du moment')
  })

  test('le menu montre aussi le Chapelet et le Rosaire, qui ouvrent leur seuil', async ({
    page,
  }) => {
    await preparer(page)
    await page.goto('/')
    await page.getByRole('link', { name: 'Menu' }).click()
    const groupe = page.getByRole('list', { name: 'Chapelet et prières' }).getByRole('link')
    await expect(groupe).toHaveText([/^Chapelet/, /^Rosaire/, 'Je vous salue Marie', 'Notre Père'])
    await expect(groupe.nth(0)).toHaveAccessibleName(/^Chapelet\s*vers 20 h\s*, vingt minutes$/)
    await expect(groupe.nth(1)).toHaveAccessibleName(
      /^Rosaire\s*, environ une heure quarante-cinq$/,
    )
    await groupe.nth(0).click()
    await expect(page).toHaveURL('/chapelet')
    await expect(page.getByRole('button', { name: 'Commencer le chapelet' })).toBeVisible()
    await page.goBack()
    await page.getByRole('link', { name: 'Menu' }).click()
    await groupe.nth(1).click()
    await expect(page).toHaveURL('/rosaire')
  })
})
