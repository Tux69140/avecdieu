import { useEffect, useRef, useState } from 'react'
import type { CouleurLiturgique } from './modele'
import { masquerAideOffice } from './aide'
import '../chapelet/AideGestes.css'
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
  const fenetre = useRef<HTMLDialogElement>(null)
  const compris = useRef<HTMLButtonElement>(null)
  const [nePlus, setNePlus] = useState(false)

  // Le focus sur « J’ai compris » : sur la case, un appui sur Espace
  // écarterait l'aide pour de bon.
  useEffect(() => {
    const dialogue = fenetre.current
    if (dialogue && !dialogue.open) dialogue.showModal?.()
    compris.current?.focus()
  }, [])

  const fermer = () => {
    if (nePlus) masquerAideOffice()
    onFermer()
  }

  return (
    <dialog
      ref={fenetre}
      className="aide-gestes aide-office"
      aria-labelledby="aide-office-titre"
      onClose={fermer}
    >
      <h2 id="aide-office-titre">Lire un office</h2>
      <ul>
        <li>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="8" cy="20" r="6" className="halo" />
            <circle cx="8" cy="20" r="4" className="soleil" />
            <circle cx="21" cy="20" r="3" />
            <circle cx="33" cy="20" r="3" />
          </svg>
          <span>
            <strong>Les perles sous le titre</strong> : où vous en êtes. Touchez-les pour aller à
            une autre partie.
          </span>
        </li>
        <li>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M2 20h11M27 20h11" className="filet" />
            <circle cx="20" cy="20" r="5" className="perle" data-couleur={couleur ?? 'vert'} />
          </svg>
          <span>
            <strong>La perle entre deux parties</strong> prend la couleur du jour liturgique : vert,
            blanc, rouge, violet ou rose.
          </span>
        </li>
        <li>
          <span className="aide-glyphe aide-marques" aria-hidden="true">
            ℣ ℟
          </span>
          <span>
            <strong>℣.</strong> celui qui mène, <strong>℟.</strong> ceux qui répondent. Seul, on dit
            les deux.
          </span>
        </li>
        {plusieurs && (
          <li>
            <span className="aide-glyphe aide-gras" aria-hidden="true">
              Aa
            </span>
            <span>
              <strong>En gras</strong>, ce que disent tous.
            </span>
          </li>
        )}
        <li>
          <span className="aide-glyphe" aria-hidden="true">
            * +
          </span>
          <span>
            <strong>*</strong> et <strong>+</strong> : une pause dans le verset.
            {accents && ' Une syllabe soulignée porte l’accent.'}
          </span>
        </li>
        {ajouts && (
          <li>
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path d="M8 8v24" className="rouge" />
              <path d="M15 14h18M15 20h18M15 26h12" className="filet" />
            </svg>
            <span>
              <strong>Un filet rouge</strong> dans la marge : un texte que l’app ajoute ou répète
              selon les règles de la liturgie.
            </span>
          </li>
        )}
        {repliees && (
          <li>
            <span className="aide-glyphe aide-suite" aria-hidden="true">
              …
            </span>
            <span>
              <strong>« … »</strong> en fin de ligne : touchez pour lire la prière en entier.
            </span>
          </li>
        )}
        <li>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M17 17L7 7M7 15V7h8M23 23l10 10M33 25v8h-8" />
          </svg>
          <span>
            <strong>Ecartez deux doigts</strong> pour agrandir le texte.
          </span>
        </li>
        <li>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M10 26a10 10 0 0 1 20 0" className="soleil" />
            <path d="M4 26h32" />
          </svg>
          <span>
            <strong>L’invitatoire</strong> ouvre le premier office de la journée ; un seul office le
            dit.
          </span>
        </li>
      </ul>
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
