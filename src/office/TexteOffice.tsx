import { insecables } from '../chapelet/typographie'
import { Marque } from '../composants/Marque'
import type { Segment, Strophe } from './modele'

// Le texte d'une partie, tel que la frontière AELF l'a lu : des strophes de
// lignes, chaque repère liturgique dans sa propre balise, en rouge rubrique
// (TexteOffice.css). Rien que du texte : React l'échappe.
export function TexteOffice({ strophes }: { strophes: Strophe[] }) {
  return strophes.map((strophe, i) => (
    <p key={i} className="office-strophe">
      {strophe.map((ligne, j) => (
        <span key={j} className="office-ligne">
          {ligne.map((segment, k) => (
            <SegmentOffice key={k} segment={segment} />
          ))}
        </span>
      ))}
    </p>
  ))
}

function SegmentOffice({ segment: { texte, signe } }: { segment: Segment }) {
  switch (signe) {
    case 'V':
    case 'R':
      return <Marque sorte={signe} />
    case 'verset':
      return <sup className="office-verset">{texte}</sup>
    case 'accent':
      return <span className="office-accent">{texte}</span>
    case 'mediante':
    case 'flexe':
      return <span className="office-signe">{texte}</span>
    case 'emphase':
      return <em>{insecables(texte)}</em>
    default:
      return insecables(texte)
  }
}
