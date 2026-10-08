import { useState } from 'react'
import { textesEnregistres } from '../aelf/reserve'
import { ZONES } from '../aelf/zones'
import { Interrupteur } from '../composants/Interrupteur'
import { LignePage } from '../composants/LignePage'
import { dateLisible } from '../office/dates'
import { aideOfficeAMontrer, masquerAideOffice, montrerAideOffice } from '../office/aide'
import { PageReglages } from '../reglages/PageReglages'
import { useReglages } from '../reglages/useReglages'

// Réglages › Offices : la zone liturgique (sa page), la lecture des offices,
// et ce que l'app garde pour prier sans réseau (libellés validés le
// 2026-10-07, zone le 2026-10-08).
export function EcranReglagesOffices() {
  const [reglages, modifier] = useReglages()
  const [enregistres] = useState(textesEnregistres)
  const [aideOffice, setAideOffice] = useState(aideOfficeAMontrer)
  return (
    <PageReglages titre="Offices" parente="/reglages">
      <div className="reglages-liste">
        <div className="reglages-zone">
          <LignePage
            vers="/reglages/offices/zone"
            nom="Zone liturgique"
            resume={ZONES[reglages.zone]}
          />
          <p className="choix-aide">Le calendrier propre à votre pays ou région.</p>
        </div>
        <Interrupteur
          libelle="Accents de psalmodie"
          aide="Souligne les syllabes accentuées des psaumes et cantiques."
          actif={reglages.accents}
          onBasculer={(accents) => modifier({ accents })}
        />
        <Interrupteur
          libelle="Prières courantes en entier"
          aide="Notre Père, Gloire au Père et Je confesse à Dieu, écrits en entier sans avoir à les déplier."
          actif={reglages.prieresEntieres}
          onBasculer={(prieresEntieres) => modifier({ prieresEntieres })}
        />
        <Interrupteur
          libelle="Signaler les ajouts de l’app"
          aide="Un filet rouge marque ce que l’app ajoute au texte de l’AELF selon les rubriques."
          actif={reglages.signalerAjouts}
          onBasculer={(signalerAjouts) => modifier({ signalerAjouts })}
        />
        <Interrupteur
          libelle="Consignes pour débuter"
          aide="Rappelle en rouge, dans l’office, ce qui se répète et quand répondre."
          actif={reglages.consignes}
          onBasculer={(consignes) => modifier({ consignes })}
        />
        <Interrupteur
          libelle="Aide à la lecture"
          aide="A l’ouverture d’un office, rappelle ce que veulent dire les perles et les signes."
          actif={aideOffice}
          onBasculer={(actif) => {
            if (actif) montrerAideOffice()
            else masquerAideOffice()
            setAideOffice(actif)
          }}
        />
      </div>
      <p className="reglages-note" data-testid="hors-connexion">
        {enregistres
          ? `Textes disponibles hors connexion jusqu’au ${dateLisible(enregistres.fin)}.`
          : 'Aucun texte enregistré pour l’instant.'}
      </p>
    </PageReglages>
  )
}
