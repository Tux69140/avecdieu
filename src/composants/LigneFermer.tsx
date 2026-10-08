import type { ReactNode } from 'react'
import { BoutonFermer } from './Icones'
import './LigneFermer.css'

// La première ligne d'un écran : la croix à gauche, le titre (ou la date)
// centré sur l'écran, sur la même ligne, ce qui gagne une ligne en haut
// (décision du porteur du projet, 2026-10-08). La colonne de droite, vide,
// garde le titre centré.
export function LigneFermer({ onFermer, children }: { onFermer: () => void; children: ReactNode }) {
  return (
    <div className="ligne-fermer">
      <BoutonFermer onClick={onFermer} />
      {children}
    </div>
  )
}
