import { test as base, expect, type Page } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'

// Gestes et ouvertures partagés par les parcours.

// Le `test` de tous les parcours : sans réseau par défaut, l'app ne joint
// jamais la vraie AELF (la réserve des jours à venir la solliciterait à chaque
// ouverture). Posée avant toute autre, cette route ne sert qu'en dernier
// recours : `servirAelf` et les routes d'un parcours passent devant.
export const test = base.extend<{ sansReseau: void }>({
  sansReseau: [
    async ({ page }, use) => {
      await page.route('https://api.aelf.org/**', (route) => route.abort('internetdisconnected'))
      await use()
    },
    { auto: true },
  ],
})

// Un toucher n'importe où : ici, au tiers bas de l'écran.
export async function toucher(page: Page) {
  const { width, height } = page.viewportSize()!
  await page.touchscreen.tap(width / 2, (height * 2) / 3)
}

// Glissement au doigt, de vrais événements tactiles, horizontal (dx) ou vertical (dy).
export async function glisser(page: Page, dx: number, y = page.viewportSize()!.height / 2, dy = 0) {
  const { width } = page.viewportSize()!
  await glisserDepuis(page, width / 2 - dx / 2, y - dy / 2, dx, dy)
}

// Le même glissement, parti d'un point précis de l'écran.
export async function glisserDepuis(page: Page, x0: number, y0: number, dx: number, dy = 0) {
  const cdp = await page.context().newCDPSession(page)
  const point = (i: number) => [{ x: x0 + (dx * i) / 8, y: y0 + (dy * i) / 8 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(0) })
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(i) })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

export interface Reglages {
  annonce?: boolean
  oMonJesus?: boolean
  salveRegina?: boolean
  plusieurs?: boolean
  affichage?: 'complet' | 'compact'
  vibrations?: boolean
  accents?: boolean
  prieresEntieres?: boolean
  signalerAjouts?: boolean
}

// Les parcours ne dépendent pas du réseau : l'AELF est remplacée par ses
// réponses enregistrées (src/aelf/exemples/), et un office absent répond 404
// comme l'AELF. Rend la liste des adresses demandées.
export async function servirAelf(page: Page) {
  const demandes: string[] = []
  await page.route('https://api.aelf.org/**', (route) => {
    const url = route.request().url()
    demandes.push(url)
    const [office, date] = new URL(url).pathname.split('/').slice(2, 4)
    const fichier = `src/aelf/exemples/${office}-${date}.json`
    if (!existsSync(fichier)) return route.fulfill({ status: 404, body: 'introuvable' })
    return route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: readFileSync(fichier, 'utf8'),
    })
  })
  return demandes
}

// Les réglages s'ouvrent rubriques fermées (phase 10) : on déplie celles dont
// le parcours a besoin, toutes par défaut.
export async function deplierReglages(
  page: Page,
  ...rubriques: ('Affichage' | 'Chapelet' | 'Offices' | 'Rappels')[]
) {
  const toutes = ['Affichage', 'Chapelet', 'Offices', 'Rappels']
  for (const nom of rubriques.length > 0 ? rubriques : toutes) {
    const bouton = page.getByRole('button', { name: nom, exact: true })
    if ((await bouton.getAttribute('aria-expanded')) === 'false') await bouton.click()
    await expect(bouton).toHaveAttribute('aria-expanded', 'true')
  }
}

interface Ouverture {
  // L'aide aux gestes s'affiche-t-elle ? Masquée par défaut dans les parcours.
  aide?: boolean
  affichage?: 'complet' | 'compact'
  reglages?: Reglages
  lectures?: Record<string, number>
  // Les prières dont le rappel est déjà activé.
  rappels?: string[]
}

// Prépare la mémoire du téléphone avant le premier chargement de la page.
export async function preparer(
  page: Page,
  { aide = false, affichage, reglages = {}, lectures, rappels }: Ouverture = {},
) {
  const tous = affichage ? { ...reglages, affichage } : reglages
  await page.addInitScript(
    ({ aide, tous, lectures, rappels }) => {
      // Seulement au premier chargement : un rechargement garde ce que l'app a retenu.
      if (sessionStorage.getItem('parcours-prepare')) return
      sessionStorage.setItem('parcours-prepare', 'oui')
      if (!aide) localStorage.setItem('avec-dieu.aide-gestes', 'masquee')
      if (Object.keys(tous).length > 0)
        localStorage.setItem('avec-dieu.reglages', JSON.stringify(tous))
      if (lectures) localStorage.setItem('avec-dieu.lectures', JSON.stringify(lectures))
      if (rappels)
        localStorage.setItem(
          'avec-dieu.rappels',
          JSON.stringify(Object.fromEntries(rappels.map((priere) => [priere, { actif: true }]))),
        )
    },
    { aide, tous, lectures, rappels },
  )
}

// Ouvre le seuil puis commence le chapelet.
export async function commencer(page: Page, chemin = '/chapelet', ouverture: Ouverture = {}) {
  await preparer(page, ouverture)
  await page.goto(chemin)
  await page.getByRole('button', { name: 'Commencer le chapelet' }).click()
  await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
    'Signe de croix',
  )
}

