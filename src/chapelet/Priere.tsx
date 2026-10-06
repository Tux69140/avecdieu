import { useState } from 'react'
import { FRUITS, SERIES, type SerieId } from '../recueil/mysteres'
import type { Passage } from '../recueil/passages'
import { PRIERES, type PriereId } from '../recueil/prieres'
import type { Pas } from './deroule'
import { ORDINAUX } from './libelles'
import { PassageBiblique } from './PassageBiblique'

interface Props {
  pas: Pas & { priere: PriereId }
  serie: SerieId
  compact: boolean
  // Passage de la dizaine en cours, et s'il est déplié (mode compact).
  passage?: Passage
  passageDeplie: boolean
  onBasculerPassage: () => void
}

// Dans le recueil, une ligne vide sépare deux strophes.
function strophes(lignes: string[]): string[][] {
  return lignes.reduce<string[][]>(
    (groupes, ligne) => {
      if (ligne === '') groupes.push([])
      else groupes.at(-1)!.push(ligne)
      return groupes
    },
    [[]],
  )
}

// Une prière du chapelet. En mode compact, seuls son nom et le compteur
// s'affichent ; le texte de la prière et le passage du mystère se déplient à
// la demande. Les liens sont des boutons : les toucher n'avance pas.
export function Priere({ pas, serie, compact, passage, passageDeplie, onBasculerPassage }: Props) {
  const [voirPriere, setVoirPriere] = useState(false)
  const priere = PRIERES[pas.priere]
  const dizaine = pas.dizaine
  // En compact, le mystère s'annonce sur le Notre Père qui ouvre la dizaine.
  const ouvreLaDizaine = compact && dizaine !== undefined && pas.priere === 'notre-pere'
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
      {(!compact || voirPriere) && (
        <div className="priere-texte">
          {strophes(priere.lignes).map((vers, i) => (
            <p key={i} className="strophe" data-testid="strophe">
              {vers.map((ligne, j) => (
                <span key={j}>{ligne}</span>
              ))}
            </p>
          ))}
        </div>
      )}
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
      {compact && passage && passageDeplie && <PassageBiblique passage={passage} />}
    </section>
  )
}
