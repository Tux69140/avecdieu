// Espaces insécables de la typographie française, posées à l'affichage : les
// textes du recueil restent tels que la source les donne. Elles empêchent un
// guillemet ou un deux-points d'échouer seul en début de ligne.
const INSECABLE = ' '

// Un mot composé ne se coupe pas à son trait d'union (« Saint-Esprit ») : un
// liant invisible le suit, que les polices n'ont pas à dessiner (2026-10-08).
const LIANT = '\u2060'

export function insecables(texte: string): string {
  return texte
    .replace(/«\s/g, `«${INSECABLE}`)
    .replace(/\s([»:;!?])/g, `${INSECABLE}$1`)
    .replace(/(?<=\p{L})-(?=\p{L})/gu, `-${LIANT}`)
}
