import { Fragment, useMemo, type Ref } from 'react'
import { FinDePriere } from '../composants/FinDePriere'
import { LienSuite } from '../composants/LienSuite'
import { clesDesParties } from './cles'
import type { Etape } from './etapes'
import {
  cheminOffice,
  NOMS_OFFICES,
  type CouleurLiturgique,
  type NomOffice,
  type Partie,
} from './modele'
import { PartieOffice } from './PartieOffice'
import { Repere } from './Repere'

interface Props {
  // Le texte, où le repérage (useReperage) cherche les ancres des étapes.
  ref: Ref<HTMLDivElement>
  parties: Partie[]
  etapes: Etape[]
  couleur: CouleurLiturgique | undefined
  replier: boolean
  // L'office suivant du jour, et le jour : il remplace celui-ci.
  suivant?: NomOffice
  date: string
  onAccueil: () => void
}

// Le texte de l'office, partie après partie, jusqu'à sa clôture.
export function CorpsOffice({
  ref,
  parties,
  etapes,
  couleur,
  replier,
  suivant,
  date,
  onAccueil,
}: Props) {
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
      {/* L'écran reste allumé à la fin : on lit peut-être encore le haut (2026-10-08). */}
      <FinDePriere
        testId="cloture"
        onAccueil={onAccueil}
        suite={
          suivant && (
            <LienSuite to={cheminOffice(suivant, date)} replace>
              {NOMS_OFFICES[suivant]}
            </LienSuite>
          )
        }
      />
    </div>
  )
}