// Avance de plusieurs étapes, en attendant chacune : un toucher donné avant que
// l'annonce soit affichée tomberait à côté de sa grosse perle.
export async function avancer(page: Page, fois: number) {
  const chapelet = page.locator('main.chapelet')
  for (let i = 0; i < fois; i++) {
    const pas = Number(await chapelet.getAttribute('data-pas'))
    await suivant(page)
    await expect(chapelet).toHaveAttribute('data-pas', String(pas + 1))
  }
}

// Étape suivante : un toucher, ou la grosse perle sur l'annonce d'un mystère.
export async function suivant(page: Page) {
  const perle = page.getByRole('button', { name: 'Commencer la dizaine' })
  if (await perle.isVisible()) await perle.click()
  else await toucher(page)
}

// Le navigateur de test ne vibre pas et n'a pas d'écran à garder allumé : on
// remplace navigator.vibrate et navigator.wakeLock par des espions, que les
// greffons Capacitor appellent hors de l'APK.
declare global {
  interface Window {
    __journal: string[]
  }
}

export async function espionner(page: Page) {
  await page.addInitScript(() => {
    window.__journal = []
    const journal = window.__journal
    Object.defineProperty(navigator, 'vibrate', {
      value: (motif: number[]) => {
        journal.push(`vibre ${[motif].flat().join(',')}`)
        return true
      },
    })
    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: async () => {
          journal.push('écran allumé')
          return {
            release: async () => {
              journal.push('écran libre')
            },
          }
        },
      },
    })
  })
}

export const journal = (page: Page) => page.evaluate(() => window.__journal)

// Hors de l'APK, le téléphone est simulé (src/telephone/simulation.ts) : son
// état d'origine se règle avant l'ouverture, ce que l'app lui a demandé se lit
// ensuite.
interface TelephoneSimule {
  accord?: 'granted' | 'denied' | 'prompt'
  reponse?: 'granted' | 'denied'
  exacte?: boolean
  reponseExacte?: boolean
  fabricant?: 'xiaomi' | 'samsung' | 'autre'
  blocages?: { batterie: boolean; arrierePlan: boolean; demarrage?: boolean }
  affichees?: { id: number; route: string }[]
}

export async function simulerTelephone(page: Page, etat: TelephoneSimule) {
  await page.addInitScript((etat) => {
    ;(window as unknown as { __telephoneInitial: unknown }).__telephoneInitial = etat
  }, etat)
}

export interface NotificationSimulee {
  id: number
  titre: string
  texte: string
  quand: string
  route: string
  canal: string
  exacte: boolean
}

export const telephone = (page: Page) =>
  page.evaluate(() => {
    const t = (window as unknown as { __telephone?: Record<string, unknown> }).__telephone
    return {
      programmees: (t?.programmees ?? []) as NotificationSimulee[],
      affichees: (t?.affichees ?? []) as { id: number; route: string }[],
      canaux: (t?.canaux ?? []) as string[],
      journal: (t?.journal ?? []) as string[],
    }
  })

// Un toucher sur une notification affichée, qui ouvre cette route.
export const toucherNotification = (page: Page, route: string) =>
  page.evaluate((route) => {
    const t = (window as unknown as { __telephone: { toucher: (r: string) => void } }).__telephone
    t.toucher(route)
  }, route)

// Deux doigts posés à `debut` px l'un de l'autre, écartés (ou rapprochés)
// jusqu'à `fin`. Le premier ne bouge pas : sans précaution, son relâchement
// passerait pour un toucher.
export async function pincer(page: Page, debut: number, fin: number) {
  const cdp = await page.context().newCDPSession(page)
  const { width, height } = page.viewportSize()!
  const y = height / 2
  const x = width / 2 - 100
  const doigts = (ecart: number) => [
    { x, y, id: 0 },
    { x: x + ecart, y, id: 1 },
  ]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: doigts(debut) })
  for (let i = 1; i <= 10; i++) {
    const points = doigts(debut + ((fin - debut) * i) / 10)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

// Dans un office : descendre jusqu'à `position`, puis remonter d'un doigt pour
// faire revenir le bandeau, qui s'efface pendant la lecture. Sur une machine
// chargée, un mouvement peut se perdre entre deux images : on le refait, comme
// un doigt qui recommence (le seuil exact est vérifié par e2e/reperage.spec.ts).
export async function faireRevenirBandeau(page: Page, position = 1500) {
  const image = () =>
    page.evaluate(
      () =>
        new Promise((fin) =>
          requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(fin))),
        ),
    )
  // Des polices qui arrivent font bouger la page : ce défilement-là cacherait le bandeau.
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await expect(async () => {
    await page.evaluate((y) => window.scrollTo(0, y + 40), position)
    await image()
    await page.evaluate(() => window.scrollBy(0, -40))
    await image()
    await expect(page.getByTestId('bandeau-office')).toBeVisible({ timeout: 1000 })
  }).toPass()
}
