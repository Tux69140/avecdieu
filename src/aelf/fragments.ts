import type { Ligne, Segment, Signe, Strophe } from '../office/modele'

// Lecture d'un fragment HTML de l'AELF. Le fragment est analysé hors de la
// page (DOMParser : rien ne s'y exécute, rien ne s'y charge), puis seul son
// texte en ressort, découpé en strophes, lignes et segments. Aucune balise,
// aucun attribut ne franchit cette frontière : React affichera du texte pur.

// Leur contenu n'est jamais du texte de prière.
const IGNOREES = new Set([
  'script',
  'style',
  'template',
  'noscript',
  'iframe',
  'object',
  'embed',
  'svg',
  'math',
  'head',
  'title',
])

// Un bloc ferme la strophe en cours : l'AELF met une strophe par paragraphe.
const BLOCS = new Set([
  'p',
  'div',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
])

// Les blancs de la mise en page HTML, sans l'espace insécable de la typographie.
const BLANCS = /[ \t\n\r\f]+/g

// Astérisque de médiante ; croix de flexe, V/ et R/, isolés entre deux blancs.
const SIGNES_RUBRIQUE = /(\*|(?<!\S)(?:\+|[VR]\/)(?!\S))/

// L'AELF met parfois ses signes en gras : ils restent des signes.
const SIGNE_EN_GRAS = /^\s*(\*|\+|[VR]\/)\s*$/

const REFRAIN = /^\(?([VR])\/\)?\s*(\d.*)?$/

function signeDe(element: Element): Signe | undefined {
  const balise = element.tagName.toLowerCase()
  if (balise === 'u') return 'accent'
  if (element.classList.contains('verse_number')) return 'verset'
  if (['em', 'i', 'strong', 'b'].includes(balise)) return 'emphase'
  return undefined
}

export function lireFragment(html: string): Strophe[] {
  const corps = new DOMParser().parseFromString(html, 'text/html').body
  const strophes: Strophe[] = []
  let strophe: Ligne[] = []
  let ligne: Segment[] = []

  // Vrai si la ligne avait du texte.
  const finirLigne = () => {
    const propre = nettoyer(ligne)
    ligne = []
    if (propre.length > 0) strophe.push(propre)
    return propre.length > 0
  }
  const finirStrophe = () => {
    finirLigne()
    if (strophe.length > 0) strophes.push(strophe)
    strophe = []
  }

  const parcourir = (noeud: Node, signe?: Signe) => {
    for (const enfant of noeud.childNodes) {
      if (enfant.nodeType === Node.TEXT_NODE) {
        const texte = enfant.textContent ?? ''
        ligne.push(signe ? { texte, signe } : { texte })
        continue
      }
      if (!(enfant instanceof Element)) continue
      const balise = enfant.tagName.toLowerCase()
      if (IGNOREES.has(balise)) continue
      // Un <br> sur une ligne vide : la strophe s'achève.
      if (balise === 'br') {
        if (!finirLigne()) finirStrophe()
        continue
      }
      const bloc = BLOCS.has(balise)
      if (bloc) finirStrophe()
      parcourir(enfant, signeDe(enfant) ?? signe)
      if (bloc) finirStrophe()
    }
  }

  parcourir(corps)
  finirStrophe()
  return rattacherMarquesSeules(strophes)
}

// Une ligne propre : blancs réduits, texte contigu fusionné, V/ ou R/ de tête
// et signes de rubrique isolés, bords rognés.
function nettoyer(ligne: Segment[]): Ligne {
  const fusionnee: Segment[] = []
  for (const segment of ligne) {
    const { texte } = segment
    const signe =
      segment.signe === 'emphase' && SIGNE_EN_GRAS.test(texte) ? undefined : segment.signe
    const precedent = fusionnee.at(-1)
    const reduit = texte.replace(BLANCS, ' ')
    if (precedent && precedent.signe === signe && signe !== 'verset') precedent.texte += reduit
    else fusionnee.push(signe ? { texte: reduit, signe } : { texte: reduit })
  }

  const resultat: Segment[] = []
  for (const segment of fusionnee) {
    // Le refrain d'un psaume porte son R/ dans le numéro : « R/ 8 », « (R/) ».
    const refrain = segment.signe === 'verset' ? REFRAIN.exec(segment.texte.trim()) : null
    if (refrain) {
      resultat.push({ texte: `${refrain[1]}/`, signe: refrain[1] as 'V' | 'R' })
      if (refrain[2]) resultat.push({ texte: refrain[2], signe: 'verset' })
      continue
    }
    // Les lectures numérotent « 01 », « 02 » : le zéro de tête tombe.
    if (segment.signe === 'verset') {
      resultat.push({ texte: segment.texte.trim().replace(/^0+(?=\d)/, ''), signe: 'verset' })
      continue
    }
    if (segment.signe) {
      resultat.push(segment)
      continue
    }
    for (const morceau of segment.texte.split(SIGNES_RUBRIQUE)) {
      if (morceau === '*') resultat.push({ texte: '*', signe: 'mediante' })
      else if (morceau === '+') resultat.push({ texte: '+', signe: 'flexe' })
      else if (morceau === 'V/' || morceau === 'R/')
        resultat.push({ texte: morceau, signe: morceau[0] as 'V' | 'R' })
      else if (morceau) resultat.push({ texte: morceau })
    }
  }
  // Après V/ ou R/, la marque porte son propre espace à l'affichage.
  resultat.forEach((segment, i) => {
    const precedent = resultat[i - 1]
    if (!segment.signe && (precedent?.signe === 'V' || precedent?.signe === 'R'))
      segment.texte = segment.texte.trimStart()
  })
  const propre = resultat.filter((segment) => segment.texte !== '')
  rogner(propre, 'debut')
  rogner(propre, 'fin')
  return propre
}

// Retire les blancs d'un bord, et les segments que cela vide.
function rogner(segments: Segment[], bord: 'debut' | 'fin') {
  while (segments.length > 0) {
    const i = bord === 'debut' ? 0 : segments.length - 1
    const texte = bord === 'debut' ? segments[i].texte.trimStart() : segments[i].texte.trimEnd()
    if (texte) {
      segments[i].texte = texte
      return
    }
    segments.splice(i, 1)
  }
}

// L'AELF écrit parfois « R/ » hors du paragraphe de la réponse : la marque
// restée seule rejoint la ligne qui la suit.
function rattacherMarquesSeules(strophes: Strophe[]): Strophe[] {
  const resultat: Strophe[] = []
  let enAttente: Segment | undefined
  for (const strophe of strophes) {
    const lignes: Ligne[] = []
    for (const ligne of strophe) {
      const seule = ligne.length === 1 && (ligne[0].signe === 'V' || ligne[0].signe === 'R')
      if (seule && !enAttente) {
        enAttente = ligne[0]
        continue
      }
      lignes.push(enAttente ? [enAttente, ...ligne] : ligne)
      enAttente = undefined
    }
    if (lignes.length > 0) resultat.push(lignes)
  }
  if (enAttente) resultat.push([[enAttente]])
  return resultat
}
