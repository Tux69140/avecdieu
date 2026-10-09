import { useEffect, useRef } from 'react'
import type { SerieId } from '../recueil/mysteres'
import { garderEcranAllume, vibrer } from '../telephone/retours'
import type { Forme } from './definition'
import type { Deroule } from './deroule'
import { compterLecture } from './memoire'
import { effacerEnCours, retenirEnCours } from './reprise'
import { dizaineCommencee } from './rotation'
import { vibrationEntre } from './vibration'

interface Suivi {
  deroule: Deroule
  index: number
  date: Date
  forme: Forme
  // La série du seuil ; au Rosaire, celle où l'on en est.
  serie: SerieId
  serieEnCours: SerieId
  vibrations: boolean
}

// Ce qui accompagne chaque pas sans se voir : la vibration, la lecture
// comptée de chaque mystère commencé, le chapelet retenu pour la reprise et
// l'écran gardé allumé.
export function useSuiviDuChapelet({
  deroule,
  index,
  date,
  forme,
  serie,
  serieEnCours,
  vibrations,
}: Suivi) {
  const indexPrecedent = useRef(index)
  const dizainesLues = useRef(new Set<string>())
  const termine = index === deroule.pas.length

  useEffect(() => {
    const avant = indexPrecedent.current
    indexPrecedent.current = index
    const vibration = vibrationEntre(deroule, avant, index)
    if (vibration && vibrations) vibrer(vibration)
    // Chaque dizaine commencée compte une lecture de son mystère, une fois par
    // chapelet ; au Rosaire, dans sa série.
    const commencee = dizaineCommencee(deroule, avant, index)
    if (commencee === null) return
    const serieLue = commencee.serie ?? serie
    const cle = `${serieLue}-${commencee.dizaine}`
    if (dizainesLues.current.has(cle)) return
    dizainesLues.current.add(cle)
    compterLecture(serieLue, commencee.dizaine)
  }, [index, deroule, serie, vibrations])

  // Retenu à chaque pas, oublié une fois le chapelet terminé.
  useEffect(() => {
    if (index < deroule.pas.length) retenirEnCours(date, serieEnCours, deroule.pas[index], forme)
    else effacerEnCours(forme)
  }, [index, deroule, date, serieEnCours, forme])

  // L'écran reste allumé du signe de croix à la fin du chapelet.
  useEffect(() => (termine ? undefined : garderEcranAllume()), [termine])
}
