import { useEffect, useMemo, useState } from 'react'
import { chargerOffice, ErreurAelf, type OfficeDuJour } from '../aelf/api'
import type { Etendue } from '../aelf/cache'
import { textesEnregistres } from '../aelf/reserve'
import type { Reglages } from '../reglages/reglages'
import { deplacerInvitatoire, ouvrirOffice, peutRecevoirInvitatoire } from './journee'
import type { NomOffice, Partie } from './modele'
import { invitatoireDe, reconstituer } from './rubriques'

export type EtatOffice =
  | { sorte: 'chargement' }
  // « enregistres » : les jours qu'on peut prier sans réseau, s'il y en a.
  | { sorte: 'erreur'; absent: boolean; enregistres?: Etendue }
  // « premier » (R1) : cet office ouvre la journée et porte l'invitatoire.
  | { sorte: 'pret'; lu: OfficeDuJour; invitatoire?: Partie[]; premier: boolean }

// L'office et son invitatoire. L'AELF ne donne l'invitatoire qu'aux laudes :
// l'office des lectures le leur emprunte. Sans les laudes, il s'en passe.
async function chargerAvecInvitatoire(nom: NomOffice, date: string, signal: AbortSignal) {
  const laudes =
    nom === 'lectures'
      ? chargerOffice('laudes', date, signal).catch(() => undefined)
      : Promise.resolve(undefined)
  const [lu, deLaudes] = await Promise.all([chargerOffice(nom, date, signal), laudes])
  return { lu, invitatoire: invitatoireDe((deLaudes ?? lu).office) }
}

// Le texte de l'office demandé à l'AELF (ou à la réserve du téléphone), relancé
// au retour du réseau ou à la demande du priant, puis reconstitué selon les
// rubriques.
export function useChargementOffice(
  nom: NomOffice,
  date: string,
  // Les réglages qui changent la reconstitution de l'office.
  { plusieurs, consignes }: Pick<Reglages, 'plusieurs' | 'consignes'>,
) {
  const [etat, setEtat] = useState<EtatOffice>({ sorte: 'chargement' })
  const [essai, setEssai] = useState(0)

  useEffect(() => {
    const abandon = new AbortController()
    chargerAvecInvitatoire(nom, date, abandon.signal).then(
      ({ lu, invitatoire }) => {
        // R1 : seul un office affiché avec son invitatoire compte comme le
        // premier de la journée ; un office absent ou incomplet ne le prend pas.
        const premier = invitatoire !== undefined && ouvrirOffice(nom, date)
        setEtat({ sorte: 'pret', lu, invitatoire, premier })
      },
      (erreur: unknown) => {
        if (abandon.signal.aborted) return
        const absent = erreur instanceof ErreurAelf && erreur.absent
        setEtat({ sorte: 'erreur', absent, enregistres: textesEnregistres() })
      },
    )
    return () => abandon.abort()
  }, [nom, date, essai])

  const reessayer = () => {
    setEtat({ sorte: 'chargement' })
    setEssai((n) => n + 1)
  }

  // Le réseau revenu, l'office se charge de lui-même.
  const enPanne = etat.sorte === 'erreur' && !etat.absent
  useEffect(() => {
    if (!enPanne) return
    window.addEventListener('online', reessayer)
    return () => window.removeEventListener('online', reessayer)
  }, [enPanne])

  const office = useMemo(() => {
    if (etat.sorte !== 'pret') return undefined
    const { lu, invitatoire, premier } = etat
    return reconstituer(lu.office, { premier, plusieurs, invitatoire, consignes })
  }, [etat, plusieurs, consignes])

  const lienInvitatoire =
    etat.sorte === 'pret' &&
    peutRecevoirInvitatoire(nom, {
      premier: etat.premier,
      invitatoire: etat.invitatoire !== undefined,
    })
  // Le lien « Le dire ici » : l'invitatoire passe à cet office-ci.
  const prendreInvitatoire = () => {
    if (etat.sorte !== 'pret') return
    deplacerInvitatoire(nom, date)
    setEtat({ ...etat, premier: true })
  }

  return { etat, office, reessayer, lienInvitatoire, prendreInvitatoire }
}
