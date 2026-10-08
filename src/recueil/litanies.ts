// Les Litanies de la Sainte Vierge : version du Saint-Siège, ajouts de 2018 et
// 2020 compris, mises au vous. Texte validé ligne par ligne par le porteur du
// projet le 2026-10-08, figé par le test d'empreinte (empreinte.test.ts).
// Pas d'oraison propre : au chapelet, l'oraison du Rosaire les conclut.

// Celui qui mène dit l'invocation, tous la réponse. Une invocation sans réponse
// écrite garde celle de l'invocation précédente (« priez pour nous »).
export interface Invocation {
  invocation: string
  reponse?: string
}

export interface Litanies {
  titre: string
  invocations: Invocation[]
}

export const LITANIES: Litanies = {
  titre: 'Litanies de la Sainte Vierge',
  invocations: [
    { invocation: 'Seigneur, prends pitié.', reponse: 'Seigneur, prends pitié.' },
    { invocation: 'Ô Christ, prends pitié.', reponse: 'Ô Christ, prends pitié.' },
    { invocation: 'Seigneur, prends pitié.', reponse: 'Seigneur, prends pitié.' },
    { invocation: 'Christ, écoute-nous.', reponse: 'Christ, écoute-nous.' },
    { invocation: 'Christ, exauce-nous.', reponse: 'Christ, exauce-nous.' },
    { invocation: 'Père du ciel, toi qui es Dieu,', reponse: 'aie pitié de nous.' },
    { invocation: 'Fils, Rédempteur du monde, toi qui es Dieu,' },
    { invocation: 'Esprit Saint, toi qui es Dieu,' },
    { invocation: 'Trinité sainte, toi qui es un seul Dieu,' },
    { invocation: 'Sainte Marie,', reponse: 'priez pour nous.' },
    { invocation: 'Sainte Mère de Dieu,' },
    { invocation: 'Sainte Vierge des vierges,' },
    { invocation: 'Mère du Christ,' },
    { invocation: 'Mère de l’Église,' },
    { invocation: 'Mère de miséricorde,' },
    { invocation: 'Mère de la grâce divine,' },
    { invocation: 'Mère de l’espérance,' },
    { invocation: 'Mère très pure,' },
    { invocation: 'Mère très chaste,' },
    { invocation: 'Mère toujours vierge,' },
    { invocation: 'Mère sans tache,' },
    { invocation: 'Mère très aimable,' },
    { invocation: 'Mère admirable,' },
    { invocation: 'Mère du bon conseil,' },
    { invocation: 'Mère du Créateur,' },
    { invocation: 'Mère du Sauveur,' },
    { invocation: 'Vierge très prudente,' },
    { invocation: 'Vierge vénérable,' },
    { invocation: 'Vierge digne de louange,' },
    { invocation: 'Vierge puissante,' },
    { invocation: 'Vierge clémente,' },
    { invocation: 'Vierge fidèle,' },
    { invocation: 'Miroir de la sainteté divine,' },
    { invocation: 'Siège de la Sagesse,' },
    { invocation: 'Cause de notre joie,' },
    { invocation: 'Temple de l’Esprit Saint,' },
    { invocation: 'Tabernacle de la gloire éternelle,' },
    { invocation: 'Demeure toute consacrée à Dieu,' },
    { invocation: 'Rose mystique,' },
    { invocation: 'Tour de David,' },
    { invocation: 'Tour d’ivoire,' },
    { invocation: 'Maison d’or,' },
    { invocation: 'Arche d’alliance,' },
    { invocation: 'Porte du ciel,' },
    { invocation: 'Étoile du matin,' },
    { invocation: 'Salut des malades,' },
    { invocation: 'Refuge des pécheurs,' },
    { invocation: 'Réconfort des migrants,' },
    { invocation: 'Consolatrice des affligés,' },
    { invocation: 'Secours des chrétiens,' },
    { invocation: 'Reine des anges,' },
    { invocation: 'Reine des patriarches,' },
    { invocation: 'Reine des prophètes,' },
    { invocation: 'Reine des apôtres,' },
    { invocation: 'Reine des martyrs,' },
    { invocation: 'Reine des confesseurs,' },
    { invocation: 'Reine des vierges,' },
    { invocation: 'Reine de tous les saints,' },
    { invocation: 'Reine conçue sans le péché originel,' },
    { invocation: 'Reine élevée au ciel,' },
    { invocation: 'Reine du très saint Rosaire,' },
    { invocation: 'Reine de la famille,' },
    { invocation: 'Reine de la paix,' },
    {
      invocation: 'Agneau de Dieu, qui enlèves le péché du monde,',
      reponse: 'pardonne-nous, Seigneur.',
    },
    {
      invocation: 'Agneau de Dieu, qui enlèves le péché du monde,',
      reponse: 'écoute-nous, Seigneur.',
    },
    {
      invocation: 'Agneau de Dieu, qui enlèves le péché du monde,',
      reponse: 'aie pitié de nous, Seigneur.',
    },
  ],
}
