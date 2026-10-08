import { useState } from 'react'
import { LigneFermer } from '../composants/LigneFermer'
import { LignePage } from '../composants/LignePage'
import { useRetour } from '../composants/retour'
import { useLieu } from '../lieu/useLieu'
import { rappelsBloques } from '../rappels/blocage'
import { lireRappels } from '../rappels/reglages'
import { lireSolaire } from '../rappels/solaire'
import { RAPPELS_BLOQUES, resumerRappels } from '../rappels/textes'
import { useEtatAndroid } from '../rappels/useEtatAndroid'
import './EcranReglages.css'

// Les réglages, en pages emboîtées comme les Paramètres d'Android
// (arborescence validée par le porteur du projet, 2026-10-08) : chaque ligne
// ouvre sa page, dont la croix remonte ici. Les rappels en tête, car le
// téléphone peut les bloquer en silence ; résumés validés le 2026-10-07.
export function EcranReglages() {
  const retour = useRetour()
  const [rappels] = useState(lireRappels)
  const [solaire] = useState(lireSolaire)
  // Le lieu se choisit sur son propre écran ; en voyage, il change seul.
  const { lieu } = useLieu()
  const [android] = useEtatAndroid()
  const bloques = rappelsBloques(rappels, android)

  return (
    <main className="reglages">
      <LigneFermer onFermer={retour}>
        <h1>Réglages</h1>
      </LigneFermer>

      <nav className="reglages-liste" aria-label="Réglages">
        {/* Le résumé, en brun brique quand le téléphone bloque les rappels,
            est caché au lecteur d'écran ; la phrase cachée le lui dit. */}
        <div className="reglages-rappels" data-bloques={bloques ? 'oui' : undefined}>
          {bloques && <p className="cache-a-l-oeil">{RAPPELS_BLOQUES}.</p>}
          <LignePage
            vers="/reglages/rappels"
            nom="Rappels"
            resume={
              bloques ? `⚠ ${RAPPELS_BLOQUES}` : resumerRappels(rappels, solaire.actives && !!lieu)
            }
            resumeCache
          />
        </div>
        <LignePage
          vers="/reglages/chapelet"
          nom="Chapelet"
          resume="Annonce, prières, vibrations"
          resumeCache
        />
        <LignePage
          vers="/reglages/offices"
          nom="Offices"
          resume="Zone, accents, textes hors connexion"
          resumeCache
        />
        <LignePage
          vers="/reglages/affichage"
          nom="Affichage"
          resume="Taille du texte, thème"
          resumeCache
        />
      </nav>

      {/* A l'écart des autres : sa page explique tout avant d'effacer. */}
      <div className="reglages-liste reglages-reinitialiser">
        <LignePage vers="/reglages/reinitialiser" nom="Réinitialiser l’app" />
      </div>
    </main>
  )
}
