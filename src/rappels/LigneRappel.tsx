import { useRef } from 'react'
import { Link, useLocation } from 'react-router'
import type { DepuisParente } from '../composants/retour'
import type { Heure } from '../office/heure'
import { Interrupteur } from '../composants/Interrupteur'
import { basculerRappel } from './basculer'
import { ChampHeure } from './ChampHeure'
import type { Priere, Rappel } from './reglages'
import { ecrireHeureRappel, nomDuSon } from './textes'

interface Props {
  priere: Priere
  nom: string
  rappel: Rappel
  vibreurPossible: boolean
  onChanger: (changement: Partial<Rappel>) => void
  // Un rappel vient d'être activé : l'app demande ce qu'il lui faut.
  onActiver: () => void
  // En heures solaires : l'heure du jour, que l'on touche pour ouvrir la page
  // de la prière (décalage), et le repère du soleil (« lever »).
  solaire?: { heure?: Heure; repere?: string }
}

// Une prière à rappeler : son nom (qui ouvre la page de la prière : son,
// vibreur, décalage solaire), son heure (qui ouvre l'horloge d'Android) et
// son interrupteur.
export function LigneRappel({
  priere,
  nom,
  rappel,
  vibreurPossible,
  onChanger,
  onActiver,
  solaire,
}: Props) {
  const champ = useRef<HTMLInputElement>(null)
  const { pathname } = useLocation()
  const { actif, heure, son, vibreur } = rappel
  const page = {
    to: `/reglages/rappels/${priere}`,
    state: { parente: pathname } satisfies DepuisParente,
  }

  return (
    <li className="rappel" data-actif={actif ? 'oui' : 'non'}>
      <div className="rappel-ligne">
        <Link className="rappel-nom" {...page}>
          <span className="rappel-priere">
            {nom}
            {solaire?.repere && ` · ${solaire.repere}`}
          </span>
          {actif && (
            <span className="rappel-son">
              {nomDuSon(son)}
              {/* Insécables : le point médian ne reste jamais seul en fin de ligne. */}
              {vibreurPossible && (vibreur ? ' · vibreur' : ' · sans vibreur')}
            </span>
          )}
        </Link>
        {solaire ? (
          <Link
            className="rappel-heure"
            {...page}
            aria-label={`${nom}, heure solaire${solaire.heure ? `, ${ecrireHeureRappel(solaire.heure)}` : ''}`}
          >
            {solaire.heure ? ecrireHeureRappel(solaire.heure) : '—'}
          </Link>
        ) : (
          <ChampHeure
            ref={champ}
            className="rappel-heure"
            nom={`${nom}, heure`}
            heure={heure}
            onChoisir={(choisie) => onChanger({ heure: choisie })}
          />
        )}
        <Interrupteur
          libelle={`${nom}, rappel`}
          libelleCache
          actif={actif}
          onBasculer={() => basculerRappel(rappel, onChanger, onActiver, champ.current)}
        />
      </div>
    </li>
  )
}
