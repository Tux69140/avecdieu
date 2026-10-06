import { FRUITS, SERIES, type SerieId } from '../recueil/mysteres'

interface Props {
  serie: SerieId
  dizaine: number
  // En compact, le fruit s'annonce sur le Notre Père qui ouvre la dizaine.
  fruit: boolean
}

// Le mystère de la dizaine, au-dessus du filet qui ouvre la prière : on ne
// lit plus d'un trait « L'Agonie de Jésus… Je vous salue Marie ». Format et
// place choisis par le porteur du projet (2026-10-06).
export function MystereEnCours({ serie, dizaine, fruit }: Props) {
  return (
    <div className="mystere-en-cours">
      <p className="mystere" data-testid="mystere">
        <span className="mystere-rang">{dizaine}</span> · {SERIES[serie].mysteres[dizaine - 1]}
      </p>
      {fruit && <p className="fruit-compact">Fruit : {FRUITS[serie][dizaine - 1].aujourdhui}</p>}
    </div>
  )
}
