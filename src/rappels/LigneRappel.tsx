import { useRef } from 'react'
import { Link, useLocation } from 'react-router'
import type { DepuisParente } from '../composants/retour'
import type { Heure } from '../office/heures'
import { basculerRappel, versChamp, versHeure } from './basculer'
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
          <label className="rappel-heure">
            <span aria-hidden="true">{heure ? ecrireHeureRappel(heure) : '—'}</span>
            <input
              ref={champ}
              type="time"
              aria-label={`${nom}, heure`}
              value={versChamp(heure)}
              onChange={(e) => {
                const choisie = versHeure(e.target.value)
                if (choisie) onChanger({ heure: choisie })
              }}
            />
          </label>
        )}
        <button
          className="rappel-bascule"
          type="button"
          role="switch"
          aria-checked={actif}
          aria-label={`${nom}, rappel`}
          onClick={() => basculerRappel(rappel, onChanger, onActiver, champ.current)}
        >
          <span className="interrupteur-piste" aria-hidden="true">
            <span className="interrupteur-curseur" />
          </span>
        </button>
      </div>
    </li>
  )
}
