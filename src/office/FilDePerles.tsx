import { etatDePerle, type EtatDePerle } from './reperage'
import './FilDePerles.css'

// Une perle par étape (docs/DESIGN.md) : dite = or plein, en cours = soleil
// avec halo, à venir = cercle d'or.
export function PerleEtape({ etat }: { etat: EtatDePerle }) {
  return <span className="perle-etape" data-etat={etat} aria-hidden="true" />
}

// La progression dans l'office, sous le nom de l'étape en cours.
export function FilDePerles({ nombre, courante }: { nombre: number; courante: number }) {
  return (
    <span className="fil-de-perles" aria-hidden="true">
      {Array.from({ length: nombre }, (_, i) => (
        <PerleEtape key={i} etat={etatDePerle(i, courante)} />
      ))}
    </span>
  )
}
