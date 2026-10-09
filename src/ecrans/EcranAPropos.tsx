import { useState, type ReactNode } from 'react'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour } from '../composants/retour'
import { Rubrique } from '../composants/Rubrique'
import './EcranAPropos.css'

type NomRubrique = 'textes' | 'chapelet' | 'cloches' | 'solaire'

// Texte validé par le porteur du projet (2026-10-06). La mention AELF est
// celle que l'AELF demande pour ses traductions. L'en-tête reste ouvert ;
// dessous, quatre rubriques repliées, pour rester lisible (2026-10-08).
export function EcranAPropos() {
  const retour = useRetour()
  const version = __VERSION__.split('.').slice(0, 2).join('.')
  const [ouvertes, setOuvertes] = useState(() => new Set<NomRubrique>())
  const rubrique = (nom: NomRubrique, titre: string, contenu: ReactNode) => (
    <Rubrique
      titre={titre}
      ouverte={ouvertes.has(nom)}
      onBasculer={() =>
        setOuvertes((avant) => {
          const apres = new Set(avant)
          if (!apres.delete(nom)) apres.add(nom)
          return apres
        })
      }
    >
      {contenu}
    </Rubrique>
  )
  return (
    <main className="a-propos">
      <LigneFermer onFermer={retour}>
        <h1>Avec Dieu</h1>
      </LigneFermer>
      <p className="a-propos-version">Version {version}</p>
      <p>Prier la liturgie des heures et le chapelet, au fil du jour.</p>
      <p>Gratuite, sans publicité, sans compte. Rien ne quitte votre téléphone.</p>
      <div className="a-propos-rubriques">
        {rubrique(
          'textes',
          'Textes',
          <>
            <p>
              Lectures bibliques : traduction liturgique de la Bible © AELF, Paris. Tous droits
              réservés.
            </p>
            <p>Notre Père : traduction liturgique de 2017.</p>
            <p>Credo du chapelet : Symbole des Apôtres.</p>
          </>,
        )}
        {/* Les sources de l'ordre de la fin du chapelet, texte validé par le
            porteur du projet (phase 16, 2026-10-08). */}
        {rubrique(
          'chapelet',
          'Chapelet et Rosaire',
          <>
            <p>
              Ordre de la fin du chapelet : celui des feuillets de prière en usage en France. Aucune
              règle officielle ne le fixe.
            </p>
            <p>
              Litanies de la Sainte Vierge : texte publié par le Saint-Siège, avec les invocations
              ajoutées en 2018 et 2020, au vous comme le Je vous salue Marie.
            </p>
            <p>
              En octobre, mois du Rosaire : les Litanies, demandées par Léon XIII en 1883 (
              <cite>Supremi apostolatus officio</cite>), et la prière à saint Joseph, qu’il a
              demandée en 1889 (<cite>Quamquam pluries</cite>).
            </p>
          </>,
        )}
        {/* Crédits exigés par les licences des enregistrements (phase 11). */}
        {rubrique(
          'cloches',
          'Cloches des rappels',
          <>
            <p>Enregistrements de Wikimedia Commons, raccourcis à 12 secondes :</p>
            <ul className="a-propos-credits">
              <li>Bourdon Marie de Notre-Dame de Paris, par NemesisIII (CC BY-SA 3.0) ;</li>
              <li>cloche Marcel de Notre-Dame de Paris, par M4RC3LNOTES (CC0) ;</li>
              <li>
                angélus de l’église Saint-Pierre de Saint-Pé-d’Ardet, par Tiasma31 (CC BY-SA 3.0).
              </li>
            </ul>
          </>,
        )}
        {/* Crédit exigé par la licence de GeoNames (phase 12), texte validé le 2026-10-07. */}
        {rubrique(
          'solaire',
          'Heures solaires',
          <p>
            Liste des villes de plus de 15 000 habitants : GeoNames (CC BY 4.0). Lever et coucher du
            soleil calculés sur le téléphone.
          </p>,
        )}
      </div>
    </main>
  )
}
