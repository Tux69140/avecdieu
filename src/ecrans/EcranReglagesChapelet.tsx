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
    <PageReglages titre="Chapelet">
      <div className="reglages-liste">
        <LignePage vers="/reglages/chapelet/prieres" nom={prieresDe('chapelet')} />
      </div>
      <h2 className="petit-titre" id="reglages-affichage">
        Affichage des prières
      </h2>
      <ChoixAffichage
        titre="reglages-affichage"
        affichage={reglages.affichage}
        onChoisir={(affichage) => modifier({ affichage })}
      />
      {/* Dans l'ordre du seuil : ce qui change la prière, puis le confort
          (2026-10-09). « L’essentiel seulement » l'emporte sur les prières
          réglées dans leur page, sans les changer (phase 18). */}
      <div className="reglages-liste reglages-gestes">
        <InterrupteursPriere
          choix={['essentiel', 'plusieurs', 'vibrations']}
          reglages={reglages}
          onModifier={modifier}
        />
        <Interrupteur
          libelle="Aide aux gestes"
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
