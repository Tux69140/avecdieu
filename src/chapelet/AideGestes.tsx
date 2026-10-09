import {
  AideGras,
  AideMarques,
  AidePincement,
  FenetreAide,
  LigneAide,
} from '../composants/FenetreAide'
import { masquerAide } from './memoire'

// L'aide aux gestes, par-dessus le signe de croix, pour qu'un nouveau priant
// sache avancer et revenir. Elle revient à chaque chapelet tant que « Ne plus
// afficher » n'est pas coché ; « ? », en face de la croix, la rouvre.
// À plusieurs, deux lignes de plus, les mêmes que dans l'aide de l'office.
export function AideGestes({ plusieurs, onFermer }: { plusieurs: boolean; onFermer: () => void }) {
  return (
    <FenetreAide titre="Prier avec l’app" onMasquer={masquerAide} onFermer={onFermer}>
      <LigneAide
        icone={
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="7" className="plein" />
            <circle cx="20" cy="20" r="13" />
          </svg>
        }
      >
        <strong>Touchez</strong> n’importe où : prière suivante.
      </LigneAide>
      <LigneAide
        icone={
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M8 20h24M14 14l-6 6 6 6M26 14l6 6-6 6" />
          </svg>
        }
      >
        <strong>Glissez de côté</strong> : prière précédente.
      </LigneAide>
      <LigneAide
        icone={
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M20 8v24M14 14l6-6 6 6M14 26l6 6 6-6" />
          </svg>
        }
      >
        <strong>Glissez vers le haut ou le bas</strong> : faire défiler un long texte.
      </LigneAide>
      <LigneAide
        icone={
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="11" className="soleil" />
          </svg>
        }
      >
        A l’annonce d’un mystère, <strong>touchez la grosse perle</strong> pour commencer la
        dizaine.
      </LigneAide>
      <AidePincement />
      {plusieurs && (
        <>
          <AideMarques />
          <AideGras />
        </>
      )}
    </FenetreAide>
  )
}
