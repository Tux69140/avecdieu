import { useState } from 'react'
import { ChoixAffichage } from '../chapelet/ChoixAffichage'
import { InterrupteursPriere } from '../chapelet/InterrupteursPriere'
import { prieresDe } from '../chapelet/libelles'
import { aideAMontrer, masquerAide, montrerAide } from '../chapelet/memoire'
import { Interrupteur } from '../composants/Interrupteur'
import { LignePage } from '../composants/LignePage'
import { PageReglages } from '../reglages/PageReglages'
import { useReglages } from '../reglages/useReglages'

// Réglages › Chapelet : les prières dites ont leur page ; ici, la façon de
// prier (libellés validés le 2026-10-07).
export function EcranReglagesChapelet() {
  const [reglages, modifier] = useReglages()
  const [aide, setAide] = useState(aideAMontrer)
  return (
    <PageReglages titre="Chapelet" parente="/reglages">
      <div className="reglages-liste">
        <LignePage vers="/reglages/chapelet/prieres" nom={prieresDe('chapelet')} />
        {/* Le cœur seul : il l'emporte sur les prières réglées au-dessus,
            sans les changer (phase 18). */}
        <InterrupteursPriere choix={['essentiel']} reglages={reglages} onModifier={modifier} />
      </div>
      <h2 id="reglages-affichage">Affichage des prières</h2>
      <ChoixAffichage
        titre="reglages-affichage"
        affichage={reglages.affichage}
        onChoisir={(affichage) => modifier({ affichage })}
      />
      <div className="reglages-liste reglages-gestes">
        <InterrupteursPriere
          choix={['plusieurs', 'vibrations']}
          reglages={reglages}
          onModifier={modifier}
        />
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
