import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { Interrupteur } from '../composants/Interrupteur'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour } from '../composants/retour'
import {
  changerActualisation,
  choisirLieu,
  deplacementNotable,
  nommerLieu,
  type LieuChoisi,
} from '../lieu/lieu'
import { chargerVilles, chercherVilles, decrireVille, type Ville } from '../lieu/villes'
import { useLieu } from '../lieu/useLieu'
import { lieuDeLaPosition } from '../lieu/voyage'
import { modifierSolaire } from '../rappels/solaire'
import { localiser } from '../telephone/position'
import { ouvrirFicheApp } from '../telephone/sonnerie'
import './EcranLieu.css'

type Erreur = 'refusee' | 'introuvable'

// Le lieu des heures solaires (/lieu), textes validés par le porteur du projet
// (2026-10-07) : « Me localiser » par le GPS, ou une ville de la liste
// embarquée ; rien ne quitte le téléphone. Ouvert par « Solaires » sans lieu
// connu, il passe aux heures solaires dès qu'un lieu est choisi.
export function EcranLieu() {
  const retour = useRetour()
  const activer = (useLocation().state as { activer?: boolean } | null)?.activer === true
  const { lieu, actualiser } = useLieu()
  const [villes, setVilles] = useState<Ville[]>()
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState<Erreur>()
  const [cherche, setCherche] = useState(false)

  useEffect(() => {
    chargerVilles()
      .then(setVilles)
      .catch(() => setVilles([]))
  }, [])

  const resultats = villes ? chercherVilles(villes, saisie) : []
  const introuvable = villes !== undefined && saisie.trim().length >= 2 && resultats.length === 0

  const retenir = (choisi: LieuChoisi) => {
    choisirLieu(choisi)
    if (activer) modifierSolaire({ actives: true })
    retour()
  }

  // La position du GPS ; rend celle-ci, ou rien après avoir affiché l'erreur.
  const trouverPosition = async () => {
    setErreur(undefined)
    setCherche(true)
    const resultat = await localiser()
    setCherche(false)
    if (resultat.sorte === 'trouvee') return resultat.position
    setErreur(resultat.sorte)
  }

  const meLocaliser = async () => {
    const position = await trouverPosition()
    if (position) retenir(lieuDeLaPosition(position, villes ?? (await chargerVilles())))
  }

  // L'option de voyage : la position est demandée tout de suite, pour que
  // l'accord d'Android se donne ici plutôt qu'à une ouverture de l'app.
  const basculerActualisation = async (active: boolean) => {
    if (active) {
      const position = await trouverPosition()
      if (!position) return
      if (lieu && deplacementNotable(lieu, position))
        choisirLieu(lieuDeLaPosition(position, villes ?? []))
    }
    changerActualisation(active)
  }

  return (
    <main className="lieu">
      <LigneFermer onFermer={retour}>
        <h1>Lieu des heures solaires</h1>
      </LigneFermer>

      <button
        className="btn btn-principal lieu-localiser"
        type="button"
        aria-busy={cherche}
        disabled={cherche}
        onClick={meLocaliser}
      >
        Me localiser
      </button>
      <p className="choix-aide">Une seule fois. La position reste sur le téléphone.</p>

      {erreur === 'refusee' && (
        <div className="lieu-erreur" role="alert">
          <p>
            <span aria-hidden="true">⚠ </span>Android refuse l’accès à la position. Cherchez plutôt
            une ville, ou autorisez la position dans les Paramètres du téléphone.
          </p>
          <button className="btn btn-secondaire" type="button" onClick={ouvrirFicheApp}>
            Ouvrir les Paramètres du téléphone
          </button>
        </div>
      )}
      {erreur === 'introuvable' && (
        <p className="lieu-erreur" role="alert">
          <span aria-hidden="true">⚠ </span>La position n’a pas pu être trouvée. Vérifiez que la
          localisation du téléphone est allumée, ou cherchez une ville.
        </p>
      )}

      <p className="petit-titre lieu-ou">ou</p>

      <input
        className="lieu-champ"
        type="search"
        placeholder="Chercher une ville"
        aria-label="Chercher une ville"
        autoComplete="off"
        value={saisie}
        onChange={(e) => setSaisie(e.target.value)}
      />
      {resultats.length > 0 && (
        <ul className="lieu-villes" aria-label="Villes trouvées">
          {resultats.map((ville) => (
            <li key={`${ville.nom}-${ville.latitude}-${ville.longitude}`}>
              <button
                type="button"
                onClick={() =>
                  retenir({
                    nom: ville.nom,
                    pres: false,
                    latitude: ville.latitude,
                    longitude: ville.longitude,
                  })
                }
              >
                <span className="lieu-ville">{ville.nom}</span>
                <span className="lieu-detail"> · {decrireVille(ville)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {introuvable && (
        <p className="lieu-erreur" role="alert">
          <span aria-hidden="true">⚠ </span>Aucune ville de ce nom dans la liste. Essayez une ville
          voisine de plus de 15 000 habitants, ou « Me localiser ».
        </p>
      )}

      {lieu && (
        <div className="lieu-actuel">
          <p data-testid="lieu-actuel">Lieu actuel : {nommerLieu(lieu)}</p>
          <Interrupteur
            libelle="Actualiser à chaque ouverture"
            aide="Au-delà de 50 km, l’app recalcule les heures."
            actif={actualiser}
            onBasculer={basculerActualisation}
          />
        </div>
      )}
    </main>
  )
}
