import type { LieuChoisi } from '../lieu/lieu'
import { arrondirALaMinute, ecrireHeure, minutesDe, versHeure } from '../office/heure'
import {
  DECALAGE_MAX,
  heuresSolaires,
  PAS_DU_DECALAGE,
  type Limite,
  type OfficeSolaire,
  type ReglagesSolaires,
} from '../office/heuresSolaires'
import { leverEtCoucher } from '../office/soleil'
import { dansLeLieu, ecrireDecalage, ecrireHeureRappel, SOUS_TITRES_SOLAIRES } from './textes'
import { lireChamp, versChamp } from './basculer'
import { decaler } from './solaire'
import './ReglageSolaire.css'

interface Props {
  office: OfficeSolaire
  reglages: ReglagesSolaires
  lieu: LieuChoisi
  maintenant: Date
  onChanger: (changement: Partial<ReglagesSolaires>) => void
}

const arrondie = (date: Date) => versHeure(minutesDe(arrondirALaMinute(date)))

// L'heure d'un office solaire, sur la page de sa prière (textes validés par
// le porteur du projet, 2026-10-07) : le décalage, la limite pour les laudes
// et les vêpres, et l'heure que cela donne aujourd'hui.
export function ReglageSolaire({ office, reglages, lieu, maintenant, onChanger }: Props) {
  const decalage = reglages.decalages[office]
  const aujourdhui = heuresSolaires(maintenant, lieu, reglages)?.[office]
  const soleil = leverEtCoucher(maintenant, lieu)
  const midi = new Date((soleil.lever.getTime() + soleil.coucher.getTime()) / 2)
  const astre = {
    laudes: { nom: 'Lever du soleil', quand: soleil.lever },
    sexte: { nom: 'Midi solaire', quand: midi },
    vepres: { nom: 'Coucher du soleil', quand: soleil.coucher },
  }[office as 'laudes' | 'sexte' | 'vepres'] as { nom: string; quand: Date } | undefined
  const limite = office === 'laudes' ? 'pasAvant' : office === 'vepres' ? 'pasApres' : undefined

  const decalerDe = (pas: number) =>
    onChanger({ decalages: decaler(reglages.decalages, office, decalage + pas) })

  return (
    <div>
      <h2>Décalage</h2>
      <div className="volet-decalage">
        <button
          type="button"
          aria-label="Plus tôt de 5 minutes"
          disabled={decalage <= -DECALAGE_MAX}
          onClick={() => decalerDe(-PAS_DU_DECALAGE)}
        >
          −
        </button>
        <output aria-live="polite" aria-label="Décalage">
          {ecrireDecalage(decalage)}
        </output>
        <button
          type="button"
          aria-label="Plus tard de 5 minutes"
          disabled={decalage >= DECALAGE_MAX}
          onClick={() => decalerDe(PAS_DU_DECALAGE)}
        >
          +
        </button>
      </div>

      {limite && (
        <ChoixLimite
          libelle={limite === 'pasAvant' ? 'Pas avant' : 'Pas après'}
          limite={reglages[limite]}
          onChanger={(changement) =>
            onChanger({ [limite]: { ...reglages[limite], ...changement } })
          }
        />
      )}

      <p className="volet-resultat" data-testid="volet-aujourdhui">
        Aujourd’hui : {aujourdhui ? ecrireHeure(aujourdhui) : '—'}
      </p>
      {astre && (
        <p className="volet-astre">
          {astre.nom} {dansLeLieu(lieu)} : {ecrireHeure(arrondie(astre.quand))}
        </p>
      )}
    </div>
  )
}

// Sous le nom de l'office : « Au lever du soleil », « Fin de la 3e heure du jour ».
export function SousTitreSolaire({ office }: { office: OfficeSolaire }) {
  const [debut, exposant] = SOUS_TITRES_SOLAIRES[office]
  return (
    <p className="volet-sous-titre">
      {debut}
      {exposant && (
        <>
          <sup>e</sup>
          {exposant.slice(1)}
        </>
      )}
    </p>
  )
}

// « Pas avant 7 h 00 » : l'heure se règle par l'horloge d'Android, la limite
// s'active par son interrupteur.
function ChoixLimite({
  libelle,
  limite,
  onChanger,
}: {
  libelle: string
  limite: Limite
  onChanger: (changement: Partial<Limite>) => void
}) {
  return (
    <div className="volet-limite" data-active={limite.active ? 'oui' : 'non'}>
      <label className="volet-limite-heure">
        <span aria-hidden="true">
          {libelle} {ecrireHeureRappel(limite.heure)}
        </span>
        <input
          type="time"
          aria-label={`${libelle}, heure`}
          value={versChamp(limite.heure)}
          onChange={(e) => {
            const heure = lireChamp(e.target.value)
            if (heure) onChanger({ heure })
          }}
        />
      </label>
      <button
        className="rappel-bascule"
        type="button"
        role="switch"
        aria-checked={limite.active}
        aria-label={`${libelle}, limite`}
        onClick={() => onChanger({ active: !limite.active })}
      >
        <span className="interrupteur-piste" aria-hidden="true">
          <span className="interrupteur-curseur" />
        </span>
      </button>
    </div>
  )
}
