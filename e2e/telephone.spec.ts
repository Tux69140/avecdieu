import { expect, test } from '@playwright/test'
import { commencer, espionner, journal, suivant, toucher } from './outils.ts'

const LUNDI = new Date(2026, 9, 5, 10, 0)
// Ouverture (7 prières), 5 dizaines (l'annonce et 13 prières), le Salve Regina, l'écran de fin.
const OUVERTURE = 7
const DIZAINE = 14
const SALVE = OUVERTURE + 5 * DIZAINE
const PRIERES = SALVE + 1

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(LUNDI)
  await espionner(page)
  await commencer(page)
})

test('chaque prière vibre court ; chaque annonce, le Salve Regina et la fin vibrent fort', async ({
  page,
}) => {
  for (let i = 0; i < PRIERES; i++) await suivant(page)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')

  const vibrations = (await journal(page)).filter((e) => e.startsWith('vibre'))
  // La i-ième vibration marque l'arrivée sur la prière d'index i + 1.
  const attendues = Array.from({ length: PRIERES }, (_, i) => {
    const arrivee = i + 1
    const nouvellePartie = arrivee >= OUVERTURE && (arrivee - OUVERTURE) % DIZAINE === 0
    return nouvellePartie || arrivee === PRIERES ? 'vibre 250' : 'vibre 40'
  })
  expect(vibrations).toEqual(attendues)
  expect(vibrations.filter((v) => v === 'vibre 250')).toHaveLength(7)
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

  for (let i = 0; i < PRIERES; i++) await suivant(page)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chapelet terminé')
  await expect.poll(() => journal(page).then((j) => j.at(-1))).toBe('écran libre')

  await page.getByRole('button', { name: 'Recommencer' }).click()
  await expect.poll(() => journal(page).then((j) => j.at(-1))).toBe('écran allumé')
  const etats = (await journal(page)).filter((e) => !e.startsWith('vibre'))
  expect(etats).toEqual(['écran allumé', 'écran libre', 'écran allumé'])
})
