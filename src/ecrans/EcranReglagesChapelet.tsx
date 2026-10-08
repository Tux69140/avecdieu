import { useState } from 'react'
import { ChoixAffichage } from '../chapelet/ChoixAffichage'
import { AIDE_PLUSIEURS, AIDE_VIBRATIONS } from '../chapelet/libelles'
import { aideAMontrer, masquerAide, montrerAide } from '../chapelet/memoire'
import { Interrupteur } from '../composants/Interrupteur'
import { LignePage } from '../composants/LignePage'
import { PageReglages } from '../reglages/PageReglages'
import { useReglages } from '../reglages/useReglages'
import { usePeutVibrer } from '../telephone/retours'

// Réglages › Chapelet : les prières dites ont leur page ; ici, la façon de
// prier (libellés validés le 2026-10-07).
export function EcranReglagesChapelet() {
  const [reglages, modifier] = useReglages()
  const [aide, setAide] = useState(aideAMontrer)
  // Sans vibreur (tablette), le réglage n'a pas lieu d'être.
  const vibreur = usePeutVibrer()
  return (
    <PageReglages titre="Chapelet" parente="/reglages">
      <div className="reglages-liste">
        <LignePage vers="/reglages/chapelet/prieres" nom="Prières du chapelet" />
      </div>
      <h2 id="reglages-affichage">Affichage des prières</h2>
      <ChoixAffichage
        titre="reglages-affichage"
        affichage={reglages.affichage}
        onChoisir={(affichage) => modifier({ affichage })}
      />
      <div className="reglages-liste reglages-gestes">
        <Interrupteur
          libelle="Prier à plusieurs"
          aide={AIDE_PLUSIEURS}
          actif={reglages.plusieurs}
          onBasculer={(plusieurs) => modifier({ plusieurs })}
        />
        {vibreur && (
          <Interrupteur
            libelle="Vibrations"
            aide={AIDE_VIBRATIONS}
            actif={reglages.vibrations}
            onBasculer={(vibrations) => modifier({ vibrations })}
          />
        )}
        <Interrupteur
          libelle="Aide aux gestes"
          aide="Au début du chapelet, rappelle comment avancer et revenir en arrière."
          actif={aide}
          onBasculer={(actif) => {
            if (actif) montrerAide()
            else masquerAide()
            setAide(actif)
          }}
        />
      </div>
    </PageReglages>
  )
}
