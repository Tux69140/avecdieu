import { useState } from 'react'
import { useLocation } from 'react-router'
import { changerDeZone, textesEnregistres } from '../aelf/reserve'
import { type Zone } from '../aelf/zones'
import { ChoixTaille } from '../affichage/ChoixTaille'
import { ChoixAffichage } from '../chapelet/ChoixAffichage'
import { AIDE_VIBRATIONS } from '../chapelet/libelles'
import { aideAMontrer, masquerAide, montrerAide } from '../chapelet/memoire'
import { lireReglages, modifierReglages, type Reglages, type Theme } from '../chapelet/reglages'
import { Bascule as ChoixBascule } from '../composants/Bascule'
import { Interrupteur } from '../composants/Interrupteur'
import { useRetour } from '../composants/retour'
import { Rubrique } from '../composants/Rubrique'
import { dateLisible } from '../office/dates'
import { useLieu } from '../lieu/useLieu'
import { rappelsBloques } from '../rappels/blocage'
import { lireRappels, modifierRappel } from '../rappels/reglages'
import { lireSolaire, modifierSolaire } from '../rappels/solaire'
import { RubriqueRappels } from '../rappels/RubriqueRappels'
import { ChoixZone } from '../reglages/ChoixZone'
import { Reinitialiser } from '../reglages/Reinitialiser'
import { RAPPELS_BLOQUES, resumerRappels } from '../rappels/textes'
import { useEtatAndroid } from '../rappels/useEtatAndroid'
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

const THEMES = [
  ['automatique', 'Automatique'],
  ['jour', 'Jour'],
  ['nuit', 'Nuit'],
] as const satisfies readonly (readonly [Theme, string])[]

export type NomRubrique = 'affichage' | 'chapelet' | 'offices' | 'rappels'

// Les rubriques ouvertes, retenues tant que l'app reste ouverte : toutes
// fermées au lancement (décision du porteur du projet, 2026-10-07).
const ouvertes = new Set<NomRubrique>()

// Les réglages, retenus sur le téléphone, en quatre rubriques : les rappels en
// tête, car le téléphone peut les bloquer en silence (2026-10-08), puis
// l'affichage, le chapelet et les offices (libellés validés le 2026-10-07).
// Un écran qui y mène peut demander d'ouvrir une rubrique (`state.rubrique`).
export function EcranReglages() {
  const [reglages, setReglages] = useState(lireReglages)
  const demandee = (useLocation().state as { rubrique?: NomRubrique } | null)?.rubrique
  const [, setOuvertes] = useState(() => {
    if (demandee) ouvertes.add(demandee)
    return new Set(ouvertes)
  })
  const retour = useRetour()
  // Sans vibreur (tablette), le réglage n'a pas lieu d'être.
  const vibreur = usePeutVibrer()
  const modifier = (changement: Partial<Reglages>) => setReglages(modifierReglages(changement))
  const [enregistres, setEnregistres] = useState(textesEnregistres)
  const [rappels, setRappels] = useState(lireRappels)
  const [solaire, setSolaire] = useState(lireSolaire)
  const [aide, setAide] = useState(aideAMontrer)
  // Le lieu se choisit sur son propre écran ; en voyage, il change seul.
  const { lieu } = useLieu()
  const [android, relireAndroid] = useEtatAndroid()
  const bloques = rappelsBloques(rappels, android)

  const rubrique = (nom: NomRubrique) => ({
    ouverte: ouvertes.has(nom),
    onBasculer: () => {
      if (!ouvertes.delete(nom)) ouvertes.add(nom)
      setOuvertes(new Set(ouvertes))
    },
  })

  // Une autre zone : les textes enregistrés sont oubliés, puis refaits.
  const choisirZone = (zone: Zone) => {
    setReglages(changerDeZone(zone))
    setEnregistres(textesEnregistres())
  }

  return (
    <main className="reglages">
      <button className="retour lien-discret" type="button" onClick={retour}>
        ‹ Retour
      </button>
      <h1>Réglages</h1>

      <div className="reglages-rubriques">
        {/* Le résumé, en brun brique quand le téléphone bloque les rappels,
            est caché au lecteur d'écran ; la phrase cachée le lui dit. */}
        <div className="reglages-rappels" data-bloques={bloques ? 'oui' : undefined}>
          {bloques && <p className="cache-a-l-oeil">{RAPPELS_BLOQUES}.</p>}
          <Rubrique
            titre="Rappels"
            resume={
              bloques ? `⚠ ${RAPPELS_BLOQUES}` : resumerRappels(rappels, solaire.actives && !!lieu)
            }
            {...rubrique('rappels')}
          >
            <RubriqueRappels
              rappels={rappels}
              onChanger={(priere, changement) => setRappels(modifierRappel(priere, changement))}
              solaire={solaire}
              lieu={lieu}
              onChangerSolaire={(changement) => setSolaire(modifierSolaire(changement))}
              android={android}
              relire={relireAndroid}
            />
          </Rubrique>
        </div>

        <Rubrique titre="Affichage" resume="Taille du texte, thème" {...rubrique('affichage')}>
          <h3 id="reglages-taille">Taille du texte</h3>
          <ChoixTaille
            titre="reglages-taille"
            taille={reglages.tailleTexte}
            onChoisir={(tailleTexte) => modifier({ tailleTexte })}
          />
          <h3 id="reglages-theme">Thème</h3>
          <ChoixBascule
            titre="reglages-theme"
            choix={THEMES}
            valeur={reglages.theme}
            onChoisir={(theme) => modifier({ theme })}
          />
          <p className="choix-aide">
            Automatique : nuit après le coucher du soleil, ou si le téléphone est en mode sombre.
          </p>
        </Rubrique>

        <Rubrique titre="Chapelet" resume="Annonce, prières, vibrations" {...rubrique('chapelet')}>
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
          <div className="reglages-gestes">
            {vibreur && (
              <Interrupteur
                libelle="Vibrations"
                aide={AIDE_VIBRATIONS}
                actif={reglages.vibrations}
                onBasculer={(vibrations) => modifier({ vibrations })}
              />
            )}
            <Interrupteur
              libelle="Aide aux gestes"
              aide="Au début du chapelet, rappelle comment avancer et revenir en arrière."
              actif={aide}
              onBasculer={(actif) => {
                if (actif) montrerAide()
                else masquerAide()
                setAide(actif)
              }}
            />
          </div>
        </Rubrique>

        <Rubrique
          titre="Offices"
          resume="Zone, accents, textes hors connexion"
          {...rubrique('offices')}
        >
          <ChoixZone zone={reglages.zone} textesGardes={!!enregistres} onChoisir={choisirZone} />
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
          <p className="reglages-note" data-testid="hors-connexion">
            {enregistres
              ? `Textes disponibles hors connexion jusqu’au ${dateLisible(enregistres.fin)}.`
              : 'Aucun texte enregistré pour l’instant.'}
          </p>
        </Rubrique>
      </div>
      <Reinitialiser />
    </main>
  )
}
