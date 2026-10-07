import type { Ref } from 'react'
import type { Etape } from './etapes'
import { FilDePerles } from './FilDePerles'
import './BandeauOffice.css'

interface Props {
  etapes: Etape[]
  courante: number
  visible: boolean
  onOuvrir: () => void
  ref: Ref<HTMLElement>
}

// En haut de l'écran dès que le titre de l'office en est sorti : l'étape en
// cours et la progression. Un toucher ouvre le sommaire (choix du porteur du
// projet, 2026-10-07).
export function BandeauOffice({ etapes, courante, visible, onOuvrir, ref }: Props) {
  const etape = etapes[courante]
  return (
    <header
      ref={ref}
      className="bandeau-office"
      data-testid="bandeau-office"
      data-visible={visible ? 'oui' : 'non'}
      inert={!visible}
    >
      <button
        className="bandeau-office-bouton"
        type="button"
        aria-haspopup="dialog"
        aria-label={`${etape?.libelle ?? ''}, étape ${courante + 1} sur ${etapes.length}. Ouvrir le sommaire`}
        onClick={onOuvrir}
      >
        <span className="bandeau-office-ligne">
          <span className="bandeau-office-etape" data-testid="etape-courante">
            {etape?.libelle}
          </span>
          <svg viewBox="0 0 16 10" aria-hidden="true">
            <path d="M2 2l6 6 6-6" />
          </svg>
        </span>
        <FilDePerles nombre={etapes.length} courante={courante} />
      </button>
    </header>
  )
}
