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
    </main>
  )
}
