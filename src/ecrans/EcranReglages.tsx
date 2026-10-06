import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChoixAffichage } from '../chapelet/ChoixAffichage'
import { AIDE_VIBRATIONS } from '../chapelet/libelles'
import { lireReglages, modifierReglages, type Reglages } from '../chapelet/reglages'
import { Interrupteur } from '../composants/Interrupteur'
import './EcranReglages.css'

type Bascule = 'annonce' | 'oMonJesus' | 'salveRegina' | 'plusieurs'

const BASCULES: [Bascule, string, string?][] = [
  ['annonce', 'Annonce des mystères', 'Titre, fruit et Lecture avant chaque dizaine.'],
  ['oMonJesus', '« Ô mon Jésus » après chaque dizaine'],
  ['salveRegina', 'Salve Regina à la fin'],
  [
    'plusieurs',
    'Prier à plusieurs',
    'Marque en rouge la part de celui qui mène (V/) et la réponse des autres (R/).',
  ],
]

// Les réglages, retenus sur le téléphone et repris au chapelet suivant. Les
// offices y ajouteront les leurs.
export function EcranReglages() {
  const [reglages, setReglages] = useState(lireReglages)
  const naviguer = useNavigate()
  const modifier = (changement: Partial<Reglages>) => setReglages(modifierReglages(changement))
  // Revenir d'où l'on vient ; ouvert directement, l'écran mène au chapelet.
  const retour = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) naviguer(-1)
    else naviguer('/chapelet', { replace: true })
  }

  return (
    <main className="reglages">
      <button className="reglages-retour lien-discret" type="button" onClick={retour}>
        ‹ Retour au chapelet
      </button>
      <h1>Réglages</h1>

      <section className="reglages-section" aria-labelledby="reglages-chapelet">
        <h2 id="reglages-chapelet">Chapelet</h2>
        {BASCULES.map(([cle, libelle, aide]) => (
          <Interrupteur
            key={cle}
            libelle={libelle}
            aide={aide}
            actif={reglages[cle]}
            onBasculer={(actif) => modifier({ [cle]: actif })}
          />
        ))}
        <h3 id="reglages-affichage">Affichage des prières</h3>
        <ChoixAffichage
          titre="reglages-affichage"
          affichage={reglages.affichage}
          onChoisir={(affichage) => modifier({ affichage })}
        />
        <div className="reglages-vibrations">
          <Interrupteur
            libelle="Vibrations"
            aide={AIDE_VIBRATIONS}
            actif={reglages.vibrations}
            onBasculer={(vibrations) => modifier({ vibrations })}
          />
        </div>
      </section>
    </main>
  )
}
