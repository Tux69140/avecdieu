import { useState, type ReactNode } from 'react'
import { demanderAccord, ouvrirPageMinute } from '../telephone/notifications'
import { ouvrirDemarrageAutomatique, ouvrirFicheApp } from '../telephone/sonnerie'
import { etapeSuivante, type Etape } from './autorisations'
import type { EtatAndroid } from './blocage'
import { DialogueRappels } from './DialogueRappels'
import { reprogrammerBientot } from './entretien'
import { noterDemande } from './reglages'

// Ce que l'app demande à Android au premier rappel activé, fenêtre après
// fenêtre (US-39, US-40) : ce sont les seules fenêtres des réglages, car
// elles annoncent une autorisation d'Android (décision du porteur du projet,
// 2026-10-08). `fenetre` se pose dans la page ; `activer` lance la suite.
export function useAutorisations(
  android: EtatAndroid | undefined,
  relire: () => void,
): { activer: () => void; fenetre: ReactNode } {
  const [etape, setEtape] = useState<Etape>()

  // La fenêtre suivante, ou la fin : Android relu, rappels refaits.
  const avancer = async (depuis: 'activation' | Etape) => {
    const suivante = await etapeSuivante(depuis)
    if (suivante && suivante !== 'accord') noterDemande(suivante)
    setEtape(suivante)
    if (!suivante) {
      relire()
      reprogrammerBientot()
    }
  }

  const accepter = async () => {
    if (etape === 'accord') await demanderAccord()
    else if (etape === 'minute') await ouvrirPageMinute()
    else if (etape === 'batterie') await ouvrirFicheApp()
    else if (etape === 'demarrage') await ouvrirDemarrageAutomatique()
    if (etape) await avancer(etape)
  }

  return {
    activer: () => void avancer('activation'),
    fenetre: etape && android && (
      <DialogueRappels
        etape={etape}
        marque={android.marque}
        onAccepter={accepter}
        onRenoncer={() => (etape === 'accord' ? setEtape(undefined) : avancer(etape))}
      />
    ),
  }
}
