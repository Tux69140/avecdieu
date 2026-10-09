import { useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Interrupteur } from '../composants/Interrupteur'
import { LignePage } from '../composants/LignePage'
import { useLieu } from '../lieu/useLieu'
import { estOfficeSolaire } from '../office/heuresSolaires'
import { basculerRappel } from '../rappels/basculer'
import { ChampHeure } from '../rappels/ChampHeure'
import { ReglageSolaire, SousTitreSolaire } from '../rappels/ReglageSolaire'
import {
  estPriere,
  lireRappels,
  modifierRappel,
  type Priere,
  type Rappel,
} from '../rappels/reglages'
import { lireSolaire, modifierSolaire } from '../rappels/solaire'
import { NOMS_PRIERES, nomDuSon } from '../rappels/textes'
import { useAutorisations } from '../rappels/useAutorisations'
import { useEtatAndroid } from '../rappels/useEtatAndroid'
import { PageReglages } from '../reglages/PageReglages'
import { usePeutVibrer } from '../telephone/retours'
import '../rappels/Rappels.css'

const PARENTE = '/reglages/rappels'

// Réglages › Rappels › une prière (/reglages/rappels/<prière>) : son rappel,
// son heure (l'horloge d'Android, ou en heures solaires le décalage et « Pas
// avant / Pas après »), son son et le vibreur (arborescence validée par le
// porteur du projet, 2026-10-08). Le son tient sur une ligne qui ouvre sa page,
// comme la zone liturgique (2026-10-09).
export function EcranRappel() {
  const { priere } = useParams()
  if (!estPriere(priere)) return <Navigate to={PARENTE} replace />
  return <PageRappel key={priere} priere={priere} />
}

function PageRappel({ priere }: { priere: Priere }) {
  const nom = NOMS_PRIERES[priere]
  const vibreurPossible = usePeutVibrer()
  const champ = useRef<HTMLInputElement>(null)
  const [rappel, setRappel] = useState(() => lireRappels()[priere])
  const [solaire, setSolaire] = useState(lireSolaire)
  const { lieu } = useLieu()
  const [android, relire] = useEtatAndroid()
  const { activer, fenetre } = useAutorisations(android, relire)
  const office = solaire.actives && lieu && estOfficeSolaire(priere) ? priere : undefined
  const changer = (changement: Partial<Rappel>) =>
    setRappel(modifierRappel(priere, changement)[priere])

  return (
    <PageReglages titre={nom}>
      {office && <SousTitreSolaire office={office} />}
      <div className="reglages-liste">
        <Interrupteur
          libelle="Rappel"
          actif={rappel.actif}
          onBasculer={() => basculerRappel(rappel, changer, activer, champ.current)}
        />
        {!office && (
          <ChampHeure
            ref={champ}
            className="rappel-page-heure"
            nom={`${nom}, heure`}
            heure={rappel.heure}
            actif={rappel.actif}
            avant={<span className="rappel-page-libelle">Heure</span>}
            onChoisir={(heure) => changer({ heure })}
          />
        )}
      </div>
      {office && lieu && (
        <ReglageSolaire
          office={office}
          reglages={solaire}
          lieu={lieu}
          maintenant={new Date()}
          onChanger={(changement) => setSolaire(modifierSolaire(changement))}
        />
      )}
      <div className="reglages-liste rappel-page-son">
        <LignePage vers={`${PARENTE}/${priere}/son`} nom="Son" resume={nomDuSon(rappel.son)} />
        {vibreurPossible && (
          <Interrupteur
            libelle="Vibreur"
            actif={rappel.vibreur}
            onBasculer={(vibreur) => changer({ vibreur })}
          />
        )}
      </div>
      {fenetre}
    </PageReglages>
  )
}
