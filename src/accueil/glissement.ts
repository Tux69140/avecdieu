// Glisser sur le cadran change de jour (demande du porteur du projet,
// 2026-10-07) : vers la gauche, on tourne la page, jour suivant ; vers la
// droite, jour précédent. Mêmes seuils qu'au chapelet : un geste franc et
// plutôt horizontal, pour ne pas gêner le défilement de l'écran.
const GLISSER_MIN = 50

export function jourVise({ dx, dy }: { dx: number; dy: number }): -1 | 0 | 1 {
  if (Math.abs(dx) < GLISSER_MIN || Math.abs(dx) <= Math.abs(dy) * 1.5) return 0
  return dx < 0 ? 1 : -1
}
