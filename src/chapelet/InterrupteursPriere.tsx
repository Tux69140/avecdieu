import { Interrupteur } from '../composants/Interrupteur'
import type { Reglages } from '../reglages/reglages'
import { usePeutVibrer } from '../telephone/retours'
import { ESSENTIEL, PLUSIEURS, VIBRATIONS } from './libelles'

type Choix = 'essentiel' | 'vibrations' | 'plusieurs'

const LIBELLES = { essentiel: ESSENTIEL, vibrations: VIBRATIONS, plusieurs: PLUSIEURS }

interface Props {
  // Lesquels, dans quel ordre : le seuil et les réglages ne les rangent pas
  // de même.
  choix: Choix[]
  reglages: Reglages
  onModifier: (changement: Partial<Reglages>) => void
}

// La façon de prier, le même réglage au seuil et dans Réglages › Chapelet :
// « L’essentiel seulement », « Vibrations », « Prier à plusieurs ». Sans
// vibreur (tablette), « Vibrations » n'a pas lieu d'être.
export function InterrupteursPriere({ choix, reglages, onModifier }: Props) {
  const vibreur = usePeutVibrer()
  return choix
    .filter((cle) => cle !== 'vibrations' || vibreur)
    .map((cle) => (
      <Interrupteur
        key={cle}
        libelle={LIBELLES[cle].libelle}
        aide={LIBELLES[cle].aide}
        actif={reglages[cle]}
        onBasculer={(actif) => onModifier({ [cle]: actif })}
      />
    ))
}
