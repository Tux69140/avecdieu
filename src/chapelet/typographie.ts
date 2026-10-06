// Espaces insécables de la typographie française, posées à l'affichage : les
// textes du recueil restent tels que la source les donne. Elles empêchent un
// guillemet ou un deux-points d'échouer seul en début de ligne.
const INSECABLE = ' '

export function insecables(texte: string): string {
  return texte.replace(/«\s/g, `«${INSECABLE}`).replace(/\s([»:;!?])/g, `${INSECABLE}$1`)
}
