// Recueil des offices : ce que l'app ajoute aux textes de l'AELF selon les
// rubriques. Textes et règles validés par le porteur du projet le 2026-10-06,
// puis figés par le test d'empreinte (empreinte.test.ts) : toute modification
// demande une nouvelle validation.
// Même format que les prières : un vers par ligne, une ligne vide ('') entre
// deux strophes, « V/ » ou « R/ » en tête d'un verset ou de son répons.
// Sources : Présentation générale de la liturgie des heures (PGLH), Missel
// romain de 2021 ; versets d'introduction et conclusions brèves tels que
// l'AELF les donne.

export type TexteOfficeId =
  | 'gloire-au-pere'
  | 'introduction'
  | 'introduction-invitatoire'
  | 'benediction'
  | 'benissons'
  | 'je-confesse'
  | 'absolution'

export const TEXTES_OFFICE: Record<TexteOfficeId, string[]> = {
  // Le Gloire au Père de la liturgie des heures francophone.
  'gloire-au-pere': [
    'Gloire au Père, et au Fils et au Saint-Esprit,',
    'au Dieu qui est, qui était et qui vient,',
    'pour les siècles des siècles.',
    'Amen.',
  ],
  introduction: ['V/ Dieu, viens à mon aide,', 'R/ Seigneur, à notre secours.'],
  'introduction-invitatoire': [
    'V/ Seigneur, ouvre mes lèvres,',
    'R/ et ma bouche publiera ta louange.',
  ],
  // Fin des laudes et des vêpres, sans prêtre ni diacre (PGLH 54).
  benediction: [
    'Que le Seigneur nous bénisse, qu’il nous garde de tout mal, et nous conduise à la vie éternelle.',
    'Amen.',
  ],
  // Fin de l'office des lectures et des petites heures (PGLH 69 et 79).
  benissons: ['V/ Bénissons le Seigneur.', 'R/ Nous rendons grâce à Dieu.'],
  // Aux complies, après l'examen de conscience (PGLH 86, Missel romain 2021).
  'je-confesse': [
    'Je confesse à Dieu tout-puissant,',
    'je reconnais devant vous, frères et sœurs,',
    'que j’ai péché en pensée, en parole, par action et par omission ;',
    'oui, j’ai vraiment péché.',
    'C’est pourquoi je supplie la bienheureuse Vierge Marie,',
    'les anges et tous les saints,',
    'et vous aussi, frères et sœurs,',
    'de prier pour moi le Seigneur notre Dieu.',
  ],
  absolution: [
    'Que Dieu tout-puissant nous fasse miséricorde ; qu’il nous pardonne nos péchés et nous conduise à la vie éternelle.',
    'Amen.',
  ],
}

// La rubrique qui ouvre l'examen de conscience des complies.
export const RUBRIQUE_EXAMEN = 'Examen de conscience'

// À qui s'adresse l'oraison : au Père, au Père en nommant le Fils à la fin,
// ou au Fils.
export type FormeConclusion = 'pere' | 'fils-a-la-fin' | 'au-fils'

// Longues à l'office des lectures, aux laudes et aux vêpres (Missel romain
// 2021) ; brèves aux petites heures et aux complies (telles que l'AELF les
// donne ; « Lui qui règne… » complétée sur le modèle de « Toi qui règnes… »).
export const CONCLUSIONS: Record<'longue' | 'breve', Record<FormeConclusion, string>> = {
  longue: {
    pere: 'Par Jésus Christ, ton Fils, notre Seigneur, qui vit et règne avec toi dans l’unité du Saint-Esprit, Dieu, pour les siècles des siècles.',
    'fils-a-la-fin':
      'Lui qui vit et règne avec toi dans l’unité du Saint-Esprit, Dieu, pour les siècles des siècles.',
    'au-fils':
      'Toi qui vis et règnes avec le Père dans l’unité du Saint-Esprit, Dieu, pour les siècles des siècles.',
  },
  breve: {
    pere: 'Par Jésus, le Christ, notre Seigneur.',
    'fils-a-la-fin': 'Lui qui règne pour les siècles des siècles.',
    'au-fils': 'Toi qui règnes pour les siècles des siècles.',
  },
}

// Les règles, telles que le porteur du projet les a validées. Le code qui les
// applique (src/office/rubriques.ts) les cite par leur numéro.
export const REGLES_RUBRIQUES: string[] = [
  'R1. Ouverture de la journée : le premier office que tu ouvres dans la journée, laudes ou office des lectures, commence par « Seigneur, ouvre mes lèvres » suivi de l’invitatoire. Tous les autres commencent par « Dieu, viens à mon aide », puis le Gloire au Père et l’Alléluia. Un lien en tête de l’office permet de déplacer l’invitatoire.',
  'R2. Alléluia de l’introduction : il est omis du mercredi des Cendres jusqu’à la Vigile pascale.',
  'R3. Invitatoire : on dit l’antienne, puis on la répète aussitôt. Elle est ensuite reprise après chaque strophe du psaume. Le psaume se termine par le Gloire au Père, puis une dernière fois par l’antienne.',
  'R4. Antiennes : chaque antienne se dit avant et après son psaume ou son cantique. Quand l’AELF ne donne pas d’antienne pour un psaume, l’antienne précédente vaut pour les deux ; elle se dit alors avant le premier psaume et après le dernier.',
  'R5. Gloire au Père : il est ajouté après chaque psaume, chaque section de psaume, chaque cantique de l’Ancien et du Nouveau Testament, les cantiques de Zacharie, de Marie et de Syméon, et le psaume de l’invitatoire. Seule exception : le cantique des trois enfants « Toutes les œuvres du Seigneur » (Dn 3, 57-88), qui se termine déjà par sa propre louange de la Trinité. Rien n’est ajouté au Te Deum, aux hymnes ni aux répons.',
  'R6. Notre Père : il est écrit en entier aux laudes et aux vêpres.',
  'R7. Conclusion de l’oraison : la forme longue se dit à l’office des lectures, aux laudes et aux vêpres ; la forme brève, à tierce, sexte, none et complies. Le choix de la forme suit l’abréviation de l’AELF quand elle existe (« Lui qui règne. », « Toi qui règnes. ») ; sans abréviation, une prière adressée au Christ prend « Toi qui… », une prière qui le nomme à la fin prend « Lui qui… », toutes les autres prennent « Par Jésus… ». Quand l’AELF donne déjà la conclusion complète, l’app la garde telle quelle et ajoute seulement « Amen » s’il manque.',
  'R8. Fin de l’office : « Que le Seigneur nous bénisse » conclut les laudes et les vêpres ; « Bénissons le Seigneur », l’office des lectures et les petites heures. Les complies gardent la bénédiction que donne l’AELF. Quand l’AELF joint à l’oraison son propre envoi (« Bénissons le Seigneur, alléluia, alléluia », dans l’octave de Pâques et à la Pentecôte), cet envoi tient lieu de fin.',
  'R9. Complies : l’examen de conscience se place juste après l’introduction, avant l’hymne.',
  'R10. Prier à plusieurs : la rubrique « Tous » précède chaque Gloire au Père.',
  'R11. Répons bref : là où l’AELF abrège la reprise du répons, l’app l’écrit en entier, signalée comme ajout : après « R/ », tout le répons ; après « * », sa seconde partie. Le signe abrégé disparaît. Les répons de l’office des lectures restent tels quels.',
]
