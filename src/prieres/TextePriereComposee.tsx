import { StrophesPriere, TextePriere } from '../chapelet/TextePriere'
import { ditEnsemble, strophes } from '../chapelet/versets'
import type { PriereComposee } from '../recueil/angelus'
import { PRIERES, type Priere } from '../recueil/prieres'
import './TextePriereComposee.css'

interface Props {
  priere: PriereComposee
  plusieurs: boolean
  // Les prières déjà validées (le Je vous salue Marie de l'Angélus) repliées
  // sur leur première ligne, comme les prières courantes des offices
  // (réglage « Prières courantes en entier » coupé, 2026-10-20).
  replier: boolean
}

// Une prière seule, morceau après morceau.
export function TextePriereComposee({ priere, plusieurs, replier }: Props) {
  return priere.morceaux.map((morceau, i) =>
    'priere' in morceau ? (
      <PriereRepliable
        key={i}
        priere={PRIERES[morceau.priere]}
        plusieurs={plusieurs}
        replier={replier}
      />
    ) : (
      <TextePriere key={i} priere={{ titre: priere.titre, ...morceau }} plusieurs={plusieurs} />
    ),
  )
}

// La première ligne seule ; un toucher déplie la suite, juste en dessous.
function PriereRepliable({
  priere,
  plusieurs,
  replier,
}: {
  priere: Priere
  plusieurs: boolean
  replier: boolean
}) {
  if (!replier) return <TextePriere priere={priere} plusieurs={plusieurs} />
  const ensemble = ditEnsemble(priere, plusieurs)
  const [[premier, ...finDeStrophe] = [], ...suite] = strophes(priere, plusieurs)
  if (!premier) return null
  return (
    <details className="priere-repliable" data-testid="priere-courante">
      <summary>
        <StrophesPriere strophes={[[premier]]} ensemble={ensemble} />
      </summary>
      <StrophesPriere
        strophes={[finDeStrophe, ...suite].filter((s) => s.length > 0)}
        ensemble={ensemble}
      />
    </details>
  )
}
