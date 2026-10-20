import type { PriereComposee } from './angelus'

// Trois prières de saint Louis-Marie Grignion de Montfort, validées ligne par
// ligne par le porteur du projet le 2026-10-20. Textes des éditions
// montfortaines (montfort.org et montfortian.info, sur l'édition critique) ;
// la formule courte, du Traité (Gaume, 1859). Seule la typographie est
// retouchée (apostrophes, « cœur », « Saint-Esprit », « ici-bas »).

export type PriereMontfort = 'priere-a-marie' | 'consecration' | 'tout-a-vous'

export const PRIERES_MONTFORT: Record<PriereMontfort, PriereComposee> = {
  // Le Secret de Marie, n° 68-69.
  'priere-a-marie': {
    titre: 'Prière à Marie',
    morceaux: [
      {
        lignes: [
          'Je vous salue Marie, Fille bien-aimée du Père Éternel ;',
          'je vous salue, Marie, Mère admirable du Fils ;',
          'je vous salue, Marie, Épouse très fidèle du Saint-Esprit ;',
          'je vous salue, Marie, ma chère Mère, mon aimable Maîtresse et ma puissante Souveraine,',
          'je vous salue, ma joie, ma gloire, mon cœur et mon âme !',
          'Vous êtes toute à moi par miséricorde,',
          'et je suis tout à vous par justice.',
          'Et je ne le suis pas encore assez :',
          'je me donne à vous tout entier de nouveau, en qualité d’esclave éternel,',
          'sans rien réserver pour moi ni pour autre.',
          '',
          'Si vous voyez encore en moi quelque chose qui ne vous appartienne pas,',
          'je vous supplie de le prendre en ce moment,',
          'et de vous rendre la Maîtresse absolue de mon pouvoir ;',
          'de détruire et déraciner et d’y anéantir tout ce qui déplaît à Dieu,',
          'et d’y planter, d’y élever et d’y opérer tout ce qui vous plaira.',
          '',
          'Et que la lumière de votre foi dissipe les ténèbres de mon esprit ;',
          'que votre humilité profonde prenne la place de mon orgueil ;',
          'que votre contemplation sublime arrête les distractions de mon imagination vagabonde ;',
          'que votre vue continuelle de Dieu remplisse ma mémoire de sa présence ;',
          'que l’incendie de la charité de votre cœur dilate et embrase la tiédeur et la froideur du mien ;',
          'que vos vertus prennent la place de mes péchés ;',
          'que vos mérites soient mon ornement et mon supplément devant Dieu.',
          '',
          'Enfin, ma très chère et bien-aimée Mère, faites, s’il se peut,',
          'que je n’aie point d’autre esprit que le vôtre pour connaître Jésus-Christ et ses divines volontés ;',
          'que je n’aie point d’autre âme que la vôtre pour louer et glorifier le Seigneur ;',
          'que je n’aie point d’autre cœur que le vôtre pour aimer Dieu d’un amour pur et d’un amour ardent comme vous.',
          '',
          'Je ne vous demande ni visions, ni révélations, ni goûts, ni plaisirs même spirituels.',
          'C’est à vous de voir clairement sans ténèbres ;',
          'c’est à vous de goûter pleinement, sans amertume ;',
          'c’est à vous de triompher glorieusement à la droite de votre Fils dans le ciel, sans aucune humiliation ;',
          'c’est à vous de commander absolument aux anges et aux hommes et aux démons, sans résistance,',
          'et enfin de disposer, selon votre volonté, de tous les biens de Dieu, sans aucune réserve.',
          '',
          'Voilà, divine Marie, la très bonne part que le Seigneur vous a donnée et qui ne vous sera jamais ôtée ;',
          'et ce qui me donne une grande joie.',
          'Pour ma part, ici-bas, je n’en veux point d’autre que celle que vous avez eue, savoir :',
          'de croire purement, sans rien goûter ni voir ;',
          'de souffrir joyeusement, sans consolation des créatures ;',
          'de mourir continuellement à moi-même, sans relâche ;',
          'et de travailler fortement jusqu’à la mort, pour vous, sans aucun intérêt, comme le plus vil de vos esclaves.',
          '',
          'La seule grâce que je vous demande, par pure miséricorde,',
          'c’est que, tous les jours et moments de ma vie, je dise trois fois Amen :',
          'Ainsi soit-il, à tout ce que vous avez fait sur la terre, lorsque vous y viviez ;',
          'Ainsi soit-il, à tout ce que vous faites à présent dans le ciel ;',
          'Ainsi soit-il, à tout ce que vous faites en mon âme,',
          'afin qu’il n’y ait que vous à glorifier pleinement Jésus en moi pendant le temps et l’éternité.',
          'Ainsi soit-il.',
        ],
      },
    ],
  },
  // L'Amour de la Sagesse éternelle, n° 223-227.
  consecration: {
    titre: 'Consécration à Jésus par Marie',
    morceaux: [
      {
        lignes: [
          'Ô Sagesse éternelle et incarnée,',
          'ô très aimable et adorable Jésus,',
          'vrai Dieu et vrai homme,',
          'Fils unique du Père éternel et de Marie toujours vierge !',
          'Je vous adore profondément dans le sein et les splendeurs de votre Père, pendant l’éternité,',
          'et dans le sein virginal de Marie, votre très digne Mère, dans le temps de votre incarnation.',
          '',
          'Je vous rends grâce de ce que vous vous êtes anéanti vous-même, en prenant la forme d’un esclave, pour me tirer du cruel esclavage du démon.',
          'Je vous loue et glorifie de ce que vous avez bien voulu vous soumettre à Marie, votre sainte Mère, en toutes choses, afin de me rendre par elle votre fidèle esclave.',
          '',
          'Mais, hélas ! ingrat et infidèle que je suis, je ne vous ai pas gardé les vœux et les promesses que je vous ai si solennellement faits dans mon baptême :',
          'je n’ai point rempli mes obligations ;',
          'je ne mérite pas d’être appelé votre enfant ni votre esclave ;',
          'et comme il n’y a rien en moi qui ne mérite vos rebuts et votre colère, je n’ose plus par moi-même approcher de votre sainte et auguste Majesté.',
          '',
          'C’est pourquoi j’ai recours à l’intercession et à la miséricorde de votre très sainte Mère, que vous m’avez donnée pour médiatrice auprès de vous ;',
          'et c’est par son moyen que j’espère obtenir de vous la contrition et le pardon de mes péchés, l’acquisition et la conservation de la Sagesse.',
          '',
          'Je vous salue donc, ô Marie Immaculée, tabernacle vivant de la Divinité, où la Sagesse éternelle cachée veut être adorée des anges et des hommes.',
          'Je vous salue, ô Reine du ciel et de la terre, à l’empire de qui tout est soumis, tout ce qui est au-dessous de Dieu.',
          'Je vous salue, ô Refuge assuré des pécheurs, dont la miséricorde n’a manqué à personne ;',
          'exaucez les désirs que j’ai de la divine Sagesse, et recevez pour cela les vœux et les offres que ma bassesse vous présente.',
          '',
          'Moi, N…, pécheur infidèle, je renouvelle et ratifie aujourd’hui entre vos mains les vœux de mon baptême :',
          'je renonce pour jamais à Satan, à ses pompes et à ses œuvres,',
          'et je me donne tout entier à Jésus-Christ, la Sagesse incarnée, pour porter ma croix à sa suite tous les jours de ma vie.',
          'Et afin que je lui sois plus fidèle que je n’ai été jusqu’ici, je vous choisis aujourd’hui, en présence de toute la cour céleste, pour ma Mère et Maîtresse.',
          'Je vous livre et consacre, en qualité d’esclave, mon corps et mon âme, mes biens intérieurs et extérieurs, et la valeur même de mes bonnes actions passées, présentes et futures,',
          'vous laissant un entier et plein droit de disposer de moi et de tout ce qui m’appartient, sans exception, selon votre bon plaisir, à la plus grande gloire de Dieu, dans le temps et l’éternité.',
          '',
          'Recevez, ô Vierge bénigne, cette petite offrande de mon esclavage, en l’honneur et union de la soumission que la Sagesse éternelle a bien voulu avoir de votre maternité ;',
          'en hommage de la puissance que vous avez tous deux sur ce petit vermisseau et ce misérable pécheur,',
          'et en action de grâce des privilèges dont la Sainte-Trinité vous a favorisée.',
          'Je proteste que je veux désormais, comme votre véritable esclave, chercher votre honneur et vous obéir en toutes choses.',
          '',
          'Ô Mère admirable ! Présentez-moi à votre cher Fils, en qualité d’esclave éternel, afin que, m’ayant racheté par vous, il me reçoive par vous.',
          '',
          'Ô Mère de miséricorde ! Faites-moi la grâce d’obtenir la vraie sagesse de Dieu et de me mettre pour cela au nombre de ceux que vous aimez, que vous enseignez, que vous conduisez, que vous nourrissez et protégez comme vos enfants et vos esclaves.',
          '',
          'Ô Vierge fidèle, rendez-moi en toutes choses un si parfait disciple, imitateur et esclave de la Sagesse incarnée, Jésus-Christ, votre Fils, que j’arrive, par votre intercession, à votre exemple, à la plénitude de son âge sur la terre et de sa gloire dans les cieux.',
          'Ainsi soit-il.',
        ],
      },
    ],
  },
  // Traité de la vraie dévotion, n° 233 : pour renouveler sa consécration.
  'tout-a-vous': {
    titre: 'Je suis tout à vous',
    morceaux: [
      {
        lignes: [
          'Je suis tout à vous, et tout ce que j’ai vous appartient,',
          'ô mon aimable Jésus, par Marie votre sainte Mère.',
        ],
      },
    ],
  },
}
