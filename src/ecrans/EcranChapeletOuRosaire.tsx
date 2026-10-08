import { CHAPELET_OU_ROSAIRE } from '../chapelet/libelles'
import { LigneFermer } from '../composants/LigneFermer'
import { useRetour } from '../composants/retour'
import './EcranChapeletOuRosaire.css'

// « Chapelet ou Rosaire ? », ouverte du seuil : ce qui les distingue, puis
// l'histoire et le sens, pour le novice (texte validé, phase 17). Une page à
// part plutôt qu'une aide repliée : le porteur du projet refuse les éléments
// repliés sur le seuil (2026-10-08).
export function EcranChapeletOuRosaire() {
  const retour = useRetour()
  const { titre, formes, paragraphes } = CHAPELET_OU_ROSAIRE
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
    </main>
  )
}
