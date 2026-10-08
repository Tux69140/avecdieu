import type { Ref } from 'react'
import { BoutonFermer, LienMenu } from '../composants/Icones'
import type { Etape } from './etapes'
import { FilDePerles } from './FilDePerles'
import './BandeauOffice.css'

interface Props {
  etapes: Etape[]
  courante: number
  visible: boolean
  onOuvrir: () => void
  onFermer: () => void
  date: string
  office: string
  ref: Ref<HTMLElement>
}

// En haut de l'écran, une fois le titre de l'office sorti : la croix, l'étape en
// cours et la progression (un toucher ouvre le sommaire), ☰. Elle s'efface
// pendant la lecture et revient quand on remonte (src/office/barre.ts ;
// choix du porteur du projet, 2026-10-07).
export function BandeauOffice(props: Props) {
  const { etapes, courante, visible, onOuvrir, onFermer, date, office, ref } = props
  const etape = etapes[courante]
  return (
    <header
      ref={ref}
      className="bandeau-office"
      data-testid="bandeau-office"
      data-visible={visible ? 'oui' : 'non'}
      inert={!visible}
    >
      <div className="bandeau-office-contenu">
        <BoutonFermer onClick={onFermer} />
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
        <LienMenu depuis={date} office={office} />
      </div>
    </header>
  )
}
