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
