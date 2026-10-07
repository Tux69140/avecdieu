import { useEffect, useId, useRef } from 'react'
import type { LieuChoisi } from '../lieu/lieu'
import { ecrireHeure, type Heure } from '../office/heures'
import {
  DECALAGE_MAX,
  heuresSolaires,
  PAS_DU_DECALAGE,
  type Limite,
  type OfficeSolaire,
  type ReglagesSolaires,
} from '../office/heuresSolaires'
import { NOMS_OFFICES } from '../office/modele'
import { leverEtCoucher } from '../office/soleil'
import { dansLeLieu, ecrireDecalage, ecrireHeureRappel, SOUS_TITRES_SOLAIRES } from './textes'
import './DialogueRappels.css'
import './VoletSolaire.css'

interface Props {
  office: OfficeSolaire
  reglages: ReglagesSolaires
  lieu: LieuChoisi
  maintenant: Date
  onChanger: (changement: Partial<ReglagesSolaires>) => void
  onFermer: () => void
}

const versChamp = ({ heures, minutes }: Heure) =>
  `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

const versHeure = (valeur: string): Heure | undefined => {
  const [heures, minutes] = valeur.split(':').map(Number)
  return Number.isInteger(heures) && Number.isInteger(minutes) ? { heures, minutes } : undefined
}

const arrondie = (date: Date) => {
  const minute = new Date(Math.round(date.getTime() / 60_000) * 60_000)
  return { heures: minute.getHours(), minutes: minute.getMinutes() }
}

// Le volet d'un office solaire, ouvert en touchant son heure (textes validés
// par le porteur du projet, 2026-10-07) : le décalage, la limite pour les
// laudes et les vêpres, et l'heure que cela donne aujourd'hui.
export function VoletSolaire({ office, reglages, lieu, maintenant, onChanger, onFermer }: Props) {
  const fenetre = useRef<HTMLDialogElement>(null)
  const titre = useId()
  const decalage = reglages.decalages[office]
  const aujourdhui = heuresSolaires(maintenant, lieu, reglages)?.[office]
  const soleil = leverEtCoucher(maintenant, lieu)
  const [debut, exposant] = SOUS_TITRES_SOLAIRES[office]
  const midi = new Date((soleil.lever.getTime() + soleil.coucher.getTime()) / 2)
  const astre = {
    laudes: { nom: 'Lever du soleil', quand: soleil.lever },
    sexte: { nom: 'Midi solaire', quand: midi },
    vepres: { nom: 'Coucher du soleil', quand: soleil.coucher },
  }[office as 'laudes' | 'sexte' | 'vepres'] as { nom: string; quand: Date } | undefined
  const limite = office === 'laudes' ? 'pasAvant' : office === 'vepres' ? 'pasApres' : undefined

  useEffect(() => {
    const dialogue = fenetre.current
    if (dialogue && !dialogue.open) dialogue.showModal?.()
    return () => dialogue?.close()
  }, [])

  const decaler = (pas: number) =>
    onChanger({ decalages: { ...reglages.decalages, [office]: decalage + pas } })

  return (
    <dialog
      ref={fenetre}
      className="dialogue-rappels volet-solaire"
      aria-labelledby={titre}
      onCancel={(e) => {
        e.preventDefault()
        onFermer()
      }}
    >
      <h2 id={titre}>{NOMS_OFFICES[office]}</h2>
      <p className="volet-sous-titre">
        {debut}
        {exposant && (
          <>
            <sup>e</sup>
            {exposant.slice(1)}
          </>
        )}
      </p>

      <h3>Décalage</h3>
      <div className="volet-decalage">
        <button
          type="button"
          aria-label="Plus tôt de 5 minutes"
          disabled={decalage <= -DECALAGE_MAX}
          onClick={() => decaler(-PAS_DU_DECALAGE)}
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
          onClick={() => decaler(PAS_DU_DECALAGE)}
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
      <div className="dialogue-boutons">
        <button className="btn btn-principal" type="button" onClick={onFermer}>
          Fermer
        </button>
      </div>
    </dialog>
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
            const heure = versHeure(e.target.value)
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
