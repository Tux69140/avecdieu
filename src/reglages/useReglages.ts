import { useState } from 'react'
import { lireReglages, modifierReglages, type Reglages } from './reglages'

// Les réglages retenus sur le téléphone, relus à l'ouverture de chaque page
// et enregistrés à chaque changement.
export function useReglages(): [Reglages, (changement: Partial<Reglages>) => void] {
  const [reglages, setReglages] = useState(lireReglages)
  return [reglages, (changement) => setReglages(modifierReglages(changement))]
}
