import { expect, type Page } from '@playwright/test'
import {
  deplierReglages,
  preparer,
  servirAelf,
  simulerTelephone,
  telephone,
  test,
  toucherNotification,
} from './outils.ts'

// Phase 11 : les rappels à heure fixe. Hors de l'APK, Android est simulé :
// on règle ce qu'il accorde, puis on lit les notifications que l'app lui a
// confiées (src/telephone/simulation.ts).

// Mercredi 7 octobre 2026, 10 h : les laudes du jour sont passées.
const MAINTENANT = new Date(2026, 9, 7, 10, 0)

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MAINTENANT)
  await preparer(page)
})

async function ouvrirRappels(page: Page) {
  await page.goto('/reglages')
  await deplierReglages(page, 'Rappels')
}

const interrupteur = (page: Page, nom: string) =>
  page.getByRole('switch', { name: `${nom}, rappel` })
const programmees = async (page: Page) => (await telephone(page)).programmees
const dialogue = (page: Page, titre: string) => page.getByRole('dialog', { name: titre })

test('par défaut : aucun rappel, les heures du PRD, l’office des lectures sans heure', async ({
  page,
}) => {
  await simulerTelephone(page, { accord: 'granted' })
  await page.goto('/reglages')
  await expect(page.getByRole('button', { name: /^Rappels/ })).toContainText('Aucun rappel')
  await deplierReglages(page, 'Rappels')
  const lignes = page.locator('.rappel')
  await expect(lignes.locator('.rappel-priere')).toHaveText([
    'Office des lectures',
    'Laudes',
    'Tierce',
    'Sexte',
    'None',
    'Vêpres',
    'Complies',
    'Chapelet',
  ])
  await expect(lignes.locator('.rappel-heure span')).toHaveText([
    '—',
    '7 h 00',
    '9 h 00',
    '12 h 00',
    '15 h 00',
    '18 h 30',
    '21 h 30',
    '20 h 00',
  ])
  for (const bascule of await page.getByRole('switch', { name: /, rappel$/ }).all())
    await expect(bascule).toHaveAttribute('aria-checked', 'false')
  expect(await programmees(page)).toEqual([])
})

