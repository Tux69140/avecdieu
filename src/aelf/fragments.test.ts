import { describe, expect, it } from 'vitest'
import type { Strophe } from '../office/modele'
import { lireFragment } from './fragments'

// Le texte brut d'une strophe, une ligne par entrée, signes compris.
const brut = (strophes: Strophe[]) =>
  strophes.map((s) => s.map((ligne) => ligne.map((seg) => seg.texte).join('')))

describe('lireFragment', () => {
  it('coupe les lignes aux <br> et les strophes aux paragraphes', () => {
    const html = '<p>Soleil levant<br />\nSur ceux qui gisent</p><p>Tu es venu<br/>Jésus</p>'
    expect(brut(lireFragment(html))).toEqual([
      ['Soleil levant', 'Sur ceux qui gisent'],
      ['Tu es venu', 'Jésus'],
    ])
  })

  it('une ligne vide entre deux <br> ouvre une nouvelle strophe', () => {
    expect(brut(lireFragment('un<br>deux<br><br>trois'))).toEqual([['un', 'deux'], ['trois']])
  })

  it('accepte un texte sans aucune balise', () => {
    expect(brut(lireFragment('Je fais miennes pour toujours tes volontés. '))).toEqual([
      ['Je fais miennes pour toujours tes volontés.'],
    ])
  })

  it('rend vide un fragment vide ou blanc', () => {
    expect(lireFragment('')).toEqual([])
    expect(lireFragment(' <p> </p> ')).toEqual([])
  })

  it('reconnaît numéros de versets et syllabes accentuées', () => {
    const [[ligne]] = lireFragment(
      '<span class="verse_number">1</span> Venez, crions de j<u>o</u>ie',
    )
    expect(ligne).toEqual([
      { texte: '1', signe: 'verset' },
      { texte: ' Venez, crions de j' },
      { texte: 'o', signe: 'accent' },
      { texte: 'ie' },
    ])
  })

  it('retire le zéro de tête des numéros de versets des lectures', () => {
    const [[ligne]] = lireFragment('<span class="verse_number">01</span> Voici une parole')
    expect(ligne[0]).toEqual({ texte: '1', signe: 'verset' })
  })

  it('isole l’astérisque de médiante et la croix de flexe', () => {
    const [[l1, l2]] = lireFragment(
      'Nous avons une v<u>i</u>lle forte ! *<br />qui ont fr<u>é</u>mi ; +',
    )
    expect(l1.at(-1)).toEqual({ texte: '*', signe: 'mediante' })
    expect(l2.at(-1)).toEqual({ texte: '+', signe: 'flexe' })
  })

  it('reconnaît V/ et R/ en début de ligne', () => {
    const [[v, r]] = lireFragment(
      'V/ Seigneur, ouvre mes lèvres,\n<br />R/ et ma bouche publiera ta louange.',
    )
    expect(v.slice(0, 2)).toEqual([
      { texte: 'V/', signe: 'V' },
      { texte: 'Seigneur, ouvre mes lèvres,' },
    ])
    expect(r[0]).toEqual({ texte: 'R/', signe: 'R' })
  })

  it('reconnaît les signes mis en gras et le R/ de fin de ligne', () => {
    const html =
      '<strong><font color="#ff0000">V/ </font></strong>Sur ton serviteur. <font color="#ff0000">R/</font><br /><p><strong>* </strong>Gloire à Dieu</p>'
    const [[v], [etoile]] = lireFragment(html)
    expect(v).toEqual([
      { texte: 'V/', signe: 'V' },
      { texte: 'Sur ton serviteur. ' },
      { texte: 'R/', signe: 'R' },
    ])
    expect(etoile).toEqual([{ texte: '*', signe: 'mediante' }, { texte: ' Gloire à Dieu' }])
  })

  it('sépare le R/ d’un refrain de son numéro de verset', () => {
    const html =
      '<span class="verse_number">(R/)</span> (Il est avec nous<br /><span class="verse_number">R/ 8</span> Il est'
    const [[l1, l2]] = lireFragment(html)
    expect(l1.slice(0, 2)).toEqual([{ texte: 'R/', signe: 'R' }, { texte: '(Il est avec nous' }])
    expect(l2).toEqual([
      { texte: 'R/', signe: 'R' },
      { texte: '8', signe: 'verset' },
      { texte: ' Il est' },
    ])
  })

  it('laisse « R/ » au milieu d’un mot tel quel', () => {
    expect(lireFragment('et/ou R/x')[0][0]).toEqual([{ texte: 'et/ou R/x' }])
  })

  it('rattache un R/ resté seul à la ligne qui le suit', () => {
    const html = '<p>prions le Christ :</p><br />R/ <p>Exauce-nous, Seigneur.</p>'
    expect(brut(lireFragment(html))).toEqual([['prions le Christ :'], ['R/Exauce-nous, Seigneur.']])
    expect(lireFragment(html)[1][0][0]).toEqual({ texte: 'R/', signe: 'R' })
  })

  it('décode les entités et garde les espaces insécables', () => {
    expect(brut(lireFragment('Tu entends, Seigneur, le d&eacute;sir&nbsp;: oui'))).toEqual([
      ['Tu entends, Seigneur, le désir : oui'],
    ])
  })

  it('ignore la couleur imposée par <font> et garde son texte', () => {
    const [[ligne]] = lireFragment('<font color="#ff0000">V/ </font>Le Seigneur délivrera')
    expect(ligne).toEqual([{ texte: 'V/', signe: 'V' }, { texte: 'Le Seigneur délivrera' }])
  })

  it('marque l’italique et le gras de la source comme emphase', () => {
    const [[ligne]] = lireFragment('<strong>Fuir l’orgueil</strong> et <em>se détourner</em>')
    expect(ligne).toEqual([
      { texte: 'Fuir l’orgueil', signe: 'emphase' },
      { texte: ' et ' },
      { texte: 'se détourner', signe: 'emphase' },
    ])
  })

  it('ne laisse passer ni script, ni style, ni balise : seulement du texte', () => {
    const html =
      '<script>alert(1)</script><style>p{}</style><img src=x onerror="alert(2)">Amen<iframe src="//x"></iframe>'
    expect(brut(lireFragment(html))).toEqual([['Amen']])
  })

  // L'AELF mêle les deux apostrophes (« j'ai », « l’honneur ») : toutes
  // typographiques. Un texte déjà juste n'est pas touché.
  it('rend toutes les apostrophes typographiques', () => {
    const texte = (html: string) =>
      lireFragment(html)
        .flat(2)
        .map((s) => s.texte)
        .join('')
    expect(texte("<p>j'ai vu l’honneur</p>")).toBe('j’ai vu l’honneur')
    expect(texte('<p>j’ai vu</p>')).toBe('j’ai vu')
  })
})
