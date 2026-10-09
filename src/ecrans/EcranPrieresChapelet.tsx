import { useLocation } from 'react-router'
import type { Reglages } from '../chapelet/reglages'
import { ReglagesCloture } from '../chapelet/ReglagesCloture'
import { Interrupteur } from '../composants/Interrupteur'
import type { DepuisParente } from '../composants/retour'
import { PageReglages } from '../reglages/PageReglages'
import { useReglages } from '../reglages/useReglages'

type Bascule = 'annonce' | 'oMonJesus' | 'intentions'

// Les réglages oui ou non de l'ouverture et des dizaines (libellés validés le
// 2026-10-07) ; la fin du chapelet a sa propre liste (ReglagesCloture).
const OUVERTURE: [Bascule, string, string?][] = [
  [
    'intentions',
    'Intentions des trois premiers Je vous salue Marie',
    'La foi, l’espérance, la charité.',
  ],
]
const CHAQUE_DIZAINE: [Bascule, string, string?][] = [
  ['annonce', 'Annonce des mystères', 'Titre, fruit et passage avant chaque dizaine.'],
  ['oMonJesus', '« Ô mon Jésus » après chaque dizaine'],
]

// Réglages › Chapelet › Prières du chapelet : ce qui se dit, dans l'ordre du
// chapelet (arborescence validée par le porteur du projet, 2026-10-08).
// Ouverte du seuil du Rosaire, elle en prend le nom ; les réglages sont les
// mêmes (2026-10-09).
export function EcranPrieresChapelet() {
  const [reglages, modifier] = useReglages()
  const depuis = useLocation().state as DepuisParente | null
  const titre = depuis?.rosaire ? 'Prières du Rosaire' : 'Prières du chapelet'
  const interrupteurs = (liste: [Bascule, string, string?][]) =>
    liste.map(([cle, libelle, aide]) => (
      <Interrupteur
        key={cle}
        libelle={libelle}
        aide={aide}
        actif={reglages[cle]}
        onBasculer={(actif) => modifier({ [cle]: actif } satisfies Partial<Reglages>)}
      />
    ))
  return (
    <PageReglages titre={titre} parente="/reglages/chapelet">
      <h2>Ouverture</h2>
      {interrupteurs(OUVERTURE)}
      <h2>Chaque dizaine</h2>
      {interrupteurs(CHAQUE_DIZAINE)}
      <ReglagesCloture reglages={reglages} onModifier={modifier} />
    </PageReglages>
  )
}
