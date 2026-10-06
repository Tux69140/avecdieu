// Recueil des mystères du Rosaire. Textes validés ligne par ligne par le porteur
// du projet, puis figés par le test d'empreinte (empreinte.test.ts).

export type SerieId = 'joyeux' | 'lumineux' | 'douloureux' | 'glorieux'

export interface SerieDeMysteres {
  titre: string
  mysteres: [string, string, string, string, string]
}

export const SERIES: Record<SerieId, SerieDeMysteres> = {
  joyeux: {
    titre: 'Mystères joyeux',
    mysteres: [
      'L’Annonciation',
      'La Visitation',
      'La Nativité',
      'La Présentation de Jésus au Temple',
      'Le Recouvrement de Jésus au Temple',
    ],
  },
  lumineux: {
    titre: 'Mystères lumineux',
    mysteres: [
      'Le Baptême de Jésus au Jourdain',
      'Les Noces de Cana',
      'L’Annonce du Royaume de Dieu et l’appel à la conversion',
      'La Transfiguration',
      'L’Institution de l’Eucharistie',
    ],
  },
  douloureux: {
    titre: 'Mystères douloureux',
    mysteres: [
      'L’Agonie de Jésus à Gethsémani',
      'La Flagellation',
      'Le Couronnement d’épines',
      'Le Portement de la croix',
      'La Crucifixion et la mort de Jésus',
    ],
  },
  glorieux: {
    titre: 'Mystères glorieux',
    mysteres: [
      'La Résurrection',
      'L’Ascension',
      'La Pentecôte',
      'L’Assomption de la Vierge Marie',
      'Le Couronnement de la Vierge Marie',
    ],
  },
}

// Fruit de chaque mystère, dans l'ordre des mystères de la série.
// « tradition » recopie la demande de chaque dizaine chez saint Louis-Marie
// Grignion de Montfort (Le Secret admirable du très saint Rosaire) ; les
// mystères lumineux, ajoutés en 2002, n'en ont pas. « aujourdhui » propose un
// autre angle de méditation (choix du porteur du projet, 2026-10-06).
export interface Fruit {
  aujourdhui: string
  tradition: string | null
}

type CinqFruits = [Fruit, Fruit, Fruit, Fruit, Fruit]

export const FRUITS: Record<SerieId, CinqFruits> = {
  joyeux: [
    { aujourdhui: 'l’humilité', tradition: 'une profonde humilité de cœur' },
    {
      aujourdhui: 'la charité envers le prochain',
      tradition: 'une parfaite charité envers notre prochain',
    },
    {
      aujourdhui: 'l’esprit de pauvreté',
      tradition: 'le détachement des biens du monde, l’amour de la pauvreté et des pauvres',
    },
    {
      aujourdhui: 'l’obéissance',
      tradition: 'le don de la sagesse et la pureté de cœur et de corps',
    },
    {
      aujourdhui: 'la recherche de Dieu en toute chose',
      tradition:
        'notre conversion et celle des pécheurs, hérétiques et schismatiques, et idolâtres',
    },
  ],
  lumineux: [
    { aujourdhui: 'la fidélité aux promesses du baptême', tradition: null },
    { aujourdhui: 'la confiance en Marie', tradition: null },
    { aujourdhui: 'la conversion du cœur', tradition: null },
    { aujourdhui: 'le désir de la sainteté', tradition: null },
    { aujourdhui: 'l’amour de l’Eucharistie', tradition: null },
  ],
  douloureux: [
    {
      aujourdhui: 'la contrition de nos péchés',
      tradition:
        'une parfaite contrition de nos péchés et une parfaite conformité à votre sainte volonté',
    },
    { aujourdhui: 'la mortification', tradition: 'une parfaite mortification de nos sens' },
    { aujourdhui: 'le courage dans les humiliations', tradition: 'un grand mépris du monde' },
    {
      aujourdhui: 'la patience dans les épreuves',
      tradition:
        'une grande patience pour porter notre croix à votre suite tous les jours de notre vie',
    },
    {
      aujourdhui: 'le don de soi',
      tradition:
        'une grande horreur du péché, l’amour de la Croix, et une bonne mort pour nous et pour ceux qui sont maintenant à l’agonie',
    },
  ],
  glorieux: [
    { aujourdhui: 'la foi', tradition: 'une vive foi' },
    {
      aujourdhui: 'l’espérance et le désir du Ciel',
      tradition: 'une ferme espérance et un grand désir du paradis',
    },
    {
      aujourdhui: 'la docilité à l’Esprit Saint',
      tradition:
        'la divine sagesse pour connaître, goûter et pratiquer la vérité et la faire participer à tout le monde',
    },
    {
      aujourdhui: 'la grâce d’une bonne mort',
      tradition: 'une vraie dévotion envers elle, pour bien vivre et bien mourir',
    },
    {
      aujourdhui: 'la persévérance finale',
      tradition:
        'la persévérance et l’augmentation dans la vertu jusqu’à la mort, et la couronne éternelle, qui nous est préparée',
    },
  ],
}
