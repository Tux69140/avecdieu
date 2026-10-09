import type { ReactNode, Ref } from 'react'
import type { Heure } from '../office/heure'
import { lireChamp, versChamp } from './basculer'
import { ecrireHeureRappel } from './textes'
import './ChampHeure.css'

interface Props {
  // La mise en page de la ligne : « rappel-heure », « rappel-page-heure »…
  className: string
  // Le nom du champ pour le lecteur d'écran : « Laudes, heure ».
  nom: string
  heure: Heure | undefined
  onChoisir: (heure: Heure) => void
  ref?: Ref<HTMLInputElement>
  // Le rappel éteint, l'heure s'atténue.
  actif?: boolean
  // Devant l'heure lisible : « Heure », sur la page de la prière.
  avant?: ReactNode
  // L'heure lisible, si elle n'est pas seule : « Pas avant 7 h 00 ».
  texte?: string
}

// Une heure de rappel : on lit l'heure, et le champ d'heure, invisible
// par-dessus, ouvre l'horloge d'Android.
export function ChampHeure({ className, nom, heure, onChoisir, ref, actif, avant, texte }: Props) {
  return (
    <label
      className={`champ-heure ${className}`}
      data-actif={actif === undefined ? undefined : actif ? 'oui' : 'non'}
    >
      {avant}
      <span aria-hidden="true">{texte ?? (heure ? ecrireHeureRappel(heure) : '—')}</span>
      <input
        ref={ref}
        type="time"
        aria-label={nom}
        value={versChamp(heure)}
        onChange={(e) => {
          const choisie = lireChamp(e.target.value)
          if (choisie) onChoisir(choisie)
        }}
      />
    </label>
  )
}
