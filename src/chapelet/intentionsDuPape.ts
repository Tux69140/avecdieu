// Les intentions de prière du pape, une par mois, dites sur le Notre Père de
// la prière aux intentions du Saint-Père (phase 18). Texte français officiel
// du Réseau mondial de prière du pape, recopié mot pour mot : 2026, livret
// officiel ; 2027, site français du Réseau. Validées par le porteur du projet
// le 2026-10-09 et figées par leur test. Embarquées : aucun autre site que
// l'AELF n'est interrogé, une version de l'app par an apporte l'année
// suivante. Ce ne sont pas des textes sacrés du recueil.

// La ligne rouge sur le Notre Père, et ce qui précède l'intention du mois.
export const AUX_INTENTIONS_DU_SAINT_PERE = 'Aux intentions du Saint-Père.'
export const CE_MOIS_CI = 'Ce mois-ci :'

// La partie de la page « Chapelet ou Rosaire ? » qui explique cette prière,
// où mène l'intention du mois.
export const ANCRE_AUX_INTENTIONS = 'aux-intentions-du-saint-pere'

// Par année, les douze mois de janvier à décembre : [titre, texte].
export const INTENTIONS_DU_PAPE: Record<number, readonly (readonly [string, string])[]> = {
  2026: [
    [
      'Pour prier avec la Parole de Dieu',
      'Prions pour que la prière, à partir de la Parole de Dieu, nourrisse nos vies et soit une source d’espérance au sein de nos communautés, nous aidant à édifier une Église plus fraternelle et missionnaire.',
    ],
    [
      'Pour les enfants atteints de maladies incurables',
      'Prions pour que les enfants atteints de maladies incurables ainsi que leurs familles reçoivent les soins médicaux et le soutien nécessaires, sans jamais perdre force et espérance.',
    ],
    [
      'Pour le désarmement et la paix',
      'Prions pour que les nations s’engagent dans un désarmement effectif, en particulier le désarmement nucléaire, et que les dirigeants du monde choisissent le chemin du dialogue et de la diplomatie et non celui de la violence.',
    ],
    [
      'Pour les prêtres en crise',
      'Prions pour les prêtres qui traversent des moments de crise dans leur vocation, afin qu’ils trouvent l’accompagnement nécessaire et que les communautés les soutiennent avec compréhension et prière.',
    ],
    [
      'Pour une alimentation pour tous',
      'Prions pour que chacun, des grands producteurs aux petits consommateurs, s’engage à éviter le gaspillage alimentaire et pour que tous aient accès à une alimentation de qualité.',
    ],
    [
      'Pour les valeurs du sport',
      'Prions pour que le sport soit un instrument de paix, de rencontre et de dialogue entre les cultures et les nations, et que par lui soient promues des valeurs telles que le respect, la solidarité et le dépassement personnel.',
    ],
    [
      'Pour le respect de la vie humaine',
      'Prions pour le respect et la protection de la vie humaine à toutes ses étapes, en la reconnaissant comme un don de Dieu.',
    ],
    [
      'Pour l’évangélisation des villes',
      'Prions pour que, dans les grandes villes souvent marquées par l’anonymat et la solitude, nous puissions trouver de nouvelles façons de proclamer l’Évangile, en recherchant des moyens créatifs pour construire la communauté.',
    ],
    [
      'Pour la protection de l’eau',
      'Prions pour une gestion juste et durable de l’eau, ressource vitale pour nous, afin que tous puissent y accéder de façon équitable.',
    ],
    [
      'Pour la pastorale de la santé mentale',
      'Prions pour que la pastorale de la santé mentale se développe dans toute l’Église et aide à surmonter la stigmatisation et la discrimination à l’égard des personnes atteintes de maladies mentales.',
    ],
    [
      'Pour le bon usage de la richesse',
      'Prions pour un bon usage de la richesse afin que, ne cédant pas à la tentation de l’égoïsme, elle soit toujours au service du bien commun et de la solidarité avec les plus démunis.',
    ],
    [
      'Pour les familles monoparentales',
      'Prions pour les familles qui vivent l’absence d’une mère ou d’un père, afin qu’elles trouvent dans l’Église un soutien et un accompagnement, et dans la foi une aide et une force, durant les moments difficiles.',
    ],
  ],
  2027: [
    [
      'Pour la découverte de la force de la prière',
      'Prions pour que dans l’Église, nous découvrions la puissance de la prière, cette rencontre personnelle avec le Seigneur qui transforme notre cœur et le monde.',
    ],
    [
      'Pour le soutien des personnes qui prennent soin des autres',
      'Prions pour tous ceux qui veillent à la santé des personnes, afin qu’ils reçoivent le soutien nécessaire et puissent ainsi avec patience, sagesse et force, ouvrir des chemins d’espérance et de guérison intérieure.',
    ],
    [
      'Pour le respect de la dignité de la vie humaine',
      'Face à une culture centrée sur la productivité et l’immédiateté, prions pour que chacun de nous puisse découvrir et valoriser la dignité de chaque personne.',
    ],
    [
      'Pour l’art, un don qui humanise',
      'Prions pour que l’art soit accueilli comme un véritable don qui nous humanise, élève notre esprit et nous aide à contempler la beauté de Dieu au sein de la création.',
    ],
    [
      'Pour des opportunités de travail pour tous',
      'Prions pour que le développement technologique ouvre de nouveaux chemins de travail qui préservent la dignité des personnes et que la collaboration entre les générations renforce un avenir où chacun puisse offrir ses talents au service du bien commun.',
    ],
    [
      'Pour un bon usage de l’intelligence artificielle',
      'Prions pour que le développement de l’intelligence artificielle soit toujours au service de la dignité humaine et que nous sachions l’utiliser avec sagesse.',
    ],
    [
      'Pour les grands-parents et les personnes âgées',
      'Prions pour que, dans l’Église, nous sachions valoriser le trésor de foi et de sagesse que nous offrent les grands-parents et les anciens, et que nous apprenions de leur expérience.',
    ],
    [
      'Pour la vocation des jeunes',
      'Prions pour que les jeunes, en recherche de leur propre vocation, reconnaissent en Jésus-Christ un compagnon de route, à qui ils peuvent ouvrir leur cœur.',
    ],
    [
      'Pour une conversion écologique intégrale',
      'Prions pour que nous apprenions à vivre une relation nouvelle avec la création, en la protégeant et en trouvant, dans la contemplation de l’œuvre de Dieu, un chemin vers une vie plus harmonieuse et source de gratitude.',
    ],
    [
      'Pour les communautés chrétiennes',
      'Prions pour que chaque paroisse, communauté ou groupe chrétien soit un centre de rayonnement missionnaire formant de nouveaux disciples au service de l’Évangile.',
    ],
    [
      'Pour l’intégration des migrants',
      'Prions pour que les migrants et les personnes déplacées soient accompagnés et consolés par la Sainte Famille, dans leur propre chemin de déracinement ; qu’ils trouvent des communautés qui les accueillent avec dignité et solidarité pour une véritable intégration.',
    ],
    [
      'Pour la vocation chrétienne de la famille',
      'Prions pour que les familles chrétiennes soient des témoins vivants de l’Évangile dans la société, en apprenant toujours davantage à cultiver la foi, l’espérance et l’amour.',
    ],
  ],
}

export interface IntentionDuMois {
  titre: string
  texte: string
}

// L'intention du mois du téléphone, ou rien pour une année que l'app n'a pas.
export function intentionDuMois(jour: Date): IntentionDuMois | undefined {
  const intention = INTENTIONS_DU_PAPE[jour.getFullYear()]?.[jour.getMonth()]
  return intention && { titre: intention[0], texte: intention[1] }
}

// « Ce mois-ci : pour la pastorale de la santé mentale » : le titre se lit
// dans la ligne, sans sa majuscule.
export const titreEnLigne = (titre: string) => titre.charAt(0).toLowerCase() + titre.slice(1)
