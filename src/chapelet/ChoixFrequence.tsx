import { useId } from 'react'
import { Bascule } from '../composants/Bascule'
import type { Frequence } from '../reglages/reglages'
import './ChoixFrequence.css'

interface Props {
  libelle: string
  aide?: string
  valeur: Frequence
  onChoisir: (valeur: Frequence) => void
}

const FREQUENCES = [
  ['octobre', 'En octobre'],
  ['toujours', 'Toujours'],
  ['jamais', 'Jamais'],
] as const

// Un texte dit en octobre, toujours ou jamais (Litanies, saint Joseph) : un
// réglage de la liste, comme un interrupteur, mais à trois valeurs.
export function ChoixFrequence({ libelle, aide, valeur, onChoisir }: Props) {
  const id = useId()
  return (
    <div className="choix-frequence">
      <p id={id} className="choix-frequence-libelle">
        {libelle}
      </p>
      <Bascule titre={id} choix={FREQUENCES} valeur={valeur} onChoisir={onChoisir} />
      {aide && <p className="choix-aide">{aide}</p>}
    </div>
  )
}
