import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Ligne } from './modele'
import { LigneOffice } from './TexteOffice'

const ligne = (l: Ligne) => render(<LigneOffice ligne={l} />).container.firstElementChild!

describe('une ligne de l’office', () => {
  it('l’astérisque et la croix restent avec le mot qui les précède', () => {
    const vers = ligne([
      { texte: 'Nous avons une ' },
      { texte: 'vi', signe: 'accent' },
      { texte: 'lle forte ! ' },
      { texte: '*', signe: 'mediante' },
    ])
    // Les espaces insécables, rendues visibles.
    const vu = (e: Element) => e.textContent?.replace(/\u00a0/g, '_')
    expect(vu(vers)).toBe('Nous avons une ville forte_!_*')
    const flexe = ligne([{ texte: 'il est là ' }, { texte: '+', signe: 'flexe' }])
    expect(vu(flexe)).toBe('il est là_+')
  })

  it('une ligne ouverte par ℣, ℟ ou le tiret d’une intention le dit à la mise en page', () => {
    expect(
      ligne([{ texte: 'V/', signe: 'V' }, { texte: 'Seigneur' }]).getAttribute('data-attaque'),
    ).toBe('marque')
    expect(ligne([{ texte: '— éveille nos sens' }]).getAttribute('data-attaque')).toBe('tiret')
    // L'AELF fait suivre le tiret d'une espace insécable.
    expect(ligne([{ texte: '—\u00a0éveille' }]).getAttribute('data-attaque')).toBe('tiret')
    expect(ligne([{ texte: 'Jésus Christ,' }]).hasAttribute('data-attaque')).toBe(false)
  })

  it('℣ et ℟ sont nommés au lecteur d’écran', () => {
    const l = ligne([{ texte: 'R/', signe: 'R' }, { texte: 'Exauce-nous' }])
    expect(l.querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('Répons')
  })
})
