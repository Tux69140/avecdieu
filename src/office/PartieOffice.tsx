import { useId } from 'react'
import type { Partie, TypePartie } from './modele'
import { TexteOffice } from './TexteOffice'
import './PartieOffice.css'

// Mise en page du texte (PartieOffice.css) : un vers coupé faute de place
// reprend en retrait ; une lecture se lit en paragraphes espacés ; le reste
// (antiennes, répons, intercessions…) ligne à ligne, sans retrait.
const MISES: Partial<Record<TypePartie, 'vers' | 'prose'>> = {
  psaume: 'vers',
  cantique: 'vers',
  hymne: 'vers',
  'te-deum': 'vers',
  'antienne-mariale': 'vers',
  lecture: 'prose',
  oraison: 'prose',
  autre: 'prose',
}

export function PartieOffice({ partie }: { partie: Partie }) {
  const id = useId()
  return (
    <section
      className="partie"
      aria-labelledby={id}
      data-type={partie.type}
      data-mise={MISES[partie.type]}
    >
      <h2 id={id} className="etiquette partie-libelle">
        {partie.libelle}
        {partie.precision && <span className="partie-precision"> · {partie.precision}</span>}
      </h2>
      {partie.titre && <p className="partie-titre">{partie.titre}</p>}
      <TexteOffice strophes={partie.strophes} />
      {partie.source && <p className="partie-source">{partie.source}</p>}
    </section>
  )
}
