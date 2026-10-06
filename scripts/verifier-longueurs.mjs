// Aucun fichier de code ne dépasse 500 lignes : au-delà, un fichier mélange
// plusieurs responsabilités et devient difficile à relire et à modifier.
// Les tests en sont exemptés : un parcours complet se lit mieux d'un seul tenant.
// Lancé par `pnpm lint`, donc avant chaque commit.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const MAX = 500
const CODE = /\.(ts|tsx|js|mjs|css)$/
const TEST = /(\.test\.(ts|tsx)$|^e2e\/|^src\/test\/)/

const fichiers = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  encoding: 'utf8',
})
  .split('\n')
  .filter((f) => CODE.test(f) && !TEST.test(f))

const compterLignes = (texte) => texte.split('\n').length - (texte.endsWith('\n') ? 1 : 0)

const tropLongs = fichiers
  .map((f) => ({ f, lignes: compterLignes(readFileSync(f, 'utf8')) }))
  .filter(({ lignes }) => lignes > MAX)

if (tropLongs.length > 0) {
  console.error(`✗ Fichiers de plus de ${MAX} lignes (à découper) :`)
  for (const { f, lignes } of tropLongs) console.error(`  ${f} : ${lignes} lignes`)
  process.exit(1)
}
console.log(`✓ ${fichiers.length} fichiers de code, aucun au-delà de ${MAX} lignes`)
