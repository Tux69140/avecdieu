// Recueil des prières. Textes validés ligne par ligne par le porteur du projet,
// puis figés par le test d'empreinte (empreinte.test.ts) : toute modification
// demande une nouvelle validation.
// Chaque ligne est un vers ; une ligne vide ('') sépare deux strophes. Une
// ligne qui commence par « V/ » ou « R/ » est un verset ou son répons.

export type PriereId =
  | 'signe-de-croix'
  | 'credo'
  | 'notre-pere'
  | 'je-vous-salue-marie'
  | 'gloire-au-pere'
  | 'o-mon-jesus'
  | 'salve-regina'
  | 'oraison-rosaire'
  | 'sous-l-abri'
  | 'saint-joseph'

export interface Priere {
  titre: string
  lignes: string[]
  // À plusieurs, celui qui mène dit la prière jusqu'à cette ligne, les autres
  // répondent à partir d'elle. Absent : la prière se dit ensemble.
  reponse?: string
}

// Le verset marial, dit une seule fois au chapelet : à la fin du Salve Regina,
// ou avant l'oraison du Rosaire quand elle est dite (2026-10-08).
export const VERSET_MARIAL = [
  'V/ Priez pour nous, sainte Mère de Dieu.',
  'R/ Afin que nous soyons rendus dignes des promesses du Christ.',
]

// Les intentions des trois premiers Je vous salue Marie de l'ouverture, en rouge
// (validées par le porteur du projet, 2026-10-08).
export const INTENTIONS = ['Pour la foi.', 'Pour l’espérance.', 'Pour la charité.']

export const PRIERES: Record<PriereId, Priere> = {
  'signe-de-croix': {
    titre: 'Signe de croix',
    lignes: ['Au nom du Père,', 'et du Fils,', 'et du Saint-Esprit.', 'Amen.'],
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
    reponse: 'Donne-nous aujourd’hui notre pain de ce jour.',
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
    reponse: 'Sainte Marie, Mère de Dieu,',
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
    reponse: 'comme il était au commencement,',
  },
  'o-mon-jesus': {
    titre: 'Ô mon Jésus',
    lignes: [
      'Ô mon Jésus, pardonnez-nous nos péchés,',
      'préservez-nous du feu de l’enfer,',
      'et conduisez au ciel toutes les âmes,',
      'surtout celles qui ont le plus besoin de votre miséricorde.',
    ],
  },
  'salve-regina': {
    titre: 'Salve Regina',
    lignes: [
      'Salut, ô Reine, Mère de miséricorde,',
      'notre vie, notre douceur, notre espérance, salut !',
      '',
      'Enfants d’Ève exilés, nous crions vers vous ;',
      'vers vous nous soupirons, gémissant et pleurant',
      'dans cette vallée de larmes.',
      '',
      'Ô vous, notre avocate,',
      'tournez vers nous vos regards miséricordieux.',
      'Et, après cet exil, montrez-nous Jésus,',
      'le fruit béni de vos entrailles.',
      '',
      'Ô clémente, ô miséricordieuse,',
      'ô douce Vierge Marie.',
      '',
      ...VERSET_MARIAL,
    ],
  },
  // Les textes de la clôture enrichie (phase 16), validés par le porteur du
  // projet le 2026-10-08 : Marie et Joseph au vous, Dieu au tu. L'oraison du
  // Rosaire est précédée du verset marial au chapelet.
  'oraison-rosaire': {
    titre: 'Oraison du Rosaire',
    lignes: [
      'Prions.',
      'Ô Dieu, dont le Fils unique, par sa vie, sa mort et sa résurrection,',
      'nous a acquis les récompenses du salut éternel,',
      'accorde-nous, nous t’en prions,',
      'qu’en méditant ces mystères du très saint Rosaire de la bienheureuse Vierge Marie,',
      'nous imitions ce qu’ils contiennent',
      'et obtenions ce qu’ils promettent.',
      'Par le Christ, notre Seigneur.',
      'Amen.',
    ],
    reponse: 'Amen.',
  },
  'sous-l-abri': {
    titre: 'Sous l’abri de votre miséricorde',
    lignes: [
      'Sous l’abri de votre miséricorde,',
      'nous nous réfugions, sainte Mère de Dieu.',
      'Ne méprisez pas nos prières',
      'quand nous sommes dans l’épreuve,',
      'mais de tous les dangers',
      'délivrez-nous toujours,',
      'Vierge glorieuse et bénie.',
    ],
  },
  'saint-joseph': {
    titre: 'Prière à saint Joseph',
    lignes: [
      'Nous recourons à vous dans notre tribulation, ô bienheureux Joseph,',
      'et, après avoir imploré le secours de votre très sainte Épouse,',
      'nous sollicitons aussi avec confiance votre patronage.',
      'Par l’affection qui vous a uni à la Vierge immaculée, Mère de Dieu,',
      'par l’amour paternel dont vous avez entouré l’Enfant Jésus,',
      'nous vous supplions de regarder avec bonté l’héritage que Jésus Christ a conquis au prix de son sang,',
      'et de nous assister de votre puissance et de votre secours dans nos besoins.',
      'Protégez, ô très sage gardien de la divine Famille, la race élue de Jésus Christ.',
      'Préservez-nous, ô père très aimant, de toute souillure d’erreur et de corruption.',
      'Soyez-nous favorable, ô notre très puissant libérateur ;',
      'du haut du ciel, assistez-nous dans le combat que nous livrons à la puissance des ténèbres,',
      'et, de même que vous avez arraché autrefois l’Enfant Jésus au péril de la mort,',
      'défendez aujourd’hui la sainte Église de Dieu des embûches de l’ennemi et de toute adversité.',
      'Couvrez chacun de nous de votre perpétuelle protection,',
      'afin que, à votre exemple et soutenus par votre secours,',
      'nous puissions vivre saintement, pieusement mourir',
      'et obtenir la béatitude éternelle du ciel.',
      'Amen.',
    ],
  },
}
