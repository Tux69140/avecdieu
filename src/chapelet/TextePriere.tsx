import { Marque } from '../composants/Marque'
import type { Priere } from '../recueil/prieres'
import { insecables } from './typographie'
import { ditEnsemble, strophes } from './versets'
import './TextePriere.css'

interface Props {
  priere: Priere
  // À plusieurs : V/ et R/ marquent la part de chacun, le demi-gras celle de tous.
  plusieurs: boolean
}

// Le texte d'une prière, centré, un vers par ligne : au chapelet, et sur les
// pages des prières seules ouvertes par le menu.
export function TextePriere({ priere, plusieurs }: Props) {
  const ensemble = ditEnsemble(priere, plusieurs)
  return (
    <div className="priere-texte">
      {strophes(priere, plusieurs).map((vers, i) => (
        <p key={i} className="strophe" data-testid="strophe">
          {vers.map(({ texte, marque }, j) => (
            // Dite ensemble, la prière passe en demi-gras, sauf un verset
            // marqué (celui du Salve Regina), qui garde ses ℣. et ℟.
            <span key={j} data-tous={ensemble && !marque ? 'oui' : undefined}>
              {marque && <Marque sorte={marque} />}
              {insecables(texte)}
            </span>
          ))}
        </p>
      ))}
    </div>
  )
}
