import { insecables } from '../chapelet/typographie'
import { Marque } from '../composants/Marque'
import type { Ligne, Segment, Strophe } from './modele'

// Le texte d'une partie, tel que la frontière AELF l'a lu : des strophes de
// lignes, chaque repère liturgique dans sa propre balise, en rouge rubrique
// (TexteOffice.css). Rien que du texte : React l'échappe.
export function TexteOffice({ strophes }: { strophes: Strophe[] }) {
  return strophes.map((strophe, i) => (
    <p key={i} className="office-strophe">
      {strophe.map((ligne, j) => (
        <LigneOffice key={j} ligne={ligne} />
      ))}
    </p>
  ))
}

// Ce qui ouvre la ligne : ℣. ou ℟., ou le tiret d'une intention. La suite
// d'une telle ligne coupée s'aligne après le signe (PartieOffice.css).
function attaqueDe(ligne: Ligne): 'marque' | 'tiret' | undefined {
  const [premier] = ligne
  if (premier?.signe === 'V' || premier?.signe === 'R') return 'marque'
  if (!premier?.signe && /^\s*[—–]\s/.test(premier?.texte ?? '')) return 'tiret'
  return undefined
}

const estPause = (segment?: Segment) => segment?.signe === 'mediante' || segment?.signe === 'flexe'

// L'astérisque et la croix restent avec le mot qui les précède : en grand
// texte, ils ne tombent jamais seuls sur une ligne.
function sansCoupureAvantPause(ligne: Ligne): Ligne {
  return ligne.map((segment, k) => {
    if (estPause(segment)) return { ...segment, texte: segment.texte.replace(/^\s+/, '\u00a0') }
    if (estPause(ligne[k + 1]))
      return { ...segment, texte: segment.texte.replace(/\s+$/, '\u00a0') }
    return segment
  })
}

export function LigneOffice({ ligne }: { ligne: Ligne }) {
  return (
    <span className="office-ligne" data-attaque={attaqueDe(ligne)}>
      {sansCoupureAvantPause(ligne).map((segment, k) => (
        <SegmentOffice key={k} segment={segment} />
      ))}
    </span>
  )
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
