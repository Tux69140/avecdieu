import { useState } from 'react'
import { ChoixAffichage } from '../chapelet/ChoixAffichage'
import { AIDE_VIBRATIONS } from '../chapelet/libelles'
import { lireReglages, modifierReglages, type Reglages } from '../chapelet/reglages'
import { Interrupteur } from '../composants/Interrupteur'
import { useRetour } from '../composants/retour'
import { usePeutVibrer } from '../telephone/retours'
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

// Les réglages, retenus sur le téléphone : ceux du chapelet, puis ceux des offices.
export function EcranReglages() {
  const [reglages, setReglages] = useState(lireReglages)
  const retour = useRetour()
  // Sans vibreur (tablette), le réglage n'a pas lieu d'être.
  const vibreur = usePeutVibrer()
  const modifier = (changement: Partial<Reglages>) => setReglages(modifierReglages(changement))

  return (
    <main className="reglages">
      <button className="retour lien-discret" type="button" onClick={retour}>
        ‹ Retour
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
        {vibreur && (
          <div className="reglages-vibrations">
            <Interrupteur
              libelle="Vibrations"
              aide={AIDE_VIBRATIONS}
              actif={reglages.vibrations}
              onBasculer={(vibrations) => modifier({ vibrations })}
            />
          </div>
        )}
      </section>

      <section className="reglages-section" aria-labelledby="reglages-offices">
        <h2 id="reglages-offices">Offices</h2>
        <Interrupteur
          libelle="Accents de psalmodie"
          aide="Souligne les syllabes accentuées des psaumes et cantiques."
          actif={reglages.accents}
          onBasculer={(accents) => modifier({ accents })}
        />
        <Interrupteur
          libelle="Prières courantes en entier"
          aide="Notre Père, Gloire au Père et Je confesse à Dieu, écrits en entier sans avoir à les déplier."
          actif={reglages.prieresEntieres}
          onBasculer={(prieresEntieres) => modifier({ prieresEntieres })}
        />
        <Interrupteur
          libelle="Signaler les ajouts de l’app"
          aide="Un filet rouge marque ce que l’app ajoute au texte de l’AELF selon les rubriques."
          actif={reglages.signalerAjouts}
          onBasculer={(signalerAjouts) => modifier({ signalerAjouts })}
        />
      </section>
    </main>
  )
}
