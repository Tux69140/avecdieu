import { expect, test, type Page } from '@playwright/test'

// Le navigateur de test ne vibre pas et n'a pas d'écran à garder allumé : on
// remplace navigator.vibrate et navigator.wakeLock par des espions, que les
// greffons Capacitor appellent hors de l'APK.
declare global {
  interface Window {
    __journal: string[]
  }
}

async function espionner(page: Page) {
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

const journal = (page: Page) => page.evaluate(() => window.__journal)

async function toucher(page: Page) {
  const { width, height } = page.viewportSize()!
  await page.touchscreen.tap(width / 2, (height * 2) / 3)
}

const LUNDI = new Date(2026, 9, 5, 10, 0)
// Ouverture (7 prières), puis 5 dizaines de 12 prières, puis l'écran de fin.
const OUVERTURE = 7
const DIZAINE = 12
const PRIERES = OUVERTURE + 5 * DIZAINE

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(LUNDI)
  await espionner(page)
  await page.goto('/chapelet')
  await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
    'Signe de croix',
  )
})

test('chaque prière vibre court, chaque nouvelle dizaine et la fin vibrent fort', async ({
  page,
}) => {
  for (let i = 0; i < PRIERES; i++) await toucher(page)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')

  const vibrations = (await journal(page)).filter((e) => e.startsWith('vibre'))
  // La i-ième vibration marque l'arrivée sur la prière d'index i + 1.
  const attendues = Array.from({ length: PRIERES }, (_, i) => {
    const arrivee = i + 1
    const nouvelleDizaine = arrivee >= OUVERTURE && (arrivee - OUVERTURE) % DIZAINE === 0
    return nouvelleDizaine ? 'vibre 250' : 'vibre 40'
  })
  expect(vibrations).toEqual(attendues)
  expect(vibrations.filter((v) => v === 'vibre 250')).toHaveLength(6)
})

test('revenir en arrière vibre court', async ({ page }) => {
  await toucher(page)
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('priere').getByRole('heading', { level: 2 })).toHaveText(
    'Signe de croix',
  )
  await expect.poll(() => journal(page)).toContain('vibre 40')
  expect((await journal(page)).filter((e) => e.startsWith('vibre'))).toEqual([
    'vibre 40',
    'vibre 40',
  ])
})

test('l’écran reste allumé pendant le chapelet et redevient libre à la fin', async ({ page }) => {
  await expect.poll(() => journal(page)).toEqual(['écran allumé'])

  for (let i = 0; i < PRIERES; i++) await toucher(page)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  await expect.poll(() => journal(page).then((j) => j.at(-1))).toBe('écran libre')

  await page.getByRole('button', { name: 'Recommencer' }).click()
  await expect.poll(() => journal(page).then((j) => j.at(-1))).toBe('écran allumé')
  const etats = (await journal(page)).filter((e) => !e.startsWith('vibre'))
  expect(etats).toEqual(['écran allumé', 'écran libre', 'écran allumé'])
})
