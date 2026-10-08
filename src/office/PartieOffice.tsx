import type { Bloc, Partie, Strophe, TypePartie } from './modele'
import { LigneOffice, TexteOffice } from './TexteOffice'
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

// « replier » : les prières courantes se replient sur leur première ligne
// (réglage « Prières courantes en entier » coupé).
export function PartieOffice({ partie, replier }: { partie: Partie; replier: boolean }) {
  // Une section sans nom : nommée, elle deviendrait une région, et deux
  // « Antienne » ou deux « Répons » porteraient le même nom. Le titre suffit.
  return (
    <section
      className="partie"
      data-type={partie.type}
      data-mise={MISES[partie.type]}
      data-ajoutee={partie.ajoutee ? 'oui' : undefined}
    >
      <h2 className="etiquette partie-libelle">
        {partie.libelle}
        {partie.precision && <span className="partie-precision"> · {partie.precision}</span>}
      </h2>
      {partie.titre && <p className="partie-titre">{partie.titre}</p>}
      {partie.blocs.map((bloc, i) => (
        <BlocOffice key={i} bloc={bloc} replier={replier} />
      ))}
      {partie.source && <p className="partie-source">{partie.source}</p>}
    </section>
  )
}

function BlocOffice({ bloc, replier }: { bloc: Bloc; replier: boolean }) {
  return (
    <div
      className="bloc"
      data-ajoute={bloc.ajoute ? 'oui' : undefined}
      data-antienne={bloc.antienne ? 'oui' : undefined}
      data-testid={bloc.priere ? 'priere-courante' : undefined}
    >
      {bloc.rubrique && <p className="office-rubrique">{bloc.rubrique}</p>}
      {bloc.priere && replier ? (
        <PriereRepliee strophes={bloc.strophes} />
      ) : (
        <TexteOffice strophes={bloc.strophes} />
      )}
    </div>
  )
}

// La première ligne seule ; un toucher déplie la suite, juste en dessous.
function PriereRepliee({ strophes }: { strophes: Strophe[] }) {
  const [[premiere, ...finDeStrophe] = [], ...suite] = strophes
  if (!premiere) return null
  return (
    <details className="priere-repliee">
      <summary>
        <LigneOffice ligne={premiere} />
      </summary>
      <TexteOffice strophes={[finDeStrophe, ...suite].filter((s) => s.length > 0)} />
    </details>
  )
}
