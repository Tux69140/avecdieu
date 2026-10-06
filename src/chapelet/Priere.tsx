import { useState } from 'react'
import { Marque } from '../composants/Marque'
import { FRUITS, SERIES, type SerieId } from '../recueil/mysteres'
import type { Passage } from '../recueil/passages'
import { PRIERES, type PriereId } from '../recueil/prieres'
import type { Pas } from './deroule'
import { ORDINAUX } from './libelles'
import { PassageBiblique } from './PassageBiblique'
import { insecables } from './typographie'
import { strophes } from './versets'

interface Props {
  pas: Pas & { priere: PriereId }
  serie: SerieId
  compact: boolean
  // À plusieurs : V/ et R/ marquent la part de chacun.
  plusieurs: boolean
  // Fruit et passage du mystère, en compact, quand l'annonce est active.
  annonce: boolean
  // Passage de la dizaine en cours, et s'il est déplié (mode compact).
  passage?: Passage
  passageDeplie: boolean
  onBasculerPassage: () => void
}

// Une prière du chapelet. En mode compact, seuls son nom et le compteur
// s'affichent ; le texte de la prière et le passage du mystère se déplient à
// la demande, sous les liens qui ne bougent pas. Les liens sont des boutons : les toucher n'avance pas. Sans
// annonce, seul le titre du mystère reste (choix du porteur du projet).
export function Priere(props: Props) {
  const { pas, serie, compact, plusieurs, annonce, passageDeplie, onBasculerPassage } = props
  const [voirPriere, setVoirPriere] = useState(false)
  const priere = PRIERES[pas.priere]
  const dizaine = pas.dizaine
  const passage = annonce ? props.passage : undefined
  // En compact, le mystère s'annonce sur le Notre Père qui ouvre la dizaine.
  const ouvreLaDizaine = compact && annonce && dizaine !== undefined && pas.priere === 'notre-pere'
  return (
    <section className="priere" data-testid="priere" aria-live="polite">
      {dizaine !== undefined && (
        <p className="mystere" data-testid="mystere">
          <span className="etiquette">{ORDINAUX[dizaine - 1]} mystère</span>{' '}
          <span className="mystere-titre">{SERIES[serie].mysteres[dizaine - 1]}</span>
        </p>
      )}
      {ouvreLaDizaine && (
        <p className="fruit-compact">Fruit : {FRUITS[serie][dizaine - 1].aujourdhui}</p>
      )}
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
