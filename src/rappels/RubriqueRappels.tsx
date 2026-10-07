import { useCallback, useEffect, useState } from 'react'
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
import {
  accordNotifications,
  demanderAccord,
  minuteExacte,
  ouvrirPageMinute,
  type Accord,
} from '../telephone/notifications'
import { usePeutVibrer } from '../telephone/retours'
import {
  fabricant,
  ouvrirFicheApp,
  ouvrirReglagesNotifications,
  type Fabricant,
} from '../telephone/sonnerie'
import { etapeSuivante, type Etape } from './autorisations'
import { DialogueRappels } from './DialogueRappels'
import { reprogrammerBientot } from './entretien'
import { LigneRappel } from './LigneRappel'
import {
  aucunRappelActif,
  noterDemande,
  PRIERES_RAPPELEES,
  type Priere,
  type Rappel,
  type Rappels,
} from './reglages'
import { dansLeLieu, NOMS_PRIERES, REPERES_SOLAIRES } from './textes'
import { VoletSolaire } from './VoletSolaire'
import './RubriqueRappels.css'

interface Props {
  rappels: Rappels
  onChanger: (priere: Priere, changement: Partial<Rappel>) => void
  solaire: ReglagesSolaires
  lieu?: LieuChoisi
  onChangerSolaire: (changement: Partial<ReglagesSolaires>) => void
}

const HEURES = [
  ['fixes', 'Fixes'],
  ['solaires', 'Solaires'],
] as const

const estSolaire = (priere: Priere): priere is OfficeSolaire =>
  (OFFICES_SOLAIRES as readonly string[]).includes(priere)

interface Etat {
  accord: Accord
  exacte: boolean
  marque: Fabricant
}

// Ce qu'Android accorde, relu à l'ouverture et au retour de ses réglages.
function useEtatAndroid(): [Etat | undefined, () => void] {
  const [etat, setEtat] = useState<Etat>()
  const relire = useCallback(() => {
    Promise.all([accordNotifications(), minuteExacte(), fabricant()]).then(
      ([accord, exacte, marque]) => setEtat({ accord, exacte, marque }),
    )
  }, [])
  useEffect(() => {
    relire()
    const auRetour = () => document.visibilityState === 'visible' && relire()
    document.addEventListener('visibilitychange', auRetour)
    return () => document.removeEventListener('visibilitychange', auRetour)
  }, [relire])
  return [etat, relire]
}

// La rubrique « Rappels » des réglages (phase 11) : une ligne par prière, les
// avis quand Android refuse, et le guide de batterie sur Xiaomi et Samsung.
// En tête, le choix des heures fixes ou solaires (phase 12).
export function RubriqueRappels({ rappels, onChanger, solaire, lieu, onChangerSolaire }: Props) {
  const vibreurPossible = usePeutVibrer()
  const [android, relire] = useEtatAndroid()
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
    if (suivante === 'minute' || suivante === 'batterie') noterDemande(suivante)
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
    if (etape) await avancer(etape)
  }

  const actifs = !aucunRappelActif(rappels)
  const guide = android?.marque === 'xiaomi' || android?.marque === 'samsung'

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

      {actifs && android?.accord === 'refuse' && (
        <div className="rappels-avis" role="status">
          <p>
            <span aria-hidden="true">⚠ </span>Android bloque les notifications de l’app : aucun
            rappel ne s’affichera.
          </p>
          <button
            className="btn btn-secondaire"
            type="button"
            onClick={ouvrirReglagesNotifications}
          >
            Ouvrir les réglages d’Android
          </button>
        </div>
      )}
      {actifs && android?.accord === 'accorde' && !android.exacte && (
        <div className="rappels-avis" role="status">
          <p>
            <span aria-hidden="true">⚠ </span>Sans l’autorisation « Alarmes et rappels », les
            rappels peuvent arriver en retard.
          </p>
          <button
            className="btn btn-secondaire"
            type="button"
            onClick={async () => {
              await ouvrirPageMinute()
              relire()
              reprogrammerBientot()
            }}
          >
            Autoriser
          </button>
        </div>
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
