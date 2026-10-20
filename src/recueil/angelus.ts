import { VERSET_MARIAL, type PriereId } from './prieres'

// L'Angélus et le Regina Caeli (phase 19), validés ligne par ligne par le
// porteur du projet le 2026-10-20 : Marie au vous, Dieu au tu, comme la
// clôture du chapelet. Une prière faite de morceaux : des lignes du recueil,
// ou une prière déjà validée (le Je vous salue Marie), que l'écran replie.

export interface Lignes {
  lignes: string[]
  // À plusieurs, comme pour une prière du recueil : la réponse des autres.
  reponse?: string
}

export type Morceau = Lignes | { priere: PriereId }

export interface PriereComposee {
  titre: string
  morceaux: Morceau[]
}

const JE_VOUS_SALUE: Morceau = { priere: 'je-vous-salue-marie' }

export type PriereMariale = 'angelus' | 'regina-caeli'

export const PRIERES_MARIALES: Record<PriereMariale, PriereComposee> = {
  angelus: {
    titre: 'Angélus',
    morceaux: [
      {
        lignes: [
          'V/ L’ange du Seigneur apporta l’annonce à Marie,',
          'R/ Et elle conçut du Saint-Esprit.',
        ],
      },
      JE_VOUS_SALUE,
      {
        lignes: ['V/ Voici la servante du Seigneur,', 'R/ Qu’il me soit fait selon votre parole.'],
      },
      JE_VOUS_SALUE,
      { lignes: ['V/ Et le Verbe s’est fait chair,', 'R/ Et il a habité parmi nous.'] },
      JE_VOUS_SALUE,
      { lignes: VERSET_MARIAL },
      {
        lignes: [
          'Prions.',
          'Que ta grâce, Seigneur notre Père, se répande en nos cœurs :',
          'par le message de l’ange, tu nous as fait connaître l’incarnation de ton Fils bien-aimé ;',
          'conduis-nous, par sa passion et par sa croix,',
          'jusqu’à la gloire de la résurrection.',
          'Par le Christ, notre Seigneur.',
          'Amen.',
        ],
        reponse: 'Amen.',
      },
    ],
  },
  'regina-caeli': {
    titre: 'Regina Caeli',
    morceaux: [
      {
        lignes: [
          'Reine du ciel, réjouissez-vous, alléluia,',
          'car celui que vous avez mérité de porter, alléluia,',
          'est ressuscité comme il l’avait dit, alléluia.',
          'Priez Dieu pour nous, alléluia.',
        ],
      },
      {
        lignes: [
          'V/ Soyez dans la joie et l’allégresse, Vierge Marie, alléluia.',
          'R/ Car le Seigneur est vraiment ressuscité, alléluia.',
        ],
      },
      {
        lignes: [
          'Prions.',
          'Dieu qui, par la résurrection de ton Fils, notre Seigneur Jésus Christ,',
          'as bien voulu réjouir le monde,',
          'fais que, par la Vierge Marie, sa Mère,',
          'nous parvenions aux joies de la vie éternelle.',
          'Par le Christ, notre Seigneur.',
          'Amen.',
        ],
        reponse: 'Amen.',
      },
    ],
  },
}
