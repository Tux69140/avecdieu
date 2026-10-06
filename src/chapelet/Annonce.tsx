import { IndiceSuite } from '../composants/IndiceSuite'
import { useSuiteCachee } from '../composants/suiteCachee'
import { FRUITS, SERIES, type SerieId } from '../recueil/mysteres'
import type { Passage } from '../recueil/passages'
import { ORDINAUX } from './libelles'
import { PassageBiblique } from './PassageBiblique'
import './Annonce.css'

interface Props {
  serie: SerieId
  dizaine: number
  passage: Passage
  onCommencer: () => void
}

// L'annonce du mystère, en texte complet : un écran à part, qui défile, et que
// seule la grosse perle fait avancer, pour lire sans lancer la dizaine par erreur.
export function Annonce({ serie, dizaine, passage, onCommencer }: Props) {
  const fruit = FRUITS[serie][dizaine - 1]
  const { fin, cachee } = useSuiteCachee()
  return (
    <section className="annonce" data-testid="annonce" aria-live="polite">
      <p className="etiquette">{ORDINAUX[dizaine - 1]} mystère</p>
      <h2 className="annonce-titre">{SERIES[serie].mysteres[dizaine - 1]}</h2>
      <div className="fruit">
        <p>
          <span className="fruit-libelle">Fruit du mystère</span> {fruit.aujourdhui}
        </p>
        {fruit.tradition && <p className="fruit-tradition">Montfort : « {fruit.tradition} »</p>}
      </div>
      <PassageBiblique passage={passage} />
      <div ref={fin} className="fin-annonce" />
      <div className="grosse-perle-zone">
        <IndiceSuite visible={cachee} variante="en-ligne" />
        <button
          className="grosse-perle"
          type="button"
          aria-label="Commencer la dizaine"
          onClick={onCommencer}
        />
        <span className="grosse-perle-legende" aria-hidden="true">
          Touchez la perle pour commencer la dizaine
        </span>
      </div>
    </section>
  )
}
