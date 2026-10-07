import { useId, useRef, useState } from 'react'
import { ChoixSon } from './ChoixSon'
import type { Heure } from '../office/heures'
import { HEURE_PROPOSEE_LECTURES, type Rappel } from './reglages'
import { ecrireHeureRappel, nomDuSon } from './textes'

interface Props {
  nom: string
  rappel: Rappel
  vibreurPossible: boolean
  onChanger: (changement: Partial<Rappel>) => void
  // Un rappel vient d'être activé : l'app demande ce qu'il lui faut.
  onActiver: () => void
  // En heures solaires : l'heure du jour, que l'on touche pour ouvrir le volet
  // du décalage, et le repère du soleil (« lever »).
  solaire?: { heure?: Heure; repere?: string; onOuvrir: () => void }
}

const versChamp = (heure?: { heures: number; minutes: number }) =>
  heure ? `${String(heure.heures).padStart(2, '0')}:${String(heure.minutes).padStart(2, '0')}` : ''

// Une prière à rappeler : son nom (qu'on touche pour choisir le son), son
// heure (qu'on touche pour ouvrir l'horloge d'Android) et son interrupteur.
export function LigneRappel({
  nom,
  rappel,
  vibreurPossible,
  onChanger,
  onActiver,
  solaire,
}: Props) {
  const [ouvert, setOuvert] = useState(false)
  const champ = useRef<HTMLInputElement>(null)
  const choix = useId()
  const { actif, heure, son, vibreur } = rappel

  const basculer = () => {
    if (actif) return onChanger({ actif: false })
    // L'office des lectures n'a pas d'heure : on lui propose 6 h 30, que
    // l'horloge ouverte aussitôt permet de changer.
    if (!heure) {
      onChanger({ actif: true, heure: HEURE_PROPOSEE_LECTURES })
      try {
        champ.current?.showPicker()
      } catch {
        // Sans horloge (navigateur ancien), l'heure se règle en touchant « 6 h 30 ».
      }
    } else onChanger({ actif: true })
    onActiver()
  }

  const changerHeure = (valeur: string) => {
    const [heures, minutes] = valeur.split(':').map(Number)
    if (Number.isInteger(heures) && Number.isInteger(minutes))
      onChanger({ heure: { heures, minutes } })
  }

  return (
    <li className="rappel" data-actif={actif ? 'oui' : 'non'}>
      <div className="rappel-ligne">
        <button
          className="rappel-nom"
          type="button"
          aria-expanded={ouvert}
          aria-controls={ouvert ? choix : undefined}
          onClick={() => setOuvert(!ouvert)}
        >
          <span className="rappel-priere">
            {nom}
            {solaire?.repere && ` · ${solaire.repere}`}
          </span>
          {actif && (
            <span className="rappel-son">
              {nomDuSon(son)}
              {/* Insécables : le point médian ne reste jamais seul en fin de ligne. */}
              {vibreurPossible && (vibreur ? ' · vibreur' : ' · sans vibreur')}
            </span>
          )}
        </button>
        {solaire ? (
          <button
            className="rappel-heure"
            type="button"
            aria-label={`${nom}, heure solaire${solaire.heure ? `, ${ecrireHeureRappel(solaire.heure)}` : ''}`}
            onClick={solaire.onOuvrir}
          >
            {solaire.heure ? ecrireHeureRappel(solaire.heure) : '—'}
          </button>
        ) : (
          <label className="rappel-heure">
            <span aria-hidden="true">{heure ? ecrireHeureRappel(heure) : '—'}</span>
            <input
              ref={champ}
              type="time"
              aria-label={`${nom}, heure`}
              value={versChamp(heure)}
              onChange={(e) => changerHeure(e.target.value)}
            />
          </label>
        )}
        <button
          className="rappel-bascule"
          type="button"
          role="switch"
          aria-checked={actif}
          aria-label={`${nom}, rappel`}
          onClick={basculer}
        >
          <span className="interrupteur-piste" aria-hidden="true">
            <span className="interrupteur-curseur" />
          </span>
        </button>
      </div>
      {ouvert && (
        <ChoixSon
          id={choix}
          nom={nom}
          rappel={rappel}
          vibreurPossible={vibreurPossible}
          onChanger={onChanger}
        />
      )}
    </li>
  )
}
