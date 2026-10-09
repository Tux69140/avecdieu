import { useEffect, type ReactNode } from 'react'
import { arreterEcoute, choisirMp3, ecouteNative, ecouter } from '../telephone/sonnerie'
import { CLOCHES, NOMS_CLOCHES, type Rappel, type Son } from './reglages'
import { nomDuSon } from './textes'

interface Props {
  id: string
  nom: string
  rappel: Rappel
  onChanger: (changement: Partial<Rappel>) => void
}

const ECOUTE_NATIVE = ecouteNative()
const TELEPHONE: Son = { sorte: 'telephone' }

const memeSon = (a: Son, b: Son) =>
  a.sorte === b.sorte &&
  (a.sorte !== 'cloche' || (b.sorte === 'cloche' && a.cloche === b.cloche)) &&
  (a.sorte !== 'mp3' || (b.sorte === 'mp3' && a.uri === b.uri))

// Le son d'un rappel, sur sa page : une des cloches de l'app (à écouter), le son de
// notification du téléphone ou un MP3 pris sur le téléphone.
export function ChoixSon({ id, nom, rappel, onChanger }: Props) {
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
      aria-label={`Ecouter ${libelle}`}
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
        {CLOCHES.map((cloche) => {
          const valeur: Son = { sorte: 'cloche', cloche }
          return option(valeur, NOMS_CLOCHES[cloche], ecoute(valeur, NOMS_CLOCHES[cloche]))
        })}
        {option(
          TELEPHONE,
          nomDuSon(TELEPHONE),
          ECOUTE_NATIVE && ecoute(TELEPHONE, nomDuSon(TELEPHONE)),
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
    </div>
  )
}
