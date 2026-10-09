import './Duree.css'

// L'heure du chapelet, celle de son rappel, approximative : l'Église n'en
// fixe aucune (phase 18). « ~20 h » à l'œil, « vers 20 h » au lecteur
// d'écran, qui lirait « tilde ».
export function HeureApprochee({ heure }: { heure: string }) {
  return (
    <>
      <span className="duree-environ" aria-hidden="true">
        ~
      </span>
      <span className="cache-a-l-oeil">vers </span>
      {heure}
    </>
  )
}
