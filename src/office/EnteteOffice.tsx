import type { Ref } from 'react'
import { BoutonAide } from '../composants/BoutonAide'
import { avecExposants } from '../composants/Exposants'
import { LienMenu } from '../composants/Icones'
import { LigneFermer } from '../composants/LigneFermer'
import { dateLisible } from './dates'
import { decrirePerles, type Etape } from './etapes'
import { FilDePerles } from './FilDePerles'
import { type NomOffice, NOMS_OFFICES } from './modele'

interface Props {
  nom: NomOffice
  date: string
  // Le titre : le bandeau ne paraît qu'une fois sorti de l'écran (useReperage).
  titre: Ref<HTMLHeadingElement>
  saint: string | undefined
  // L'office affiché, ses étapes et celle où l'on en est ; rien tant qu'il
  // n'est pas là (chargement, erreur).
  perles: { etapes: Etape[]; courante: number } | undefined
  onFermer: () => void
  onAide: () => void
  onSommaire: () => void
  // Le lien « Le dire ici », quand l'autre office porte l'invitatoire.
  onRecevoirInvitatoire: (() => void) | undefined
}

export function EnteteOffice({ nom, date, titre, saint, perles, ...props }: Props) {
  return (
    <header className="office-entete">
      {/* Une seule ligne pour sortir, se repérer dans la journée et ouvrir
          le menu : la prière commence haut sur l'écran. */}
      <LigneFermer onFermer={props.onFermer}>
        <p className="office-date ligne-date">{avecExposants(dateLisible(date))}</p>
        <LienMenu depuis={date} office={nom} />
      </LigneFermer>
      {/* Le saint du jour en petit à gauche du titre, qui reste centré, et
          « ? » à droite, qui rouvre l'aide ; sous le titre long de l'office
          des lectures (2026-10-08). */}
      <div className="office-titre" data-office={nom}>
        <h1 ref={titre}>{NOMS_OFFICES[nom]}</h1>
        {saint && (
          <p className="office-saint" data-testid="saint-du-jour">
            {saint}
          </p>
        )}
        {perles && (
          <BoutonAide className="office-aide" libelle="Aide à la lecture" onClick={props.onAide} />
        )}
      </div>
      {/* Les perles, comme dans le bandeau : un toucher ouvre le sommaire. */}
      {perles && (
        <button
          className="office-perles"
          type="button"
          aria-haspopup="dialog"
          aria-label={decrirePerles(perles.etapes, perles.courante)}
          onClick={props.onSommaire}
        >
          <FilDePerles nombre={perles.etapes.length} courante={perles.courante} />
        </button>
      )}
      {/* La raison avant l'action : seuls les derniers mots se touchent
          (choix du porteur du projet, 2026-10-08). */}
      {props.onRecevoirInvitatoire && (
        <p className="office-invitatoire">
          L’invitatoire était {nom === 'laudes' ? 'à l’office des lectures' : 'aux laudes'}.{' '}
          <button className="lien-discret" type="button" onClick={props.onRecevoirInvitatoire}>
            Le dire ici
          </button>
        </p>
      )}
    </header>
  )
}
