import type { Partie, TypePartie } from './modele'

// Une étape de l'office, telle que la nomment le bandeau, le fil de perles et
// le sommaire (phase 7) : ce qu'on dit d'un seul élan. L'antienne compte avec
// le psaume qu'elle ouvre, l'invitatoire avec son psaume (choix du porteur du
// projet, 2026-10-07).
export interface Etape {
  libelle: string
  precision?: string
  // L'indice de sa première partie dans l'office.
  debut: number
}

// Ce qu'une partie emporte avec elle quand elle la précède.
const OUVRE: Partial<Record<TypePartie, readonly TypePartie[]>> = {
  antienne: ['psaume', 'cantique', 'autre'],
  invitatoire: ['psaume'],
}

export function etapesDe(parties: readonly Partie[]): Etape[] {
  const etapes: Etape[] = []
  for (let i = 0; i < parties.length; i++) {
    const partie = parties[i]
    const suivante = parties[i + 1] as Partie | undefined
    // L'antienne s'efface derrière son psaume ; l'invitatoire garde son nom.
    if (suivante && OUVRE[partie.type]?.includes(suivante.type)) {
      const nommee = partie.type === 'antienne' ? suivante : partie
      etapes.push({ libelle: nommee.libelle, precision: nommee.precision, debut: i })
      i++
      continue
    }
    etapes.push({ libelle: partie.libelle, precision: partie.precision, debut: i })
  }
  return etapes
}

// Ce que le lecteur d'écran dit des perles, dans le bandeau comme sous le titre :
// « Psaume 62, étape 3 sur 12. Ouvrir le sommaire ».
export const decrirePerles = (etapes: readonly Etape[], courante: number) =>
  `${etapes[courante]?.libelle ?? ''}, étape ${courante + 1} sur ${etapes.length}. Ouvrir le sommaire`
