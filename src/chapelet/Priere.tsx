import { useState } from 'react'
import { Marque } from '../composants/Marque'
import type { Passage } from '../recueil/passages'
import { PRIERES, RUBRIQUE_ENSEMBLE, type PriereId } from '../recueil/prieres'
import type { Pas } from './deroule'
import { PassageBiblique } from './PassageBiblique'
import { insecables } from './typographie'
import { ditEnsemble, strophes } from './versets'

interface Props {
  pas: Pas & { priere: PriereId }
  compact: boolean
  // À plusieurs : V/ et R/ marquent la part de chacun.
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
  const priere = PRIERES[pas.priere]
  const passage = annonce ? props.passage : undefined
  return (
    <section className="priere" data-testid="priere" aria-live="polite">
      <div className={compact ? 'priere-tete priere-tete-compacte' : 'priere-tete'}>
        <h2>{priere.titre}</h2>
        {pas.total > 1 && (
          <span className="compteur" data-testid="compteur">
            {pas.rang} / {pas.total}
          </span>
        )}
      </div>
      {/* Les liens restent sous le titre : ce qu'ils déplient s'ouvre en dessous. */}
      {compact && (
        <div className="liens-compacts">
          <button className="lien-discret" type="button" onClick={() => setVoirPriere((v) => !v)}>
            {voirPriere ? 'Masquer la prière' : 'Voir la prière'}
          </button>
          {passage && (
            <button className="lien-discret" type="button" onClick={onBasculerPassage}>
              {passageDeplie ? 'Masquer la Lecture' : 'Afficher la Lecture'}
            </button>
          )}
        </div>
      )}
      {(!compact || voirPriere) && (
        <div className="priere-texte">
          {ditEnsemble(priere, plusieurs) && (
            <p className="rubrique-ensemble" data-testid="rubrique-ensemble">
              {RUBRIQUE_ENSEMBLE}
            </p>
          )}
          {strophes(priere, plusieurs).map((vers, i) => (
            <p key={i} className="strophe" data-testid="strophe">
              {vers.map(({ texte, marque }, j) => (
                <span key={j}>
                  {marque && <Marque sorte={marque} />}
                  {insecables(texte)}
                </span>
              ))}
            </p>
          ))}
        </div>
      )}
      {compact && passage && passageDeplie && <PassageBiblique passage={passage} />}
    </section>
  )
}
