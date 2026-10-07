import { Capacitor } from '@capacitor/core'
import { useEffect, type ReactNode } from 'react'
import { Interrupteur } from '../composants/Interrupteur'
import { arreterEcoute, choisirMp3, ecouter } from '../telephone/sonnerie'
import { CLOCHES, NOMS_CLOCHES, type Rappel, type Son } from './reglages'

interface Props {
  id: string
  nom: string
  rappel: Rappel
  vibreurPossible: boolean
  onChanger: (changement: Partial<Rappel>) => void
}

// Le son du téléphone et un MP3 du téléphone ne s'écoutent que dans l'APK :
// le navigateur n'y a pas accès.
const ECOUTE_NATIVE = Capacitor.isNativePlatform()

const memeSon = (a: Son, b: Son) =>
  a.sorte === b.sorte &&
  (a.sorte !== 'cloche' || (b.sorte === 'cloche' && a.cloche === b.cloche)) &&
  (a.sorte !== 'mp3' || (b.sorte === 'mp3' && a.uri === b.uri))

// Le son d'un rappel : une des cloches de l'app (à écouter), le son de
// notification du téléphone ou un MP3 pris sur le téléphone ; et le vibreur.
export function ChoixSon({ id, nom, rappel, vibreurPossible, onChanger }: Props) {
  const { son } = rappel
  // Le choix refermé ou quitté, la cloche en train de sonner se tait.
  useEffect(() => () => void arreterEcoute(), [])

  const prendreMp3 = async () => {
    const choisi = await choisirMp3()
    if (choisi) onChanger({ son: choisi })
  }

  const option = (valeur: Son, libelle: string, extra?: ReactNode) => (
    <div className="choix-son-option" key={libelle}>
      <label>
        <input
          type="radio"
          name={`son-${id}`}
          checked={memeSon(son, valeur)}
          onChange={() => onChanger({ son: valeur })}
        />
        {libelle}
      </label>
      {extra}
    </div>
  )

  const ecoute = (valeur: Son, libelle: string) => (
    <button
      className="choix-son-ecouter"
      type="button"
      aria-label={`Écouter ${libelle}`}
      onClick={() => ecouter(valeur)}
    >
      <svg viewBox="0 0 12 14" aria-hidden="true">
        <path d="M1 1l10 6-10 6z" />
      </svg>
    </button>
  )

  return (
    <div id={id} className="choix-son">
      <div role="radiogroup" aria-label={`Son, ${nom}`}>
        <p className="choix-son-titre" aria-hidden="true">
          Son
        </p>
        {CLOCHES.map((cloche) => {
          const valeur: Son = { sorte: 'cloche', cloche }
          return option(valeur, NOMS_CLOCHES[cloche], ecoute(valeur, NOMS_CLOCHES[cloche]))
        })}
        {option(
          { sorte: 'telephone' },
          'Son du téléphone',
          ECOUTE_NATIVE && ecoute({ sorte: 'telephone' }, 'Son du téléphone'),
        )}
        {son.sorte === 'mp3' ? (
          option(
            son,
            son.nom,
            <>
              <button className="lien-discret" type="button" onClick={prendreMp3}>
                Changer
              </button>
              {ECOUTE_NATIVE && ecoute(son, son.nom)}
            </>,
          )
        ) : (
          <div className="choix-son-option">
            <label>
              <input type="radio" name={`son-${id}`} checked={false} onChange={prendreMp3} />
              Choisir un MP3…
            </label>
          </div>
        )}
      </div>
      {vibreurPossible && (
        <Interrupteur
          libelle="Vibreur"
          actif={rappel.vibreur}
          onBasculer={(vibreur) => onChanger({ vibreur })}
        />
      )}
    </div>
  )
}