test('activer les laudes : l’accord, la minute près, puis un mois de rappels', async ({ page }) => {
  await simulerTelephone(page, { accord: 'prompt', reponse: 'granted', exacte: false })
  await ouvrirRappels(page)
  await interrupteur(page, 'Laudes').click()

  const accord = dialogue(page, 'Recevoir les rappels')
  await expect(accord).toContainText(
    'Pour vous prévenir à l’heure de la prière, l’app a besoin de votre accord. Android va vous le demander.',
  )
  await accord.getByRole('button', { name: 'Continuer' }).click()

  const minute = dialogue(page, 'A la minute près')
  await expect(minute).toContainText(
    'Pour que le rappel arrive à l’heure exacte, autorisez « Alarmes et rappels » dans la page qui va s’ouvrir.',
  )
  await minute.getByRole('button', { name: 'Ouvrir la page' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await expect.poll(async () => (await programmees(page)).length).toBe(30)
  const [premiere] = await programmees(page)
  expect(premiere).toMatchObject({
    titre: 'C’est l’heure des laudes',
    texte: 'Seigneur, ouvre mes lèvres.',
    route: '/office/laudes/2026-10-08',
    canal: 'rappel-cloche_marcel-vibreur',
    exacte: true,
  })
  expect(new Date(premiere.quand)).toEqual(new Date(2026, 9, 8, 7, 0))
  expect((await telephone(page)).journal).toEqual([
    'demande d’accord',
    'page « Alarmes et rappels »',
  ])
  await expect(page.getByRole('button', { name: /^Rappels/ })).toContainText('Laudes')
  await expect(page.locator('.rappel').nth(1)).toContainText('Cloche Marcel · vibreur')
})

test('l’office des lectures, activé, propose 6 h 30 et ouvre la journée avant les laudes', async ({
  page,
}) => {
  await simulerTelephone(page, { accord: 'granted' })
  await ouvrirRappels(page)
  await interrupteur(page, 'Laudes').click()
  await interrupteur(page, 'Office des lectures').click()
  await expect(interrupteur(page, 'Office des lectures')).toHaveAttribute('aria-checked', 'true')
  await expect(page.locator('.rappel').first().locator('.rappel-heure span')).toHaveText('6 h 30')
  await expect
    .poll(async () => (await programmees(page)).slice(0, 2).map((n) => [n.route, n.texte]))
    .toEqual([
      ['/office/lectures/2026-10-08', 'Seigneur, ouvre mes lèvres.'],
      ['/office/laudes/2026-10-08', 'Dieu, viens à mon aide.'],
    ])
})

test('une heure changée se reprogramme et déplace l’office sur l’accueil', async ({ page }) => {
  await simulerTelephone(page, { accord: 'granted' })
  await ouvrirRappels(page)
  await interrupteur(page, 'Vêpres').click()
  await page.getByLabel('Vêpres, heure').fill('19:15')
  await expect(page.locator('.rappel').nth(5).locator('.rappel-heure span')).toHaveText('19 h 15')
  await expect
    .poll(async () => new Date((await programmees(page))[0].quand))
    .toEqual(new Date(2026, 9, 7, 19, 15))
  // Rappel coupé, l'heure reste celle de l'office (une seule heure partout).
  await page.getByLabel('Laudes, heure').fill('06:30')
  await page.goto('/')
  const offices = page.getByRole('list', { name: 'Offices du jour' })
  await expect(offices.getByRole('link', { name: /Laudes/ })).toContainText('6 h 30')
  await expect(offices.getByRole('link', { name: /Vêpres/ })).toContainText('19 h 15')
})

test('les rappels sont refaits à l’ouverture de l’app', async ({ page }) => {
  await simulerTelephone(page, { accord: 'granted' })
  await page.addInitScript(() =>
    localStorage.setItem('avec-dieu.rappels', JSON.stringify({ complies: { actif: true } })),
  )
  await page.goto('/')
  await expect.poll(async () => (await programmees(page)).length).toBe(31)
  expect((await programmees(page))[0]).toMatchObject({
    titre: 'C’est l’heure des complies',
    texte: 'Dieu, viens à mon aide.',
    canal: 'rappel-bourdon_notre_dame-vibreur',
  })
})

test('toucher une notification ouvre sa prière', async ({ page }) => {
  await servirAelf(page)
  await simulerTelephone(page, { accord: 'granted' })
  await page.goto('/')
  await expect(page.getByRole('list', { name: 'Offices du jour' })).toBeVisible()
  await toucherNotification(page, '/office/vepres/2026-10-06')
  await expect(page).toHaveURL('/office/vepres/2026-10-06')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vêpres')
  await toucherNotification(page, '/chapelet')
  await expect(page).toHaveURL('/chapelet')
})

test('ouvrir l’office retire sa notification encore affichée', async ({ page }) => {
  await servirAelf(page)
  await simulerTelephone(page, {
    accord: 'granted',
    affichees: [
      { id: 1, route: '/office/laudes/2026-10-06' },
      { id: 2, route: '/chapelet' },
    ],
  })
  await page.goto('/office/laudes/2026-10-06')
  await expect(page.getByTestId('office')).toBeVisible()
  await expect
    .poll(async () => (await telephone(page)).affichees)
    .toEqual([{ id: 2, route: '/chapelet' }])
})

test('notifications refusées : un avis le dit, et rien n’est programmé', async ({ page }) => {
  await simulerTelephone(page, { accord: 'prompt', reponse: 'denied' })
  await ouvrirRappels(page)
  await interrupteur(page, 'Vêpres').click()
  await dialogue(page, 'Recevoir les rappels').getByRole('button', { name: 'Continuer' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const avis = page.locator('.rappels-avis')
  await expect(avis).toHaveText(
    /⚠ Android bloque les notifications de l’app : aucun rappel ne s’affichera\./,
  )
  await avis.getByRole('button', { name: 'Ouvrir les Paramètres du téléphone' }).click()
  await expect
    .poll(async () => (await telephone(page)).journal)
    .toContain('réglages des notifications')
  expect(await programmees(page)).toEqual([])
})

test('« Alarmes et rappels » refusée : un avis, et des rappels sans exactitude', async ({
  page,
}) => {
  await simulerTelephone(page, { accord: 'granted', exacte: false, reponseExacte: false })
  await ouvrirRappels(page)
  await interrupteur(page, 'Complies').click()
  await dialogue(page, 'A la minute près').getByRole('button', { name: 'Plus tard' }).click()
  const avis = page.locator('.rappels-avis')
  await expect(avis).toHaveText(
    /⚠ Sans l’autorisation « Alarmes et rappels », les rappels peuvent arriver en retard\./,
  )
  await expect.poll(async () => (await programmees(page)).length).toBe(31)
  expect((await programmees(page)).every((n) => !n.exacte)).toBe(true)
  await avis.getByRole('button', { name: 'Autoriser' }).click()
  await expect
    .poll(async () => (await telephone(page)).journal)
    .toContain('page « Alarmes et rappels »')
  // « A la minute près » ne revient pas au rappel suivant.
  await interrupteur(page, 'Vêpres').click()
  await expect(interrupteur(page, 'Vêpres')).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('guide de batterie puis démarrage automatique sur un Xiaomi, puis les avis', async ({
  page,
}) => {
  await simulerTelephone(page, {
    accord: 'granted',
    fabricant: 'xiaomi',
    blocages: { batterie: true, arrierePlan: false, demarrage: true },
  })
  await ouvrirRappels(page)
  await interrupteur(page, 'Laudes').click()
  const guide = dialogue(page, 'Sur un Xiaomi')
  await expect(guide).toContainText(
    'L’économiseur de batterie peut bloquer les rappels. Dans la page qui va s’ouvrir :',
  )
  await expect(guide).toContainText('Economiseur de batterie : Aucune restriction')
  await expect(guide).not.toContainText('Démarrage automatique')
  await guide.getByRole('button', { name: 'Ouvrir la page' }).click()
  expect((await telephone(page)).journal).toContain('fiche de l’app')

  const demarrage = dialogue(page, 'Démarrage automatique')
  await expect(demarrage).toContainText(
    'Si l’app est fermée, Xiaomi l’empêche de se réveiller pour vous prévenir. Dans la page qui va s’ouvrir, activez Avec Dieu.',
  )
  await demarrage.getByRole('button', { name: 'Ouvrir la page' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect((await telephone(page)).journal).toContain('démarrage automatique')

  // Une seule fois d'elles-mêmes ; ensuite, les avis tant que ça bloque.
  await interrupteur(page, 'Vêpres').click()
  await expect(interrupteur(page, 'Vêpres')).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const avis = page.locator('.rappels-avis')
  await expect(avis).toHaveText([
    /⚠ Le démarrage automatique est désactivé : si l’app est fermée, le téléphone ne la réveille pas et le rappel ne vient pas\./,
    /⚠ L’économiseur de batterie peut bloquer les rappels\./,
  ])
  await avis.nth(0).getByRole('button', { name: 'Ouvrir la page' }).click()
  await avis.nth(1).getByRole('button', { name: 'Régler la batterie' }).click()
  await expect
    .poll(async () => (await telephone(page)).journal.filter((j) => j === 'démarrage automatique'))
    .toHaveLength(2)
  // L'avis de batterie remplace le lien du guide.
  await expect(page.getByRole('button', { name: /Rappels bloqués/ })).toHaveCount(0)
})

test('Xiaomi bien réglé : ni guide ni avis, le lien reste', async ({ page }) => {
  await simulerTelephone(page, {
    accord: 'granted',
    fabricant: 'xiaomi',
    blocages: { batterie: false, arrierePlan: false, demarrage: false },
  })
  await ouvrirRappels(page)
  await interrupteur(page, 'Laudes').click()
  await expect.poll(async () => (await programmees(page)).length).toBe(30)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.rappels-avis')).toHaveCount(0)
  await page.getByRole('button', { name: 'Rappels bloqués ? Régler la batterie ›' }).click()
  await dialogue(page, 'Sur un Xiaomi').getByRole('button', { name: 'Plus tard' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('arrière-plan interdit, sur toute marque : un avis', async ({ page }) => {
  await simulerTelephone(page, {
    accord: 'granted',
    fabricant: 'autre',
    blocages: { batterie: true, arrierePlan: true },
  })
  await ouvrirRappels(page)
  await expect(page.locator('.rappels-avis')).toHaveCount(0)
  await interrupteur(page, 'Laudes').click()
  const avis = page.locator('.rappels-avis')
  // Hors Xiaomi et Samsung, la batterie ne bloque pas les rappels : pas d'avis.
  await expect(avis).toHaveText([
    /⚠ Android interdit à l’app de travailler en arrière-plan : aucun rappel ne viendra\./,
  ])
  await avis.getByRole('button', { name: 'Ouvrir les Paramètres du téléphone' }).click()
  await expect.poll(async () => (await telephone(page)).journal).toContain('fiche de l’app')
})

test('guide de batterie sur un Samsung', async ({ page }) => {
  await simulerTelephone(page, {
    accord: 'granted',
    fabricant: 'samsung',
    blocages: { batterie: true, arrierePlan: false },
  })
  await ouvrirRappels(page)
  await interrupteur(page, 'Laudes').click()
  const guide = dialogue(page, 'Sur un Samsung')
  await expect(guide).toContainText(
    'La mise en veille des applis peut bloquer les rappels. Dans la page qui va s’ouvrir :',
  )
  await expect(guide).toContainText('Batterie : Non restreinte')
})

test('ni guide ni lien de batterie sur une autre marque', async ({ page }) => {
  await simulerTelephone(page, { accord: 'granted', fabricant: 'autre' })
  await ouvrirRappels(page)
  await interrupteur(page, 'Laudes').click()
  await expect.poll(async () => (await programmees(page)).length).toBe(30)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Régler la batterie/ })).toHaveCount(0)
})

test('choisir le son : écouter une cloche, le son du téléphone, un MP3, le vibreur', async ({
  page,
}) => {
  await simulerTelephone(page, { accord: 'granted' })
  await ouvrirRappels(page)
  await interrupteur(page, 'Chapelet').click()
  const ligne = page.locator('.rappel').last()
  await expect(ligne).toContainText('Angélus de village · vibreur')
  await ligne.locator('.rappel-nom').click()
  const sons = page.getByRole('radiogroup', { name: 'Son, Chapelet' })
  await expect(sons.getByRole('radio', { name: 'Angélus de village' })).toBeChecked()

  await sons.getByRole('button', { name: 'Ecouter Bourdon de Notre-Dame' }).click()
  await expect
    .poll(async () => (await telephone(page)).journal)
    .toContain('écouter bourdon_notre_dame')

  await sons.getByRole('radio', { name: 'Son du téléphone' }).check()
  await expect(ligne.locator('.rappel-son')).toHaveText('Son du téléphone · vibreur')

  await sons.getByRole('radio', { name: 'Choisir un MP3…' }).click()
  await expect(sons.getByRole('radio', { name: 'Mon MP3.mp3' })).toBeChecked()
  await ligne.getByRole('switch', { name: 'Vibreur' }).click()
  await expect(ligne.locator('.rappel-son')).toHaveText('Mon MP3.mp3 · sans vibreur')
  await expect
    .poll(async () => (await programmees(page))[0]?.canal)
    .toMatch(/^rappel-mp3-[a-z0-9]+-sans-vibreur$/)
  expect((await telephone(page)).canaux).toEqual([(await programmees(page))[0].canal])
})

test('réinitialiser l’app annule les rappels confiés à Android', async ({ page }) => {
  await simulerTelephone(page, { accord: 'granted', exacte: true })
  await ouvrirRappels(page)
  await interrupteur(page, 'Laudes').click()
  await expect.poll(async () => (await programmees(page)).length).toBe(30)

  // Le téléphone simulé repart à zéro avec la page : on note ce qu'il garde
  // au moment où l'app le quitte pour revenir à l'accueil.
  await page.evaluate(() =>
    addEventListener('pagehide', () =>
      sessionStorage.setItem(
        'programmees-au-depart',
        String(
          (window as unknown as { __telephone?: { programmees: unknown[] } }).__telephone
            ?.programmees.length,
        ),
      ),
    ),
  )
  await page.getByRole('button', { name: 'Réinitialiser l’app' }).click()
  await dialogue(page, 'Réinitialiser l’app ?')
    .getByRole('button', { name: 'Réinitialiser', exact: true })
    .click()
  await expect(page.getByRole('link', { name: 'Menu' })).toBeVisible()
  expect(await page.evaluate(() => sessionStorage.getItem('programmees-au-depart'))).toBe('0')
})
