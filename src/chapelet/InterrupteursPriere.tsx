import { Interrupteur } from '../composants/Interrupteur'
import type { Reglages } from '../reglages/reglages'
import { usePeutVibrer } from '../telephone/retours'
import type { Forme } from './definition'
import { ESSENTIEL, PLUSIEURS, VIBRATIONS } from './libelles'

type Choix = 'essentiel' | 'vibrations' | 'plusieurs'

interface Props {
  // Lesquels, dans quel ordre : le seuil et les réglages ne les rangent pas
  // de même.
  choix: Choix[]
  // Sur un seuil, l'aide de « L’essentiel seulement » compte ses dizaines.
  forme?: Forme
  reglages: Reglages
  onModifier: (changement: Partial<Reglages>) => void
}

// La façon de prier, le même réglage au seuil et dans Réglages › Chapelet :
// « L’essentiel seulement », « Vibrations », « Prier à plusieurs ». Sans
// vibreur (tablette), « Vibrations » n'a pas lieu d'être.
export function InterrupteursPriere({ choix, forme, reglages, onModifier }: Props) {
  const vibreur = usePeutVibrer()
  const libelles = {
    essentiel: { libelle: ESSENTIEL.libelle, aide: ESSENTIEL.aide[forme ?? 'commune'] },
    vibrations: VIBRATIONS,
    plusieurs: PLUSIEURS,
  }
  return choix
    .filter((cle) => cle !== 'vibrations' || vibreur)
    .map((cle) => (
      <Interrupteur
        key={cle}
        libelle={libelles[cle].libelle}
        aide={libelles[cle].aide}
        actif={reglages[cle]}
        onBasculer={(actif) => onModifier({ [cle]: actif })}
      />
    ))
}
