import { glissement } from './defilement'
import { FlecheBas } from './Icones'
import './IndiceSuite.css'

interface Props {
  visible: boolean
  // Flottant : en bas de l'écran ; en ligne : dans une zone déjà fixée en bas.
  variante?: 'flottant' | 'en-ligne'
}

// « Plus bas » : sur tout écran plus long que le téléphone, pour que rien
// d'important ne reste ignoré sous la ligne de flottaison (demande du porteur
// du projet). Le toucher fait défiler.
export function IndiceSuite({ visible, variante = 'flottant' }: Props) {
  if (!visible) return null
  return (
    <button
      className={variante === 'flottant' ? 'indice-suite indice-suite-flottant' : 'indice-suite'}
      type="button"
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.7, behavior: glissement() })}
    >
      Plus bas
      <FlecheBas />
    </button>
  )
}
