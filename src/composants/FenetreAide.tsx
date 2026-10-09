import { useId, useRef, useState, type ReactNode } from 'react'
import { useFenetreModale } from './useFenetreModale'
import './FenetreAide.css'

interface Props {
  titre: string
  // L'aide de l'office, plus serrée, ajoute sa classe.
  className?: string
  // « Ne plus afficher » coché, à la fermeture : l'aide ne revient plus.
  onMasquer: () => void
  onFermer: () => void
  children: ReactNode
}

// Une fenêtre d'aide, pour qui découvre l'app : une ligne par geste ou par
// signe, puis « Ne plus afficher » et « J’ai compris ». Elle revient tant que
// « Ne plus afficher » n'est pas coché.
export function FenetreAide({ titre, className, onMasquer, onFermer, children }: Props) {
  const fenetre = useRef<HTMLDialogElement>(null)
  const compris = useRef<HTMLButtonElement>(null)
  const idTitre = useId()
  const [nePlus, setNePlus] = useState(false)
  // Le focus sur « J’ai compris » : sur la case, un appui sur Espace
  // écarterait l'aide pour de bon.
  useFenetreModale(fenetre, { focus: compris })

  const fermer = () => {
    if (nePlus) onMasquer()
    onFermer()
  }

  return (
    <dialog
      ref={fenetre}
      className={className ? `fenetre-aide ${className}` : 'fenetre-aide'}
      aria-labelledby={idTitre}
      onClose={fermer}
    >
      <h2 id={idTitre}>{titre}</h2>
      <ul>{children}</ul>
      <label className="ne-plus">
        <input type="checkbox" checked={nePlus} onChange={(e) => setNePlus(e.target.checked)} />
        Ne plus afficher
      </label>
      <button
        ref={compris}
        className="btn btn-principal"
        type="button"
        onClick={() => fenetre.current?.close()}
      >
        J’ai compris
      </button>
    </dialog>
  )
}

// Une ligne de l'aide : l'icône (dessin ou signes), puis l'explication.
export function LigneAide({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <li>
      {icone}
      <span>{children}</span>
    </li>
  )
}

// Des signes en guise d'icône : ℣ ℟, « Aa », « * + »…
export function GlypheAide({ sorte, children }: { sorte?: string; children: ReactNode }) {
  return (
    <span className={sorte ? `aide-glyphe ${sorte}` : 'aide-glyphe'} aria-hidden="true">
      {children}
    </span>
  )
}

// Les lignes communes aux deux aides (textes validés par le porteur du projet).

export function AideMarques() {
  return (
    <LigneAide icone={<GlypheAide sorte="aide-marques">℣ ℟</GlypheAide>}>
      <strong>℣.</strong> celui qui mène, <strong>℟.</strong> ceux qui répondent. Seul, on dit les
      deux.
    </LigneAide>
  )
}

export function AideGras() {
  return (
    <LigneAide icone={<GlypheAide sorte="aide-gras">Aa</GlypheAide>}>
      <strong>En gras</strong>, ce que disent tous.
    </LigneAide>
  )
}

export function AidePincement() {
  return (
    <LigneAide
      icone={
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M17 17L7 7M7 15V7h8M23 23l10 10M33 25v8h-8" />
        </svg>
      }
    >
      <strong>Ecartez deux doigts</strong> pour agrandir le texte.
    </LigneAide>
  )
}
