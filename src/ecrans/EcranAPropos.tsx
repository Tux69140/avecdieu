import { useRetour } from '../composants/retour'
import './EcranAPropos.css'

// Texte validé par le porteur du projet (2026-10-06). La mention AELF est
// celle que l'AELF demande pour ses traductions.
export function EcranAPropos() {
  const retour = useRetour()
  const version = __VERSION__.split('.').slice(0, 2).join('.')
  return (
    <main className="a-propos">
      <button className="retour lien-discret" type="button" onClick={retour}>
        ‹ Retour
      </button>
      <h1>Avec Dieu</h1>
      <p className="a-propos-version">Version {version}</p>
      <p>Prier la liturgie des heures et le chapelet, au fil du jour.</p>
      <p>Gratuite, sans publicité, sans compte. Rien ne quitte votre téléphone.</p>
      <h2>Textes</h2>
      <p>
        Lectures bibliques : traduction liturgique de la Bible © AELF, Paris. Tous droits réservés.
      </p>
      <p>Notre Père : traduction liturgique de 2017.</p>
      <p>Credo du chapelet : Symbole des Apôtres.</p>
      {/* Crédits exigés par les licences des enregistrements (phase 11). */}
      <h2>Cloches des rappels</h2>
      <p>Enregistrements de Wikimedia Commons, raccourcis à 12 secondes :</p>
      <ul className="a-propos-credits">
        <li>Bourdon Marie de Notre-Dame de Paris, par NemesisIII (CC BY-SA 3.0) ;</li>
        <li>cloche Marcel de Notre-Dame de Paris, par M4RC3LNOTES (CC0) ;</li>
        <li>angélus de l’église Saint-Pierre de Saint-Pé-d’Ardet, par Tiasma31 (CC BY-SA 3.0).</li>
      </ul>
      {/* Crédit exigé par la licence de GeoNames (phase 12), texte validé le 2026-10-07. */}
      <h2>Heures solaires</h2>
      <p>
        Liste des villes de plus de 15 000 habitants : GeoNames (CC BY 4.0). Lever et coucher du
        soleil calculés sur le téléphone.
      </p>
    </main>
  )
}
