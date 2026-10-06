import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChapeletDessine } from './ChapeletDessine'
import { CHAPELET_MARIAL } from './definition'
import { derouler } from './deroule'
import { disposer } from './disposition'

const PLAN = disposer(derouler(CHAPELET_MARIAL))
const NOEUDS = PLAN.points.flatMap((p, i) => (p.type === 'noeud' ? [i] : []))

describe('ChapeletDessine', () => {
  it('pendant un Gloire au Père, le fil s’éclaire sans qu’aucune perle n’apparaisse', () => {
    expect(NOEUDS).toHaveLength(6)
    for (const noeud of NOEUDS) {
      const { container, unmount } = render(<ChapeletDessine plan={PLAN} grainCourant={noeud} />)
      expect(container.querySelectorAll('.halo'), `nœud ${noeud}`).toHaveLength(1)
      expect(container.querySelector('.grain-courant'), `nœud ${noeud}`).toBeNull()
      unmount()
    }
  })

  it('le nombre de perles dessinées ne change jamais d’une prière à l’autre', () => {
    const perles = (grainCourant: number) =>
      render(
        <ChapeletDessine plan={PLAN} grainCourant={grainCourant} />,
      ).container.querySelectorAll('.grain').length
    const attendu = PLAN.points.length - NOEUDS.length
    for (let i = 0; i <= PLAN.points.length; i++) expect(perles(i), `grain ${i}`).toBe(attendu)
  })

  it('sur une perle, la perle en cours brille avec son halo', () => {
    const perle = NOEUDS[0] + 1
    const { container } = render(<ChapeletDessine plan={PLAN} grainCourant={perle} />)
    expect(container.querySelectorAll('.grain-courant')).toHaveLength(1)
    expect(container.querySelectorAll('.halo')).toHaveLength(1)
  })
})
