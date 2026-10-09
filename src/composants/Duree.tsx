import { direDuree, ecrireDuree, type PriereMinutee } from '../office/durees'
import './Duree.css'

// La durée d'une prière : « ~20 min » à l'œil, « environ vingt minutes » au
// lecteur d'écran, qui lirait « tilde » et « min ». La virgule, cachée à
// l'œil comme le reste, lui fait marquer une pause après l'heure.
// « essentiel » : le chapelet ou le Rosaire avec « L’essentiel seulement ».
export function Duree({
  priere,
  essentiel = false,
  className,
}: {
  priere: PriereMinutee
  essentiel?: boolean
  className?: string
}) {
  const ecrite = ecrireDuree(priere, essentiel)
  const environ = ecrite.startsWith('~')
  return (
    <span className={className} data-testid="duree">
      <span aria-hidden="true">
        {environ && <span className="duree-environ">~</span>}
        {environ ? ecrite.slice(1) : ecrite}
      </span>
      <span className="cache-a-l-oeil">, {direDuree(priere, essentiel)}</span>
    </span>
  )
}
