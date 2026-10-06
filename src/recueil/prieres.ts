// Recueil des prières. Textes validés ligne par ligne par le porteur du projet,
// puis figés par le test d'empreinte (empreinte.test.ts) : toute modification
// demande une nouvelle validation.
// Chaque ligne est un vers ; une ligne vide ('') sépare deux strophes.

export type PriereId =
  | 'signe-de-croix'
  | 'credo'
  | 'notre-pere'
  | 'je-vous-salue-marie'
  | 'gloire-au-pere'

export interface Priere {
  titre: string
  lignes: string[]
}

export const PRIERES: Record<PriereId, Priere> = {
  'signe-de-croix': {
    titre: 'Signe de croix',
    lignes: [
      'Au nom du Père,',
      'et du Fils,',
      'et du Saint-Esprit.',
      'Amen.',
    ],
  },
  credo: {
    titre: 'Je crois en Dieu',
    lignes: [
      'Je crois en Dieu, le Père tout-puissant,',
      'créateur du ciel et de la terre.',
      '',
      'Et en Jésus Christ, son Fils unique, notre Seigneur,',
      'qui a été conçu du Saint-Esprit,',
      'est né de la Vierge Marie,',
      'a souffert sous Ponce Pilate,',
      'a été crucifié, est mort et a été enseveli,',
      'est descendu aux enfers,',
      'le troisième jour est ressuscité des morts,',
      'est monté aux cieux,',
      'est assis à la droite de Dieu le Père tout-puissant,',
      'd’où il viendra juger les vivants et les morts.',
      '',
      'Je crois en l’Esprit Saint,',
      'à la sainte Église catholique,',
      'à la communion des saints,',
      'à la rémission des péchés,',
      'à la résurrection de la chair,',
      'à la vie éternelle.',
      '',
      'Amen.',
    ],
  },
  'notre-pere': {
    titre: 'Notre Père',
    lignes: [
      'Notre Père, qui es aux cieux,',
      'que ton nom soit sanctifié,',
      'que ton règne vienne,',
      'que ta volonté soit faite sur la terre comme au ciel.',
      '',
      'Donne-nous aujourd’hui notre pain de ce jour.',
      '',
      'Pardonne-nous nos offenses,',
      'comme nous pardonnons aussi à ceux qui nous ont offensés.',
      '',
      'Et ne nous laisse pas entrer en tentation',
      'mais délivre-nous du Mal.',
      '',
      'Amen.',
    ],
  },
  'je-vous-salue-marie': {
    titre: 'Je vous salue Marie',
    lignes: [
      'Je vous salue, Marie,',
      'pleine de grâce ;',
      'le Seigneur est avec vous.',
      '',
      'Vous êtes bénie entre toutes les femmes,',
      'et Jésus, le fruit de vos entrailles, est béni.',
      '',
      'Sainte Marie, Mère de Dieu,',
      'priez pour nous, pauvres pécheurs,',
      'maintenant et à l’heure de notre mort.',
      '',
      'Amen.',
    ],
  },
  'gloire-au-pere': {
    titre: 'Gloire au Père',
    lignes: [
      'Gloire au Père, et au Fils, et au Saint-Esprit,',
      'comme il était au commencement,',
      'maintenant et toujours,',
      'et pour les siècles des siècles.',
      '',
      'Amen.',
    ],
  },
}
