import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { ANCRE_AUX_INTENTIONS, CE_MOIS_CI, intentionDuMois } from '../chapelet/intentionsDuPape'
import { AUX_INTENTIONS, CHAPELET_OU_ROSAIRE } from '../chapelet/libelles'
import { insecables } from '../chapelet/typographie'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour } from '../composants/retour'
import './EcranChapeletOuRosaire.css'

// « Chapelet ou Rosaire ? », ouverte du seuil : ce qui les distingue, puis
// l'histoire et le sens, pour le novice (texte validé, phase 17). Une page à
// part plutôt qu'une aide repliée : le porteur du projet refuse les éléments
// repliés sur le seuil (2026-10-08). En bas, après un filet, la prière aux
// intentions du Saint-Père et l'intention du mois (phase 18), où mène le lien
// du Notre Père qui la dit ; la croix y ramène, au grain exact.
export function EcranChapeletOuRosaire() {
  const retour = useRetour()
  const { hash } = useLocation()
  const [duMois] = useState(() => intentionDuMois(new Date()))
  const { titre, formes, paragraphes } = CHAPELET_OU_ROSAIRE
  // Après la remise en haut de tout nouvel écran (Racine), qui se fait avant.
  useEffect(() => {
    if (hash === `#${ANCRE_AUX_INTENTIONS}`)
      document.getElementById(ANCRE_AUX_INTENTIONS)?.scrollIntoView()
  }, [hash])
  return (
    <main className="chapelet-ou-rosaire">
      <LigneFermer onFermer={retour}>
        <h1>{titre}</h1>
      </LigneFermer>
      <div className="chapelet-ou-rosaire-formes">
        {formes.map(([nom, suite]) => (
          <p key={nom}>
            <strong>{nom}</strong>
            {suite}
          </p>
        ))}
      </div>
      {paragraphes.map((paragraphe) => (
        <p key={paragraphe.slice(0, 20)}>{paragraphe}</p>
      ))}
      <section
        id={ANCRE_AUX_INTENTIONS}
        className="chapelet-ou-rosaire-saint-pere"
        aria-labelledby="titre-aux-intentions"
      >
        <h2 className="petit-titre" id="titre-aux-intentions">
          {AUX_INTENTIONS.titre}
        </h2>
        {AUX_INTENTIONS.paragraphes.map((paragraphe) => (
          <p key={paragraphe.slice(0, 20)}>{paragraphe}</p>
        ))}
        {/* Sans intention connue pour le mois, rien. */}
        {duMois && (
          <p data-testid="intention-du-mois">
            <strong>{insecables(CE_MOIS_CI)}</strong> {duMois.texte}
          </p>
        )}
      </section>
    </main>
  )
}
