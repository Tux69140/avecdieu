import type { ReactNode } from 'react'
import { LigneFermer } from '../composants/LigneFermer'
import { useRemonter } from '../composants/retour'
import './Reglages.css'

interface Props {
  titre: string
  children: ReactNode
}

// Une page emboîtée des réglages (décision du porteur du projet,
// 2026-10-08) : la croix en haut à gauche remonte d'un niveau, comme le
// retour d'Android, et le titre est centré.
export function PageReglages({ titre, children }: Props) {
  const remonter = useRemonter()
  return (
    <main className="reglages">
      <LigneFermer onFermer={remonter}>
        <h1>{titre}</h1>
      </LigneFermer>
      {children}
    </main>
  )
}
