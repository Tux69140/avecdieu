import { useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Interrupteur } from '../composants/Interrupteur'
import { useLieu } from '../lieu/useLieu'
import { estOfficeSolaire } from '../office/heuresSolaires'
import { basculerRappel, lireChamp, versChamp } from '../rappels/basculer'
import { ChoixSon } from '../rappels/ChoixSon'
import { ReglageSolaire, SousTitreSolaire } from '../rappels/ReglageSolaire'
import {
  lireRappels,
  modifierRappel,
  PRIERES_RAPPELEES,
  type Priere,
  type Rappel,
} from '../rappels/reglages'
import { lireSolaire, modifierSolaire } from '../rappels/solaire'
import { ecrireHeureRappel, NOMS_PRIERES } from '../rappels/textes'
import { useAutorisations } from '../rappels/useAutorisations'
import { useEtatAndroid } from '../rappels/useEtatAndroid'
import { PageReglages } from '../reglages/PageReglages'
import { usePeutVibrer } from '../telephone/retours'
import '../rappels/Rappels.css'

const PARENTE = '/reglages/rappels'

const estPriere = (valeur?: string): valeur is Priere =>
  (PRIERES_RAPPELEES as readonly string[]).includes(valeur ?? '')

// Réglages › Rappels › une prière (/reglages/rappels/<prière>) : son rappel,
// son heure (l'horloge d'Android, ou en heures solaires le décalage et « Pas
// avant / Pas après »), son son et le vibreur (arborescence validée par le
// porteur du projet, 2026-10-08).
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
    <PageReglages titre={nom} parente={PARENTE}>
      {office && <SousTitreSolaire office={office} />}
      <div className="reglages-liste">
        <Interrupteur
          libelle="Rappel"
          actif={rappel.actif}
          onBasculer={() => basculerRappel(rappel, changer, activer, champ.current)}
        />
        {!office && (
          <label className="rappel-page-heure" data-actif={rappel.actif ? 'oui' : 'non'}>
            <span className="rappel-page-libelle">Heure</span>
            <span aria-hidden="true">{rappel.heure ? ecrireHeureRappel(rappel.heure) : '—'}</span>
            <input
              ref={champ}
              type="time"
              aria-label={`${nom}, heure`}
              value={versChamp(rappel.heure)}
              onChange={(e) => {
                const heure = lireChamp(e.target.value)
                if (heure) changer({ heure })
              }}
            />
          </label>
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
      <ChoixSon
        id={`son-${priere}`}
        nom={nom}
        rappel={rappel}
        vibreurPossible={vibreurPossible}
        onChanger={changer}
      />
      {fenetre}
    </PageReglages>
  )
}
