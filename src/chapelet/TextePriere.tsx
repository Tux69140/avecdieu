import { Marque } from '../composants/Marque'
import type { Priere } from '../recueil/prieres'
import { insecables } from './typographie'
import { ditEnsemble, strophes, type Vers } from './versets'
import './TextePriere.css'

interface Props {
  priere: Priere
  // À plusieurs : V/ et R/ marquent la part de chacun, le demi-gras celle de tous.
  plusieurs: boolean
}

// Le texte d'une prière, centré, un vers par ligne : au chapelet, et sur les
// pages des prières seules ouvertes par le menu.
export function TextePriere({ priere, plusieurs }: Props) {
  return (
    <StrophesPriere
      strophes={strophes(priere, plusieurs)}
      ensemble={ditEnsemble(priere, plusieurs)}
    />
  )
}

// Des strophes déjà découpées : une prière entière, ou ce qui suit la première
// ligne d'une prière repliée.
export function StrophesPriere({ strophes, ensemble }: { strophes: Vers[][]; ensemble: boolean }) {
  return (
    <div className="priere-texte">
      {strophes.map((vers, i) => (
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
