import './Bascule.css'

interface Props<T extends string> {
  choix: readonly (readonly [T, string])[]
  valeur: T
  onChoisir: (valeur: T) => void
  // Identifiant du titre qui nomme le choix.
  titre: string
}

// Un choix entre quelques valeurs côte à côte, l'une toujours retenue.
export function Bascule<T extends string>({ choix, valeur, onChoisir, titre }: Props<T>) {
  return (
    <div className="bascule" role="radiogroup" aria-labelledby={titre}>
      {choix.map(([v, libelle]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={valeur === v}
          onClick={() => onChoisir(v)}
        >
          {libelle}
        </button>
      ))}
    </div>
  )
}
