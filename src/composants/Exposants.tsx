import './Exposants.css'

// « 27e semaine », « dimanche 1er novembre » : la terminaison de l'ordinal en
// exposant, comme l'écrit la typographie française, partout où l'app l'affiche.
export function avecExposants(texte: string) {
  return texte.split(/(?<=\d)(er|re|e)(?=\s|$)/).map((morceau, i) =>
    i % 2 === 1 ? (
      <sup key={i} className="exposant">
        {morceau}
      </sup>
    ) : (
      morceau
    ),
  )
}
