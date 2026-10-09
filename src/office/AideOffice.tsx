import {
  AideGras,
  AideMarques,
  AidePincement,
  FenetreAide,
  GlypheAide,
  LigneAide,
} from '../composants/FenetreAide'
import type { CouleurLiturgique } from './modele'
import { masquerAideOffice } from './aide'
import './AideOffice.css'

interface Props {
  // La perle d'exemple prend la couleur du jour.
  couleur?: CouleurLiturgique
  // Une ligne n'explique que ce qui se voit : accents, filet, prières repliées.
  accents: boolean
  ajouts: boolean
  repliees: boolean
  // À plusieurs, la part de tous est en demi-gras.
  plusieurs: boolean
  onFermer: () => void
}

// Ce que veulent dire les perles et les signes rouges, pour qui découvre
// l'office (textes validés par le porteur du projet, 2026-10-08). Comme l'aide
// aux gestes du chapelet, elle revient à chaque office tant que « Ne plus
// afficher » n'est pas coché.
export function AideOffice({ couleur, accents, ajouts, repliees, plusieurs, onFermer }: Props) {
  return (
    <FenetreAide
      titre="Lire un office"
      className="aide-office"
      onMasquer={masquerAideOffice}
      onFermer={onFermer}
    >
      <LigneAide
        icone={
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="8" cy="20" r="6" className="halo" />
            <circle cx="8" cy="20" r="4" className="soleil" />
            <circle cx="21" cy="20" r="3" />
            <circle cx="33" cy="20" r="3" />
          </svg>
        }
      >
        <strong>Les perles sous le titre</strong> : où vous en êtes. Touchez-les pour aller à une
        autre partie.
      </LigneAide>
      <LigneAide
        icone={
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M2 20h11M27 20h11" className="filet" />
            <circle cx="20" cy="20" r="5" className="perle" data-couleur={couleur ?? 'vert'} />
          </svg>
        }
      >
        <strong>La perle entre deux parties</strong> prend la couleur du jour liturgique : vert,
        blanc, rouge, violet ou rose.
      </LigneAide>
      <AideMarques />
      {plusieurs && <AideGras />}
      <LigneAide icone={<GlypheAide>* +</GlypheAide>}>
        <strong>*</strong> et <strong>+</strong> : une pause dans le verset.
        {accents && ' Une syllabe soulignée porte l’accent.'}
      </LigneAide>
      {ajouts && (
        <LigneAide
          icone={
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path d="M8 8v24" className="rouge" />
              <path d="M15 14h18M15 20h18M15 26h12" className="filet" />
            </svg>
          }
        >
          <strong>Un filet rouge</strong> dans la marge : un texte que l’app ajoute ou répète selon
          les règles de la liturgie.
        </LigneAide>
      )}
      {repliees && (
        <LigneAide icone={<GlypheAide sorte="aide-suite">…</GlypheAide>}>
          <strong>« … »</strong> en fin de ligne : touchez pour lire la prière en entier.
        </LigneAide>
      )}
      <AidePincement />
      <LigneAide
        icone={
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M10 26a10 10 0 0 1 20 0" className="soleil" />
            <path d="M4 26h32" />
          </svg>
        }
      >
        <strong>L’invitatoire</strong> ouvre le premier office de la journée ; un seul office le
        dit.
      </LigneAide>
    </FenetreAide>
  )
}
