import { expect, type Page } from '@playwright/test'
import { preparer, servirAelf, test } from './outils.ts'

// Le cadran de l'accueil, mesuré à 360 px de large (le plus petit téléphone
// visé) : rien ne s'y touche (critique de l'accueil, 2026-10-08). Le jeudi
// 15 octobre 2026 a un saint sur deux lignes.

test.use({ viewport: { width: 360, height: 780 } })

const JEUDI = (heures: number, minutes = 0) => new Date(2026, 9, 15, heures, minutes)

async function ouvrir(page: Page, quand: Date, theme: 'jour' | 'nuit' = 'jour') {
  await page.clock.setFixedTime(quand)
  await servirAelf(page)
  await preparer(page, { reglages: { theme } as never })
  await page.goto('/')
  await expect(page.getByTestId('bandeau').locator('.bandeau-titre')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
}

interface Rond {
  nom: string
  x: number
  y: number
  r: number
}

interface Rect {
  nom: string
  gauche: number
  droite: number
  haut: number
  bas: number
}

// Ce que dessine le cadran, en pixels d'écran : chaque perle avec son halo (5 px
// pour celle du moment), le soleil avec son halo, la lune, les repères, la date.
const mesurer = (page: Page) =>
  page.evaluate(() => {
    const rect = (nom: string, b: DOMRect) => ({
      nom,
      gauche: b.left,
      droite: b.right,
      haut: b.top,
      bas: b.bottom,
    })
    const rond = (nom: string, b: DOMRect, halo = 0) => ({
      nom,
      x: b.left + b.width / 2,
      y: b.top + b.height / 2,
      r: b.width / 2 + halo,
    })
    const perles = [...document.querySelectorAll<HTMLElement>('.cadran-perle')].map((p) => {
      const span = p.querySelector('span')!.getBoundingClientRect()
      return rond(p.dataset.testid!, span, p.dataset.etat === 'moment' ? 5 : 0)
    })
    const soleil = document.querySelector('[data-testid=soleil] .cadran-halo')
    const lune = document.querySelector('[data-testid=lune]')
    const date = document.createRange()
    date.selectNodeContents(document.querySelector('h1')!)
    return {
      perles,
      cibles: [...document.querySelectorAll('.cadran-perle')].map((p) =>
        rond(p.getAttribute('data-testid')!, p.getBoundingClientRect()),
      ),
      soleil: soleil && rond('soleil', soleil.getBoundingClientRect()),
      lune: lune && rect('lune', lune.getBoundingClientRect()),
      reperes: [...document.querySelectorAll('.cadran-zone text')].map((t) =>
        rect(t.textContent!, t.getBoundingClientRect()),
      ),
      date: rect('date', date.getBoundingClientRect()),
    }
  })

const ecart = (r: Rect, c: Rond) =>
  Math.hypot(Math.max(r.gauche - c.x, 0, c.x - r.droite), Math.max(r.haut - c.y, 0, c.y - r.bas)) -
  c.r

const separes = (a: Rect, b: Rect) =>
  a.droite <= b.gauche || b.droite <= a.gauche || a.bas <= b.haut || b.bas <= a.haut

for (const [heure, minutes] of [
  [12, 15],
  [21, 45],
  [22, 0],
] as const) {
  // Le soleil caché derrière la perle du moment peut frôler son repère : le
  // porteur du projet tient à ce soleil (2026-10-08).
  test(`à ${heure} h ${minutes}, aucun repère ne touche une perle ou son halo`, async ({
    page,
  }) => {
    await ouvrir(page, JEUDI(heure, minutes))
    const { perles, reperes } = await mesurer(page)
    expect(reperes.map((r) => r.nom)).toEqual(['6 h', 'midi', '18 h', '21 h'])
    for (const repere of reperes)
      for (const rond of perles)
        expect(ecart(repere, rond), `« ${repere.nom} » et ${rond.nom}`).toBeGreaterThan(0)
  })
}

test('à 12 h 15, le soleil reste caché derrière la perle de sexte', async ({ page }) => {
  await ouvrir(page, JEUDI(12, 15))
  const { perles, soleil } = await mesurer(page)
  const sexte = perles.find((p) => p.nom === 'perle-sexte')!
  expect(Math.hypot(soleil!.x - sexte.x, soleil!.y - sexte.y)).toBeLessThan(sexte.r)
})

test('à 22 h, la lune ne touche pas la date', async ({ page }) => {
  await ouvrir(page, JEUDI(22))
  const { lune, date } = await mesurer(page)
  expect(separes(lune!, date)).toBe(true)
})

test('aucune cible tactile ne chevauche sa voisine, et aucune ne dépasse 48 px', async ({
  page,
}) => {
  await ouvrir(page, JEUDI(10))
  const { cibles } = await mesurer(page)
  for (const [i, a] of cibles.entries()) {
    expect(a.r * 2).toBeLessThanOrEqual(48)
    for (const b of cibles.slice(i + 1))
      expect(Math.hypot(a.x - b.x, a.y - b.y), `${a.nom} et ${b.nom}`).toBeGreaterThanOrEqual(
        a.r + b.r - 0.5,
      )
  }
  // Laudes et tierce se partagent leur écart ; les autres gardent 48 px.
  expect(cibles.find((c) => c.nom === 'perle-sexte')!.r * 2).toBeCloseTo(48, 0)
})

// Luminance relative d'une couleur CSS « rgb(r, g, b) » (WCAG 2).
const luminance = (couleur: string) => {
  const [r, g, b] = couleur
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map((c) => {
      const v = Number(c) / 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contraste = (a: string, b: string) => {
  const [claire, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (claire + 0.05) / (sombre + 0.05)
}

for (const theme of ['jour', 'nuit'] as const)
  test(`${theme} : le contour d’une perle à venir fait 3:1 au moins sur le fond`, async ({
    page,
  }) => {
    await ouvrir(page, JEUDI(10), theme)
    const perle = page.getByTestId('perle-vepres')
    await expect(perle).toHaveAttribute('data-etat', 'a-venir')
    const contour = await perle.locator('span').evaluate((s) => getComputedStyle(s).borderTopColor)
    const fond = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(contraste(contour, fond)).toBeGreaterThanOrEqual(3)
  })

test('la flèche « › » des lignes ne s’entend pas dans leur nom', async ({ page }) => {
  await ouvrir(page, JEUDI(10))
  await expect(
    page.getByRole('list', { name: 'Offices du jour' }).getByRole('link').nth(1),
  ).toHaveAccessibleName(/^Laudes\s*7 h\s*, environ vingt minutes$/)
  await expect(page.getByRole('list', { name: 'Chapelet' }).getByRole('link')).toHaveAccessibleName(
    /^Chapelet\s*20 h\s*, vingt minutes$/,
  )
})
