import { glissement } from './defilement'
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
      className={`indice-suite indice-suite-${variante}`}
      type="button"
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.7, behavior: glissement() })}
    >
      Plus bas
      <svg viewBox="0 0 16 10" aria-hidden="true">
        <path d="M2 2l6 6 6-6" />
      </svg>
    </button>
  )
}
