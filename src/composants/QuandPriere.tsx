import { type PriereMinutee } from '../office/durees'
import { Duree } from './Duree'
import { HeureApprochee } from './HeureApprochee'
import './QuandPriere.css'

interface Props {
  priere: PriereMinutee
  // L'heure écrite (« 7 h 00 », « à toute heure ») ; aucune pour le Rosaire.
  heure?: string
  // L'heure du chapelet, celle de son rappel, n'est qu'approchée (« ~20 h »).
  approchee?: boolean
  // Le chapelet ou le Rosaire avec « L’essentiel seulement ».
  essentiel?: boolean
  // Au menu, l'heure est plus maigre et ses chiffres sont ceux du texte ;
  // l'accueil la veut demi-grasse, en chiffres alignés.
  discret?: boolean
  className?: string
}

// Quand prier et combien de temps : l'heure, et sous elle la durée, plus
// petite (US-59), sur les lignes de l'accueil et du menu.
export function QuandPriere({ priere, heure, approchee, essentiel, discret, className }: Props) {
  const classes = ['quand-priere', discret && 'quand-priere-discret', className]
  return (
    <span className={classes.filter(Boolean).join(' ')}>
      {heure !== undefined && (
        <span className="quand-heure">{approchee ? <HeureApprochee heure={heure} /> : heure}</span>
      )}
      <Duree priere={priere} essentiel={essentiel} className="quand-duree" />
    </span>
  )
}
