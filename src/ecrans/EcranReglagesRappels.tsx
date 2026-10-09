import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Bascule } from '../composants/Bascule'
import { LienSuite } from '../composants/LienSuite'
import { useDepuisIci } from '../composants/retour'
import { nommerLieu } from '../lieu/lieu'
import { useLieu } from '../lieu/useLieu'
import { calculerHeures } from '../office/heures'
import { estOfficeSolaire } from '../office/heuresSolaires'
import { dateDuJour } from '../office/dates'
import { AvisRappels } from '../rappels/AvisRappels'
import { avisDesRappels } from '../rappels/blocage'
import { reprogrammerBientot } from '../rappels/entretien'
import { LigneRappel } from '../rappels/LigneRappel'
import { lireRappels, modifierRappel, PRIERES_RAPPELEES } from '../rappels/reglages'
import { lireSolaire, modifierSolaire } from '../rappels/solaire'
import { dansLeLieu, NOMS_PRIERES, REPERES_SOLAIRES } from '../rappels/textes'
import { useAutorisations } from '../rappels/useAutorisations'
import { useEtatAndroid } from '../rappels/useEtatAndroid'
import { PageReglages } from '../reglages/PageReglages'
import { usePeutVibrer } from '../telephone/retours'
import '../rappels/Rappels.css'

const HEURES = [
  ['fixes', 'Fixes'],
  ['solaires', 'Solaires'],
] as const

// Réglages › Rappels (phases 11 et 12) : les avis quand Android ou la
// surcouche du fabricant bloque, le choix des heures fixes ou solaires, une
// ligne par prière (son nom ouvre sa page), et le guide de batterie sur
// Xiaomi et Samsung.
export function EcranReglagesRappels() {
  const vibreurPossible = usePeutVibrer()
  const naviguer = useNavigate()
  const [rappels, setRappels] = useState(lireRappels)
  const [solaire, setSolaire] = useState(lireSolaire)
  // Le lieu se choisit sur son propre écran ; en voyage, il change seul.
  const { lieu } = useLieu()
  const [android, relire] = useEtatAndroid()
  const { activer, fenetre } = useAutorisations(android, relire)
  const depuis = useDepuisIci()
  const solaires = solaire.actives && !!lieu
  const heures = calculerHeures(dateDuJour(new Date()), rappels, solaire, lieu)

  // Sans lieu, « Solaires » mène d'abord à l'écran du lieu ; en revenir sans
  // choisir garde les heures fixes.
  const choisirHeures = (choix: 'fixes' | 'solaires') => {
    if (choix === 'solaires' && !lieu) naviguer('/lieu', { state: { activer: true } })
    else setSolaire(modifierSolaire({ actives: choix === 'solaires' }))
  }

  const avis = avisDesRappels(rappels, android)
  // Le lien du guide, sauf quand l'avis de batterie le dit déjà.
  const guide =
    (android?.marque === 'xiaomi' || android?.marque === 'samsung') && !avis.includes('batterie')

  return (
    <PageReglages titre="Rappels">
      {/* Ce qui empêche les rappels d'arriver passe avant tout le reste : on
          arrive souvent ici depuis l'alerte de l'accueil. */}
      {avis.length > 0 && (
        <AvisRappels
          avis={avis}
          onMinuteOuverte={() => {
            relire()
            reprogrammerBientot()
          }}
        />
      )}

      <div className="rappels-heures">
        <h2 className="petit-titre" id="rappels-heures">
          Heures des prières
        </h2>
        <Bascule
          titre="rappels-heures"
          choix={HEURES}
          valeur={solaires ? 'solaires' : 'fixes'}
          onChoisir={choisirHeures}
        />
        {solaires && lieu && (
          <>
            <p className="choix-aide">
              Selon la course du soleil {dansLeLieu(lieu)}, du lever au coucher.
            </p>
            <LienSuite className="rappels-lieu" to="/lieu">
              Lieu : {nommerLieu(lieu)}
            </LienSuite>
          </>
        )}
      </div>

      <ul className="rappels">
        {PRIERES_RAPPELEES.map((priere) => (
          <LigneRappel
            key={priere}
            priere={priere}
            nom={NOMS_PRIERES[priere]}
            rappel={rappels[priere]}
            vibreurPossible={vibreurPossible}
            onChanger={(changement) => setRappels(modifierRappel(priere, changement))}
            onActiver={activer}
            solaire={
              solaires && estOfficeSolaire(priere)
                ? { heure: heures[priere], repere: REPERES_SOLAIRES[priere] }
                : undefined
            }
          />
        ))}
      </ul>

      {guide && (
        <LienSuite className="rappels-batterie" to="/reglages/rappels/batterie" state={depuis}>
          Rappels bloqués ? Régler la batterie
        </LienSuite>
      )}

      {fenetre}
    </PageReglages>
  )
}
