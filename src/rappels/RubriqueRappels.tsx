import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bascule } from '../composants/Bascule'
import { nommerLieu, type LieuChoisi } from '../lieu/lieu'
import { calculerHeures } from '../office/heures'
import {
  OFFICES_SOLAIRES,
  type OfficeSolaire,
  type ReglagesSolaires,
} from '../office/heuresSolaires'
import { dateDuJour } from '../office/dates'
import { demanderAccord, ouvrirPageMinute } from '../telephone/notifications'
import { usePeutVibrer } from '../telephone/retours'
import { ouvrirDemarrageAutomatique, ouvrirFicheApp } from '../telephone/sonnerie'
import { etapeSuivante, type Etape } from './autorisations'
import { AvisRappels } from './AvisRappels'
import { avisDesRappels, type EtatAndroid } from './blocage'
import { DialogueRappels } from './DialogueRappels'
import { reprogrammerBientot } from './entretien'
import { LigneRappel } from './LigneRappel'
import { noterDemande, PRIERES_RAPPELEES, type Priere, type Rappel, type Rappels } from './reglages'
import { dansLeLieu, NOMS_PRIERES, REPERES_SOLAIRES } from './textes'
import { VoletSolaire } from './VoletSolaire'
import './RubriqueRappels.css'

interface Props {
  rappels: Rappels
  onChanger: (priere: Priere, changement: Partial<Rappel>) => void
  solaire: ReglagesSolaires
  lieu?: LieuChoisi
  onChangerSolaire: (changement: Partial<ReglagesSolaires>) => void
  // Lu par l'écran des réglages, qui en tire aussi le résumé de la rubrique.
  android?: EtatAndroid
  relire: () => void
}

const HEURES = [
  ['fixes', 'Fixes'],
  ['solaires', 'Solaires'],
] as const

const estSolaire = (priere: Priere): priere is OfficeSolaire =>
  (OFFICES_SOLAIRES as readonly string[]).includes(priere)

// La rubrique « Rappels » des réglages (phase 11) : une ligne par prière, les
// avis quand Android ou la surcouche du fabricant bloque, et le guide de
// batterie sur Xiaomi et Samsung.
// En tête, le choix des heures fixes ou solaires (phase 12).
export function RubriqueRappels({
  rappels,
  onChanger,
  solaire,
  lieu,
  onChangerSolaire,
  android,
  relire,
}: Props) {
  const vibreurPossible = usePeutVibrer()
  const [etape, setEtape] = useState<Etape>()
  const [volet, setVolet] = useState<OfficeSolaire>()
  const naviguer = useNavigate()
  const solaires = solaire.actives && !!lieu
  const maintenant = new Date()
  const heures = calculerHeures(dateDuJour(maintenant), rappels, solaire, lieu)

  // Sans lieu, « Solaires » mène d'abord à l'écran du lieu ; en revenir sans
  // choisir garde les heures fixes.
  const choisirHeures = (choix: 'fixes' | 'solaires') => {
    if (choix === 'solaires' && !lieu) naviguer('/lieu', { state: { activer: true } })
    else onChangerSolaire({ actives: choix === 'solaires' })
  }

  // La fenêtre suivante, ou la fin : Android relu, rappels refaits.
  const avancer = async (depuis: 'activation' | Etape) => {
    const suivante = await etapeSuivante(depuis)
    if (suivante && suivante !== 'accord') noterDemande(suivante)
    setEtape(suivante)
    if (!suivante) {
      relire()
      reprogrammerBientot()
    }
  }

  const accepter = async () => {
    if (etape === 'accord') await demanderAccord()
    else if (etape === 'minute') await ouvrirPageMinute()
    else if (etape === 'batterie') await ouvrirFicheApp()
    else if (etape === 'demarrage') await ouvrirDemarrageAutomatique()
    if (etape) await avancer(etape)
  }

  const avis = avisDesRappels(rappels, android)
  // Le lien du guide, sauf quand l'avis de batterie le dit déjà.
  const guide =
    (android?.marque === 'xiaomi' || android?.marque === 'samsung') && !avis.includes('batterie')

  return (
    <>
      <div className="rappels-heures">
        <h3 id="rappels-heures">Heures des prières</h3>
        <Bascule
          titre="rappels-heures"
          choix={HEURES}
          valeur={solaires ? 'solaires' : 'fixes'}
          onChoisir={choisirHeures}
        />
        {solaires && lieu && (
          <>
            <p className="choix-aide">
              Selon la course du soleil {dansLeLieu(lieu)}, du lever au coucher.
            </p>
            <Link className="lien-discret rappels-lieu" to="/lieu">
              Lieu : {nommerLieu(lieu)} ›
            </Link>
          </>
        )}
      </div>

      <ul className="rappels">
        {PRIERES_RAPPELEES.map((priere) => (
          <LigneRappel
            key={priere}
            nom={NOMS_PRIERES[priere]}
            rappel={rappels[priere]}
            vibreurPossible={vibreurPossible}
            onChanger={(changement) => onChanger(priere, changement)}
            onActiver={() => avancer('activation')}
            solaire={
              solaires && estSolaire(priere)
                ? {
                    heure: heures[priere],
                    repere: REPERES_SOLAIRES[priere],
                    onOuvrir: () => setVolet(priere),
                  }
                : undefined
            }
          />
        ))}
      </ul>

      {volet && lieu && (
        <VoletSolaire
          office={volet}
          reglages={solaire}
          lieu={lieu}
          maintenant={maintenant}
          onChanger={onChangerSolaire}
          onFermer={() => setVolet(undefined)}
        />
      )}

      {avis.length > 0 && (
        <AvisRappels
          avis={avis}
          onMinuteOuverte={() => {
            relire()
            reprogrammerBientot()
          }}
        />
      )}

      {guide && (
        <button
          className="lien-discret rappels-batterie"
          type="button"
          onClick={() => setEtape('batterie')}
        >
          Rappels bloqués ? Régler la batterie ›
        </button>
      )}

      {etape && android && (
        <DialogueRappels
          etape={etape}
          marque={android.marque}
          onAccepter={accepter}
          onRenoncer={() => (etape === 'accord' ? setEtape(undefined) : avancer(etape))}
        />
      )}
    </>
  )
}
