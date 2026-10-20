// Fabrique les motifs du papier de jour (src/styles/papier/*.webp) : fibres,
// grain fin et nuages d'ocre. Dessinés en SVG (feTurbulence) dans la page, ils
// coûtaient près d'une seconde de calcul par tuile au téléphone, à chaque
// ouverture et à chaque retour au premier plan ; peints une fois ici, le
// téléphone n'a plus qu'une image à décoder. Le grain, fin, est rendu au double
// de sa taille ; fibres et nuages, doux, à leur taille : l'image-set de
// jetons.css donne la densité de chacun.
//
// Commande : node scripts/generer-papier.mjs

/* global Image, document -- dans la page du navigateur (page.evaluate) */
import { writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const DOSSIER = 'src/styles/papier'
const QUALITE = 0.82

// Le bruit de Perlin, teinté ; la matrice règle couleur et opacité. Le filtre
// couvre exactement la tuile pour que ses bords se raccordent (stitchTiles).
const motif = (taille, turbulence, matrice) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='${taille}' height='${taille}'><filter id='m' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' ${turbulence} stitchTiles='stitch'/><feColorMatrix values='${matrice}'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`

// Validés par le porteur du projet (intensité « moyenne », 2026-10-19).
const MOTIFS = {
  fibres: [
    1,
    motif(
      400,
      "baseFrequency='.012 .045' numOctaves='4' seed='4'",
      '0 0 0 0 .55 0 0 0 0 .36 0 0 0 0 .1 0 0 0 .07 0',
    ),
  ],
  grain: [
    2,
    motif(
      160,
      "baseFrequency='.85' numOctaves='3'",
      '0 0 0 0 .45 0 0 0 0 .3 0 0 0 0 .1 0 0 0 .08 0',
    ),
  ],
  nuages: [
    1,
    motif(
      600,
      "baseFrequency='.004' numOctaves='4' seed='9'",
      '0 0 0 0 .66 0 0 0 0 .42 0 0 0 0 .12 0 0 0 .8 -.32',
    ),
  ],
}

const navigateur = await chromium.launch()
const page = await navigateur.newPage()
for (const [nom, [densite, svg]] of Object.entries(MOTIFS)) {
  const donnees = await page.evaluate(
    async ({ svg, densite, qualite }) => {
      const image = new Image()
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      await image.decode()
      const toile = document.createElement('canvas')
      toile.width = image.naturalWidth * densite
      toile.height = image.naturalHeight * densite
      toile.getContext('2d').drawImage(image, 0, 0, toile.width, toile.height)
      return toile.toDataURL('image/webp', qualite).split(',')[1]
    },
    { svg, densite, qualite: QUALITE },
  )
  const fichier = `${DOSSIER}/${nom}.webp`
  writeFileSync(fichier, Buffer.from(donnees, 'base64'))
  console.log(`${fichier} : ${Math.round(Buffer.byteLength(donnees, 'base64') / 1024)} Ko`)
}
await navigateur.close()
