import { useState } from 'react'
import { LITANIES } from '../recueil/litanies'
import type { Passage } from '../recueil/passages'
import type { PriereId } from '../recueil/prieres'
import type { Pas } from './deroule'
import { PassageBiblique } from './PassageBiblique'
import { TexteLitanies } from './TexteLitanies'
import { TextePriere } from './TextePriere'
import { priereDuPas } from './texteDuPas'

interface Props {
  pas: Pas & { priere: PriereId | 'litanies' }
  compact: boolean
  // À plusieurs : V/ et R/ marquent la part de chacun, le demi-gras celle de tous.
  plusieurs: boolean
  // Passage du mystère, en compact, quand l'annonce est active.
  annonce: boolean
  // Passage de la dizaine en cours, et s'il est déplié (mode compact).
  passage?: Passage
  passageDeplie: boolean
  onBasculerPassage: () => void
}

// Une prière du chapelet ; le mystère en cours s'affiche au-dessus, hors de
// cette section (MystereEnCours). En mode compact, seuls son nom et le
// compteur s'affichent ; le texte de la prière et le passage du mystère se
// déplient à la demande, sous les liens qui ne bougent pas. Les liens sont des
// boutons : les toucher n'avance pas.
export function Priere(props: Props) {
  const { pas, compact, plusieurs, annonce, passageDeplie, onBasculerPassage } = props
  const [voirPriere, setVoirPriere] = useState(false)
  const priere =
    pas.priere === 'litanies' ? null : priereDuPas({ priere: pas.priere, verset: pas.verset })
  const passage = annonce ? props.passage : undefined
  return (
    <section className="priere" data-testid="priere">
      <div className={compact ? 'priere-tete priere-tete-compacte' : 'priere-tete'}>
        <h2>{priere ? priere.titre : LITANIES.titre}</h2>
        {pas.total > 1 && (
          // La barre se lirait « barre oblique » : le lecteur d'écran entend « 5 sur 10 ».
          <span className="compteur">
            <span aria-hidden="true" data-testid="compteur">
              {pas.rang} / {pas.total}
            </span>
            <span className="cache-a-l-oeil">
              {pas.rang} sur {pas.total}
            </span>
          </span>
        )}
      </div>
      {/* L'intention, en rouge comme une rubrique, avant la prière (texte
          complet et compact). */}
      {pas.intention && (
        <p className="intention" data-testid="intention">
          {pas.intention}
        </p>
      )}
      {/* Les liens restent sous le titre : ce qu'ils déplient s'ouvre en dessous. */}
      {compact && (
        <div className="liens-compacts">
          <button className="lien-discret" type="button" onClick={() => setVoirPriere((v) => !v)}>
            {voirPriere ? 'Masquer la prière' : 'Voir la prière'}
          </button>
          {passage && (
            <button className="lien-discret" type="button" onClick={onBasculerPassage}>
              {passageDeplie ? 'Masquer le passage' : 'Lire le passage'}
            </button>
          )}
        </div>
      )}
      {(!compact || voirPriere) &&
        (priere ? (
          <TextePriere priere={priere} plusieurs={plusieurs} />
        ) : (
          <TexteLitanies plusieurs={plusieurs} />
        ))}
      {compact && passage && passageDeplie && <PassageBiblique passage={passage} />}
    </section>
  )
}
