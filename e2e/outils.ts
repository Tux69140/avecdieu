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
  intentions?: boolean
  saintPere?: boolean
  salveRegina?: boolean
  litanies?: 'octobre' | 'toujours' | 'jamais'
  oraisonRosaire?: boolean
  sousLAbri?: boolean
  saintJoseph?: 'octobre' | 'toujours' | 'jamais'
  plusieurs?: boolean
  affichage?: 'complet' | 'compact'
  vibrations?: boolean
  accents?: boolean
  prieresEntieres?: boolean
  signalerAjouts?: boolean
  tailleTexte?: number
  theme?: 'jour' | 'nuit' | 'automatique'
  forme?: 'chapelet' | 'rosaire'
  essentiel?: boolean
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

interface Ouverture {
  // L'aide aux gestes du chapelet et l'aide à la lecture de l'office
  // s'affichent-elles ? Masquées par défaut dans les parcours.
  aide?: boolean
  affichage?: 'complet' | 'compact'
  reglages?: Reglages
  lectures?: Record<string, number>
  // Les prières dont le rappel est déjà activé.
  rappels?: string[]
  // Un Rosaire commencé (src/chapelet/reprise.ts), pour reprendre en chemin.
  rosaireEnCours?: Record<string, unknown>
  // Un chapelet commencé, de même.
  enCours?: Record<string, unknown>
}

// Prépare la mémoire du téléphone avant le premier chargement de la page.
export async function preparer(
  page: Page,
  {
    aide = false,
    affichage,
    reglages = {},
    lectures,
    rappels,
    rosaireEnCours,
    enCours,
  }: Ouverture = {},
) {
  const tous = affichage ? { ...reglages, affichage } : reglages
  await page.addInitScript(
    ({ aide, tous, lectures, rappels, rosaireEnCours, enCours }) => {
      // Seulement au premier chargement : un rechargement garde ce que l'app a retenu.
      if (sessionStorage.getItem('parcours-prepare')) return
      sessionStorage.setItem('parcours-prepare', 'oui')
      if (!aide) {
        localStorage.setItem('avec-dieu.aide-gestes', 'masquee')
        localStorage.setItem('avec-dieu.aide-office', 'masquee')
      }
      if (Object.keys(tous).length > 0)
        localStorage.setItem('avec-dieu.reglages', JSON.stringify(tous))
      if (lectures) localStorage.setItem('avec-dieu.lectures', JSON.stringify(lectures))
      if (rappels)
        localStorage.setItem(
          'avec-dieu.rappels',
          JSON.stringify(Object.fromEntries(rappels.map((priere) => [priere, { actif: true }]))),
        )
      if (rosaireEnCours)
        localStorage.setItem('avec-dieu.rosaire-en-cours', JSON.stringify(rosaireEnCours))
      if (enCours) localStorage.setItem('avec-dieu.en-cours', JSON.stringify(enCours))
    },
    { aide, tous, lectures, rappels, rosaireEnCours, enCours },
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

// Ouvre le seuil du Rosaire puis le commence.
export async function commencerRosaire(page: Page, ouverture: Ouverture = {}) {
  await preparer(page, ouverture)
  await page.goto('/rosaire')
  await page.getByRole('button', { name: 'Commencer le Rosaire' }).click()
  await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
    'Signe de croix',
  )
}

// Reprend un Rosaire à la fin de la première série (le « Ô mon Jésus » de la
// 5e dizaine), le jour `jour` (AAAA-MM-JJ), puis passe à la série suivante :
// l'écran porte la ligne du passage de série et le repère « Série 2 sur 4 ».
export async function rosaireAuPassage(page: Page, jour: string, ouverture: Ouverture = {}) {
  await preparer(page, {
    ...ouverture,
    reglages: { ...ouverture.reglages, forme: 'rosaire' },
    rosaireEnCours: {
      jour,
      forme: 'rosaire',
      serie: 'joyeux',
      dizaine: 5,
      priere: 'o-mon-jesus',
      rang: 1,
    },
  })
  await page.goto('/rosaire')
  await page.getByRole('button', { name: 'Reprendre à la 1re série, 5e dizaine' }).click()
  await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
    'Ô mon Jésus',
  )
  await avancer(page, 1)
  await expect(page.getByTestId('passage-serie')).toBeVisible()
}

// Avance de plusieurs étapes, en attendant chacune : un toucher donné avant que
// l'annonce soit affichée tomberait à côté de sa grosse perle. Sur une prière
// plus haute que l'écran, le toucher fait d'abord descendre la page (phase
// 16) : on touche encore, une fois le défilement arrêté, jusqu'à la suivante.
export async function avancer(page: Page, fois: number) {
  const chapelet = page.locator('main.chapelet')
  for (let i = 0; i < fois; i++) {
    const vise = Number(await chapelet.getAttribute('data-pas')) + 1
    await expect(async () => {
      if (Number(await chapelet.getAttribute('data-pas')) >= vise) return
      await suivant(page)
      await expect(chapelet).toHaveAttribute('data-pas', String(vise), { timeout: 400 })
    }).toPass()
  }
}

// Le haut de la dernière ligne de la prière entièrement visible au-dessus du
// signal « Plus bas », dans le repère de la page (défilement compris).
export const derniereLigneVisible = (page: Page) =>
  page.evaluate(() => {
    const bas = document.querySelector('.indice-suite')!.getBoundingClientRect().top
    const lignes = [...document.querySelectorAll('.priere-texte > *')].flatMap((e) => {
      const plage = document.createRange()
      plage.selectNodeContents(e)
      return [...plage.getClientRects()].filter((r) => r.height > 0 && r.bottom <= bas)
    })
    return Math.max(...lignes.map((r) => r.top)) + window.scrollY
  })

// Attend que la page ait fini de défiler, et rend où elle s'est arrêtée.
export async function defilementArrete(page: Page) {
  let avant = -1
  await expect
    .poll(async () => {
      const y = await page.evaluate(() => window.scrollY)
      const arrete = y === avant
      avant = y
      return arrete
    })
    .toBe(true)
  return avant
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
