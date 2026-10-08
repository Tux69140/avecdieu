import { describe, expect, it } from 'vitest'
import { DEFILEMENT_RECENT, deciderToucher, type EtatPage } from './toucher'

// Un écran de 780 px, barres d'Android de 40 et 48 px, lignes de 26 px.
const ECRAN: EtatPage = {
  depuisDefilement: Infinity,
  basContenu: 600,
  hautVisible: 40,
  basVisible: 732,
  recouvert: 0,
  ligne: 26,
}

describe('un toucher pendant la prière', () => {
  it('sur un écran où tout tient, avance', () => {
    expect(deciderToucher(ECRAN)).toEqual({ sorte: 'avancer' })
  })

  it('le bas de la page affiché, avance', () => {
    expect(deciderToucher({ ...ECRAN, basContenu: 732 })).toEqual({ sorte: 'avancer' })
    expect(deciderToucher({ ...ECRAN, basContenu: 732.6 })).toEqual({ sorte: 'avancer' })
  })

  it('tant que le bas est caché, descend d’un écran en gardant deux lignes', () => {
    const page = { ...ECRAN, basContenu: 2400, recouvert: 72 }
    // Hauteur visible : 732 − 72 − 40 = 620 px ; deux lignes gardées : 568 px.
    expect(deciderToucher(page)).toEqual({ sorte: 'descendre', de: 568 })
    // Sans le signal « Plus bas » par-dessus le bas de l'écran.
    expect(deciderToucher({ ...page, recouvert: 0 })).toEqual({ sorte: 'descendre', de: 640 })
  })

  it('près du bas, descend juste assez pour montrer la fin au-dessus de « Plus bas »', () => {
    expect(deciderToucher({ ...ECRAN, basContenu: 900, recouvert: 72 })).toEqual({
      sorte: 'descendre',
      de: 240,
    })
    // La dernière ligne cachée sous « Plus bas » : on descend encore un peu.
    expect(deciderToucher({ ...ECRAN, basContenu: 700, recouvert: 72 })).toEqual({
      sorte: 'descendre',
      de: 40,
    })
  })

  it('sans texte de prière affiché (compact), avance', () => {
    expect(deciderToucher({ ...ECRAN, basContenu: -Infinity, recouvert: 72 })).toEqual({
      sorte: 'avancer',
    })
  })

  it('un toucher qui arrête un défilement ne compte jamais', () => {
    for (const basContenu of [600, 2400])
      expect(deciderToucher({ ...ECRAN, basContenu, depuisDefilement: 16 })).toEqual({
        sorte: 'ignorer',
      })
    expect(deciderToucher({ ...ECRAN, depuisDefilement: DEFILEMENT_RECENT })).toEqual({
      sorte: 'avancer',
    })
  })

  it('même sur un écran minuscule, descend d’au moins une ligne', () => {
    expect(
      deciderToucher({ ...ECRAN, basContenu: 2400, hautVisible: 0, basVisible: 60, recouvert: 0 }),
    ).toEqual({ sorte: 'descendre', de: 26 })
  })
})
