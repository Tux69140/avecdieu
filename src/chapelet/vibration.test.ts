import { describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL } from './definition'
import { derouler } from './deroule'
import { vibrationEntre } from './vibration'

const DEROULE = derouler(CHAPELET_MARIAL)
const FIN = DEROULE.pas.length
// Index du Notre Père qui ouvre la dizaine d (1 à 5).
const ouverture = (d: number) =>
  DEROULE.pas.findIndex((p) => p.dizaine === d && p.priere === 'notre-pere')

describe('vibrationEntre', () => {
  it('une vibration courte à chaque prière suivante dans une même partie', () => {
    expect(vibrationEntre(DEROULE, 0, 1)).toBe('courte')
    expect(vibrationEntre(DEROULE, ouverture(1), ouverture(1) + 1)).toBe('courte')
    expect(vibrationEntre(DEROULE, ouverture(3) + 5, ouverture(3) + 6)).toBe('courte')
  })

  it('une vibration marquée à l’entrée de chaque dizaine, sur son Notre Père', () => {
    for (let d = 1; d <= 5; d++) {
      expect(DEROULE.pas[ouverture(d) - 1].priere).toBe('gloire-au-pere')
      expect(vibrationEntre(DEROULE, ouverture(d) - 1, ouverture(d)), `dizaine ${d}`).toBe(
        'marquee',
      )
    }
  })

  it('une vibration marquée quand la dernière dizaine s’achève sur l’écran de fin', () => {
    expect(vibrationEntre(DEROULE, FIN - 1, FIN)).toBe('marquee')
  })

  it('six vibrations marquées sur un chapelet complet : cinq dizaines et la fin', () => {
    const marquees = Array.from({ length: FIN }, (_, i) => vibrationEntre(DEROULE, i, i + 1))
    expect(marquees.filter((v) => v === 'marquee')).toHaveLength(6)
  })

  it('revenir en arrière vibre court, même en repassant une dizaine', () => {
    expect(vibrationEntre(DEROULE, ouverture(2), ouverture(2) - 1)).toBe('courte')
    expect(vibrationEntre(DEROULE, FIN, 0)).toBe('courte')
  })

  it('rien quand la position ne change pas', () => {
    expect(vibrationEntre(DEROULE, 0, 0)).toBeNull()
    expect(vibrationEntre(DEROULE, FIN, FIN)).toBeNull()
  })
})
