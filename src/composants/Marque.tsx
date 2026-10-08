import type { Marque as Sorte } from '../chapelet/versets'
import './Marque.css'

const SIGNES: Record<Sorte, string> = { V: '℣', R: '℟' }
// Dits par le lecteur d'écran : « V barre oblique » ne dirait rien.
const NOMS: Record<Sorte, string> = { V: 'Verset', R: 'Répons' }

// Les signes liturgiques ℣. et ℟., en rouge rubrique comme dans les livres.
// Les polices de l'app n'ont pas ces caractères : une police réduite à ces
// deux signes les apporte (Marque.css), pour qu'ils soient les mêmes sur
// tous les téléphones.
export function Marque({ sorte }: { sorte: Sorte }) {
  return (
    <span className="marque" data-testid={`marque-${sorte}`} role="img" aria-label={NOMS[sorte]}>
      {SIGNES[sorte]}.
    </span>
  )
}
