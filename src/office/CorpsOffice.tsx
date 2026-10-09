import { Fragment, useMemo, type Ref } from 'react'
import { clesDesParties } from './cles'
import type { Etape } from './etapes'
import type { CouleurLiturgique, Partie } from './modele'
import { PartieOffice } from './PartieOffice'
import { Repere } from './Repere'

interface Props {
  // Le texte, où le repérage (useReperage) cherche les ancres des étapes.
  ref: Ref<HTMLDivElement>
  parties: Partie[]
  etapes: Etape[]
  couleur: CouleurLiturgique | undefined
  replier: boolean
  onAccueil: () => void
}

// Le texte de l'office, partie après partie, jusqu'à sa clôture.
export function CorpsOffice({ ref, parties, etapes, couleur, replier, onAccueil }: Props) {
  const cles = useMemo(() => clesDesParties(parties), [parties])
  const debuts = useMemo(() => new Map(etapes.map((e, k) => [e.debut, k])), [etapes])
  return (
    <div ref={ref} className="office-texte" data-testid="office">
      {parties.map((partie, i) => (
        <Fragment key={cles[i]}>
          {/* Un repère entre deux étapes seulement : l'antienne reste
              avec le psaume qu'elle ouvre (2026-10-08). */}
          {i > 0 && debuts.has(i) && <Repere couleur={couleur} />}
          {debuts.has(i) && <div data-etape={debuts.get(i)} />}
          <PartieOffice partie={partie} replier={replier} />
        </Fragment>
      ))}
      {/* La fin : une perle d'or qui ferme, puis le chemin de l'accueil,
          sans mot de plus ; l'écran reste allumé (2026-10-08). */}
      <div className="repere office-cloture" aria-hidden="true" data-testid="cloture">
        <span className="repere-perle" data-couleur="or" />
      </div>
      <p className="office-revenir">
        <button className="lien-discret" type="button" onClick={onAccueil}>
          Revenir à l’accueil
        </button>
      </p>
    </div>
  )
}
