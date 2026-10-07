// Pincer ou écarter deux doigts change la taille du texte de cran en cran
// (phase 10) : chaque fois que l'écart grandit ou diminue d'un quart depuis le
// dernier cran, le texte gagne ou perd un cran.
const SEUIL = 1.25

interface Point {
  x: number
  y: number
}

const ecart = ([a, b]: Point[]) => Math.hypot(b.x - a.x, b.y - a.y)

export function creerPincement(changerDeCran: (sens: 1 | -1) => void) {
  let reference: number | null = null
  return {
    // Deux doigts sur l'écran : le geste commence.
    poser(points: Point[]) {
      reference = points.length === 2 ? ecart(points) : null
    },
    bouger(points: Point[]) {
      if (reference === null || points.length !== 2) return
      const rapport = ecart(points) / reference
      if (rapport >= SEUIL || rapport <= 1 / SEUIL) {
        changerDeCran(rapport > 1 ? 1 : -1)
        reference = ecart(points)
      }
    },
    lever() {
      reference = null
    },
  }
}
