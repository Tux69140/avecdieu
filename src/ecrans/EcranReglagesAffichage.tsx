import { ChoixTaille } from '../affichage/ChoixTaille'
import type { Theme } from '../chapelet/reglages'
import { Bascule } from '../composants/Bascule'
import { PageReglages } from '../reglages/PageReglages'
import { useReglages } from '../reglages/useReglages'

const THEMES = [
  ['automatique', 'Automatique'],
  ['jour', 'Jour'],
  ['nuit', 'Nuit'],
] as const satisfies readonly (readonly [Theme, string])[]

// Réglages › Affichage : la taille du texte à prier et le thème (libellés
// validés le 2026-10-07).
export function EcranReglagesAffichage() {
  const [reglages, modifier] = useReglages()
  return (
    <PageReglages titre="Affichage" parente="/reglages">
      <h2 id="reglages-taille">Taille du texte</h2>
      <ChoixTaille
        titre="reglages-taille"
        taille={reglages.tailleTexte}
        onChoisir={(tailleTexte) => modifier({ tailleTexte })}
      />
      <h2 id="reglages-theme">Thème</h2>
      <Bascule
        titre="reglages-theme"
        choix={THEMES}
        valeur={reglages.theme}
        onChoisir={(theme) => modifier({ theme })}
      />
      <p className="choix-aide">
        Automatique : nuit après le coucher du soleil, ou si le téléphone est en mode sombre.
      </p>
    </PageReglages>
  )
}
