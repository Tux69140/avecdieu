import { describe, expect, it } from 'vitest'
import { CHAPELET_MARIAL, ROSAIRE } from './definition'
import { derouler } from './deroule'
import { vibrationEntre } from './vibration'

const DEROULE = derouler(CHAPELET_MARIAL)
const FIN = DEROULE.pas.length
// Index de la première étape de la dizaine d (1 à 5) : l'annonce du mystère.
const ouverture = (d: number) => DEROULE.pas.findIndex((p) => p.dizaine === d)
const marquees = (deroule = DEROULE) =>
  Array.from({ length: deroule.pas.length }, (_, i) => vibrationEntre(deroule, i, i + 1)).filter(
    (v) => v === 'marquee',
  )

describe('vibrationEntre', () => {
  it('une vibration courte à chaque prière suivante dans une même partie', () => {
    expect(vibrationEntre(DEROULE, 0, 1)).toBe('courte')
    expect(vibrationEntre(DEROULE, ouverture(1), ouverture(1) + 1)).toBe('courte')
    expect(vibrationEntre(DEROULE, ouverture(3) + 5, ouverture(3) + 6)).toBe('courte')
  })

  it('une vibration courte du Gloire au Père au « Ô mon Jésus »', () => {
    const oMonJesus = DEROULE.pas.findIndex((p) => p.priere === 'o-mon-jesus')
    expect(vibrationEntre(DEROULE, oMonJesus - 1, oMonJesus)).toBe('courte')
  })

  it('une vibration marquée à l’entrée de chaque dizaine, sur l’annonce du mystère', () => {
    for (let d = 1; d <= 5; d++) {
      expect(DEROULE.pas[ouverture(d)].priere).toBe('annonce')
      expect(vibrationEntre(DEROULE, ouverture(d) - 1, ouverture(d)), `dizaine ${d}`).toBe(
        'marquee',
      )
    }
  })

  it('sans annonce à part, la vibration marquée tombe sur le Notre Père', () => {
    const compact = derouler(CHAPELET_MARIAL, { annonce: false })
    const notrePere = compact.pas.findIndex((p) => p.dizaine === 2)
    expect(compact.pas[notrePere].priere).toBe('notre-pere')
    expect(vibrationEntre(compact, notrePere - 1, notrePere)).toBe('marquee')
  })

  it('une vibration marquée quand la dernière dizaine s’achève, courte dans la clôture, marquée à l’écran de fin', () => {
    const salve = DEROULE.pas.findIndex((p) => p.priere === 'salve-regina')
    expect(vibrationEntre(DEROULE, salve - 1, salve)).toBe('marquee')
    for (let i = salve; i < FIN - 1; i++) expect(vibrationEntre(DEROULE, i, i + 1)).toBe('courte')
    expect(DEROULE.pas[FIN - 1].priere).toBe('saint-joseph')
    expect(vibrationEntre(DEROULE, FIN - 1, FIN)).toBe('marquee')
  })

  it('sept vibrations marquées : cinq dizaines, la clôture et la fin', () => {
    expect(marquees()).toHaveLength(7)
  })

  it('six sans aucun texte de clôture : cinq dizaines et la fin', () => {
    const sansCloture = derouler(CHAPELET_MARIAL, {
      salveRegina: false,
      litanies: false,
      oraisonRosaire: false,
      sousLAbri: false,
      saintJoseph: false,
    })
    expect(marquees(sansCloture)).toHaveLength(6)
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

describe('vibrations du Rosaire', () => {
  const rosaire = derouler(ROSAIRE)

  it('le passage de série vibre fort, comme l’entrée de chaque dizaine', () => {
    const passages = rosaire.pas.flatMap((p, i) => (p.nouvelleSerie ? [i] : []))
    expect(passages).toHaveLength(3)
    for (const i of passages) expect(vibrationEntre(rosaire, i - 1, i)).toBe('marquee')
  })

  it('vingt-deux vibrations marquées : vingt dizaines, la clôture et la fin', () => {
    expect(marquees(rosaire)).toHaveLength(22)
  })

  it('d’une série à l’autre, la même dizaine reste une autre partie', () => {
    // Ce qui compte, c'est la série et la dizaine : joyeux 1 n'est pas lumineux 1.
    const premierJoyeux = rosaire.pas.findIndex((p) => p.serie === 'joyeux' && p.dizaine === 1)
    const premierLumineux = rosaire.pas.findIndex((p) => p.nouvelleSerie)
    expect(vibrationEntre(rosaire, premierJoyeux, premierLumineux)).toBe('marquee')
  })
})
