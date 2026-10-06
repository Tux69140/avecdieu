# PRD — Avec Dieu

## Problème

Le priant qui veut sanctifier sa journée par la liturgie des heures et le chapelet jongle aujourd'hui entre plusieurs supports. Il lit les textes de l'AELF sur un site ou une app, mais ces textes sont **abrégés** : antienne donnée une seule fois, Gloire au Père absent, Notre Père réduit à son titre, oraison tronquée. Il faut donc connaître les rubriques par cœur pour dire l'office correctement. Pour le chapelet, il récite de mémoire ou avec un livret, en comptant sur ses doigts ou sur un chapelet, sans le mystère du jour ni son passage biblique sous les yeux. Rien ne le rappelle aux heures de prière, qu'il oublie au fil de la journée. Enfin, sans réseau (transports, retraite, campagne), il n'a plus accès aux textes.

Le besoin est immédiat : le porteur du projet en a besoin maintenant pour sa propre prière quotidienne.

## Solution

Avec Dieu accompagne la prière de toute la journée sur un téléphone Android.

- L'accueil montre où l'on en est : le jour liturgique, et un petit cadran solaire où chaque office est une perle posée sur l'arc du jour.
- **Les offices** des 7 heures s'affichent **complets**, reconstitués selon les rubriques à partir des textes de l'AELF. Ils se lisent d'un trait, avec des repères qui guident sans interrompre.
- **Le chapelet** se récite grain par grain, d'un simple toucher, avec la méditation du mystère du jour : titre, fruit et passage biblique.
- Des **rappels** préviennent à l'heure de chaque prière choisie, à heure fixe ou selon la course du soleil.
- Tout fonctionne **hors-ligne** au moins une semaine à l'avance.
- L'app est gratuite, sans compte ni publicité, et rien ne quitte le téléphone.

## Utilisateur cible

**Utilisateur principal : un laïc catholique francophone, pratiquant, vivant en France**, qui veut prier chaque jour selon le rythme de l'Église. Il dit au moins les laudes, les vêpres et les complies, parfois le milieu du jour, et un chapelet. Il prie **seul**, parfois **en famille**, chez lui ou en déplacement, sur son **téléphone Android**, parfois sans réseau. Il connaît par cœur les prières courantes du chapelet, mais **pas toutes les rubriques** de l'office : il compte sur l'app pour lui dire quoi répéter, quoi ajouter, et quel mystère méditer. Le porteur du projet est l'utilisateur de référence.

**Utilisateurs secondaires, après publication :**

- des francophones d'autres zones liturgiques (Belgique, Suisse, Canada, Afrique…) ;
- des débutants qui découvrent la liturgie des heures et veulent l'apprendre en priant.

## User Stories

**Accueil**

- **US-1** En tant que priant, je veux voir dès l'ouverture la date, le temps liturgique, la semaine, la fête du jour et sa couleur liturgique, afin de savoir où j'en suis dans l'année liturgique.
- **US-2** En tant que priant, je veux un cadran solaire montrant le soleil à l'heure actuelle et chaque office comme une perle sur l'arc du jour, afin de situer d'un coup d'œil ma journée de prière.
- **US-3** En tant que priant, je veux toucher une perle du cadran pour ouvrir l'office correspondant, afin de commencer à prier sans chercher.
- **US-4** En tant que priant, je veux voir la prière du moment mise en avant avec un seul bouton, afin de prier immédiatement à l'heure voulue.
- **US-5** En tant que priant, je veux la liste des 7 offices avec leur heure, les offices passés étant atténués mais encore accessibles, afin de rattraper un office en retard.
- **US-6** En tant que priant, je veux une carte « Chapelet du jour » indiquant la série de mystères du jour, afin de lancer mon chapelet en un geste.
- **US-7** En tant que priant, je veux naviguer vers un autre jour, afin de préparer ou relire un office.
- **US-8** En tant que priant sans réseau, je veux un message clair quand un jour demandé n'est pas disponible hors-ligne, avec la date jusqu'à laquelle les textes sont disponibles, afin de savoir ce que je peux prier.

**Chapelet**

- **US-9** En tant que priant, je veux que le chapelet du jour propose automatiquement la série de mystères du jour, afin de couvrir tout le Rosaire dans la semaine.
- **US-10** En tant que priant, je veux pouvoir choisir une autre série de mystères que celle du jour, afin de suivre une intention particulière ou de rattraper un jour manqué.
- **US-11** En tant que priant, je veux toucher n'importe où sur l'écran pour passer à la prière suivante, afin de prier sans viser de bouton.
- **US-12** En tant que priant, je veux glisser pour revenir à la prière précédente, afin de rattraper un toucher involontaire.
- **US-13** En tant que priant, je veux voir un chapelet dessiné où le grain en cours est mis en évidence, afin de savoir où j'en suis dans la dizaine.
- **US-14** En tant que priant, je veux une vibration courte à chaque grain et une plus marquée en fin de dizaine, afin de prier sans regarder l'écran.
- **US-15** En tant que priant, je veux qu'au début de chaque dizaine le mystère soit annoncé avec son titre, son fruit, sa référence biblique et son passage, afin de méditer pendant la dizaine.
- **US-16** En tant que priant, je veux que l'écran d'annonce ne s'avance qu'en touchant la grosse perle, afin de lire le passage sans lancer la dizaine par erreur.
- **US-17** En tant que priant en mode compact, je veux que le passage soit replié derrière un lien « Lire le passage », afin d'avancer vite tout en gardant la méditation à portée.
- **US-18** En tant que priant, je veux choisir entre texte complet et texte compact (nom de la prière et compteur), afin d'adapter l'affichage à ce que je sais par cœur.
- **US-19** En tant que priant, je veux pouvoir désactiver l'annonce des mystères, afin de dire un chapelet de prières vocales seules.
- **US-20** En tant que priant, je veux activer ou désactiver le « Ô mon Jésus » et le Salve Regina, afin de suivre mon usage.
- **US-21** En tant que priant, je veux que l'écran reste allumé pendant le chapelet, afin que le téléphone ne se verrouille pas en pleine dizaine.
- **US-22** En tant que priant interrompu (appel, changement d'app), je veux retrouver mon chapelet exactement où je l'avais laissé si je le rouvre le jour même, afin de ne pas recommencer.
- **US-23** En tant que priant, je veux voir clairement que le chapelet est terminé, afin de conclure ma prière.

**Offices**

- **US-24** En tant que priant, je veux lire l'office complet (antienne répétée avant et après le psaume, Gloire au Père sauf exceptions, Notre Père en entier, conclusion de l'oraison complète), afin de prier correctement sans connaître les rubriques.
- **US-25** En tant que priant, je veux que l'introduction et l'invitatoire s'adaptent selon que l'office est le premier de ma journée ou non, afin de suivre la règle liturgique.
- **US-26** En tant que priant débutant, je veux voir discrètement signalés les ajouts faits par l'app, afin d'apprendre les rubriques en priant.
- **US-27** En tant que priant, je veux un bandeau fixe indiquant la partie en cours et une barre de progression, afin de savoir où j'en suis dans l'office.
- **US-28** En tant que priant, je veux un sommaire accessible d'un toucher, afin de sauter à une partie de l'office.
- **US-29** En tant que priant, je veux des repères visuels nets entre les parties, dans la couleur liturgique du jour, afin de distinguer antienne, psaume et répons.
- **US-30** En tant que priant en famille, je veux voir les numéros de versets, les V/ et R/, les refrains et les astérisques de médiante, afin de prier à plusieurs voix.
- **US-31** En tant que priant, je veux voir discrètement les syllabes accentuées de la psalmodie, et pouvoir les masquer, afin de psalmodier ou de lire simplement.

**Hors-ligne**

- **US-32** En tant que priant sans réseau, je veux disposer d'au moins 7 jours de textes à l'avance, afin de prier en voyage ou en retraite.
- **US-33** En tant que priant, je veux que les textes se renouvellent automatiquement quand j'ouvre l'app avec du réseau, afin de ne jamais avoir à y penser.
- **US-34** En tant que nouvel utilisateur qui ouvre l'app pour la première fois sans réseau, je veux pouvoir dire le chapelet et savoir que les offices demandent une première connexion, afin de ne pas me retrouver face à un écran vide.
- **US-35** En tant que priant, je veux que l'app utilise les textes déjà enregistrés quand la source AELF est indisponible, ou m'affiche un message clair si elle n'a rien, afin de ne jamais rester sans explication.

**Rappels**

- **US-36** En tant que priant, je veux choisir dans une liste les offices et le chapelet à me rappeler, afin d'être prévenu seulement pour mes prières.
- **US-37** En tant que priant, je veux régler l'heure de chaque rappel, avec des heures par défaut proposées, afin de les adapter à ma journée.
- **US-38** En tant que priant, je veux qu'un toucher sur la notification ouvre directement l'office ou le chapelet du jour, afin de prier sans naviguer.
- **US-39** En tant que priant, je veux que l'autorisation de rappel à l'heure exacte me soit demandée avec une explication au premier rappel activé, et être averti si je la refuse, afin de comprendre pourquoi un rappel pourrait arriver en retard.
- **US-40** En tant que priant sur un téléphone Xiaomi ou Samsung, je veux être guidé vers le réglage de batterie qui empêche le blocage des rappels, afin de les recevoir réellement.
- **US-41** En tant que priant, je veux un commutateur entre heures fixes et heures solaires, afin de prier au rythme de l'horloge ou du soleil.
- **US-42** En tant que priant en mode solaire, je veux des rappels aux heures temporaires de ma position (laudes au lever, tierce, sexte et none aux heures solaires, vêpres au coucher), les complies, les lectures et le chapelet gardant leur heure fixe, afin de prier au rythme du jour.
- **US-43** En tant que priant en mode solaire, je veux régler un décalage pour chaque office, afin d'éviter par exemple des laudes à 5 h 50 en été.
- **US-44** En tant que priant, je veux indiquer ma position une seule fois, par localisation ou en saisissant une ville, afin d'obtenir mes heures solaires sans être suivi.
- **US-45** En tant que priant qui voyage, je veux une option qui actualise ma position à l'ouverture de l'app et recalcule les heures si j'ai beaucoup bougé, afin d'avoir les heures solaires locales.
- **US-46** En tant que priant, je veux que mes rappels continuent même si je n'ouvre pas l'app pendant plusieurs semaines, afin de ne pas perdre le rythme.

**Réglages et apparence**

- **US-47** En tant que priant hors de France, je veux choisir ma zone liturgique (France par défaut), afin d'avoir le calendrier propre de mon pays.
- **US-48** En tant que priant le soir, je veux un thème nuit qui s'active automatiquement, afin de dire les complies sans être ébloui.
- **US-49** En tant que priant, je veux régler la taille du texte, afin de lire confortablement.
- **US-50** En tant que priant sensible aux animations, je veux que l'app respecte le réglage « réduire les animations » d'Android, afin de prier sans gêne.

## Critères de succès

1. **Hors-ligne.** En mode avion, pour chacun des 7 jours à venir, les 7 offices et le chapelet du jour s'ouvrent avec tous leurs textes.
2. **Offices complets.** Sur un jeu d'offices de référence (au moins un exemple de chaque office, couvrant un dimanche, une solennité, l'Avent, le Carême, le temps pascal et le temps ordinaire), 100 % des ajouts prévus par les rubriques validées sont présents.
3. **Chapelet.** Un chapelet complet se récite du début à la fin. Chaque toucher avance d'exactement une prière, et l'écran d'annonce ne s'avance que par la grosse perle.
4. **Rappels.** Pendant 7 jours consécutifs, sur un téléphone Xiaomi et sur un téléphone Samsung en veille, chaque rappel activé arrive à moins d'une minute de l'heure prévue, et le toucher ouvre le bon office du jour.
5. **Heures solaires.** Pour une ville donnée, les levers et couchers calculés s'écartent de moins de 2 minutes des éphémérides officielles.
6. **Rapidité.** L'accueil s'affiche en moins de 2 secondes après l'ouverture de l'app.
7. **Textes sacrés.** 100 % des prières, passages, fruits, conclusions et règles affichés ont été validés par le porteur du projet, et aucun ne peut changer sans nouvelle validation.
8. **Usage réel.** Pendant 14 jours consécutifs, le porteur du projet dit laudes, vêpres, complies et un chapelet uniquement avec l'app, sans autre support.

## Hors périmètre

1. Tout suivi de la prière : case « office dit », statistiques, séries de jours.
2. Le guidage audio, voix de synthèse ou enregistrements *(plus tard)*.
3. Les méditations rédigées pour chaque mystère *(plus tard)*.
4. Les lectures de la messe.
5. Les chapelets autres que le chapelet marial dans la première version : Divine Miséricorde, Sept Douleurs… *(plus tard, si besoin)*.
6. Le Rosaire complet en une seule séance, avec les 20 dizaines enchaînées *(plus tard)*.
7. Un mode « prière à plusieurs » avec alternance automatique entre deux chœurs.
8. L'avancée automatique, au rythme d'un prompteur, dans le chapelet ou les offices.
9. Un écran par partie pour les offices.
10. Les comptes utilisateur, la synchronisation entre appareils, et tout serveur propre à l'app.
11. La publicité, les achats et les abonnements (un bouton de don reste possible plus tard).
12. Le suivi de position en arrière-plan.
13. L'iPhone dans la première version *(plus tard)*.
14. Toute autre langue que le français.
15. Le choix entre plusieurs traductions des prières.
16. L'Angélus et l'offrande du matin (décision du porteur du projet, 2026-10-06).
17. L'office selon le Bréviaire romain de 1960 (Divinum Officium) *(à étudier en fin de développement)*.
18. Un examen de conscience rédigé et guidé aux complies *(plus tard ; la phase 6 n'en donne que la rubrique et le « Je confesse à Dieu »)*.

## Décisions d'implémentation

**Forme et diffusion**

- C'est une app Android, d'abord installée directement sur le téléphone du porteur du projet, puis publiée sur le Play Store.
- Nom : **Avec Dieu**. Gratuite, sans publicité, sans compte, sans collecte de données. Rien ne quitte le téléphone.

**Chapelet**

- **Déroulé du chapelet marial :**
  - signe de croix, Credo (Symbole des Apôtres), Notre Père, 3 Je vous salue Marie, Gloire au Père ;
  - puis 5 dizaines, chacune composée de l'annonce du mystère, d'un Notre Père, de 10 Je vous salue Marie, d'un Gloire au Père et, en option, du « Ô mon Jésus » ;
  - puis, en option, le Salve Regina.
- **Séries par jour :** joyeux le lundi et le samedi, douloureux le mardi et le vendredi, glorieux le mercredi et le dimanche, lumineux le jeudi. Une autre série peut être choisie.
- **Réglages par défaut :** annonce des mystères activée, texte complet, « Ô mon Jésus » activé, Salve Regina activé, écran toujours allumé.
- **Annonce :** en mode complet, un écran à part, qui défile et ne s'avance que par la grosse perle. En mode compact, le passage est replié.
- **Vibrations :** une courte par grain, une plus marquée en fin de dizaine.
- **Reprise :** un chapelet interrompu reprend au grain exact s'il est rouvert le jour même. Passé minuit, il est abandonné.

**Textes**

- Notre Père dans la traduction liturgique de 2017. Credo du chapelet : Symbole des Apôtres.
- Les passages des mystères sont dans la traduction liturgique de l'AELF, dans la longueur fixée par les usages liturgiques.
- Les prières, passages, fruits, conclusions d'oraison et règles des offices sont validés une fois par le porteur du projet, ligne par ligne, puis figés.

**Offices**

- **Les 7 offices :** lectures, laudes, tierce, sexte, none, vêpres, complies.
- **Reconstitution selon les rubriques :**
  - l'antienne est dite avant et après chaque psaume et cantique ;
  - le Gloire au Père est ajouté après chaque psaume et cantique, sauf exceptions (par exemple, le cantique de Dn 3) ;
  - le Notre Père est écrit en entier ;
  - la conclusion de l'oraison est développée ;
  - l'introduction et l'invitatoire dépendent du premier office du jour.
- **Lecture continue :** bandeau fixe avec la partie en cours et la progression, sommaire, repères en couleur liturgique, ajouts de l'app discrètement signalés.
- **Repères toujours affichés :** numéros de versets, V/ et R/, refrains, astérisques de médiante. Les accents de psalmodie sont discrets et masquables.

**Hors-ligne**

- Au moins 7 jours d'avance sont toujours disponibles. Le cache se renouvelle à chaque ouverture avec réseau.
- Le chapelet fonctionne entièrement sans réseau, dès le premier lancement.

**Rappels**

- **Une liste des offices et du chapelet à notifier**, chacun activable. Heures fixes par défaut :

| Prière | Heure | Activé par défaut |
|---|---|---|
| Laudes | 7 h 00 | oui |
| Tierce / Sexte / None | 9 h / 12 h / 15 h | non |
| Vêpres | 18 h 30 | oui |
| Complies | 21 h 30 | oui |
| Office des lectures | à choisir | non |
| Chapelet | 20 h 00 | non |

- **Mode solaire, heures temporaires :** la durée du jour, du lever au coucher du soleil, est divisée en 12 heures égales entre elles :
  - laudes au lever ;
  - tierce à la fin de la 3e heure ;
  - sexte au midi solaire ;
  - none à la fin de la 9e heure ;
  - vêpres au coucher ;
  - complies, lectures et chapelet à heure fixe ;
  - décalage réglable pour chaque office.
- **La position** est saisie une fois. L'actualisation à l'ouverture est optionnelle, et les heures sont recalculées après un déplacement de plus de 50 km.
- Les rappels sont programmés environ un mois à l'avance.
- L'autorisation d'alarme exacte est demandée au premier rappel activé. Sur Xiaomi et Samsung, l'app guide vers les réglages de batterie.

**Accueil et apparence**

- **L'accueil « Aujourd'hui » :** bandeau liturgique en cadran solaire, prière du moment, liste des 7 offices, carte « Chapelet du jour », navigation par date.
- **Le cadran :**
  - en mode solaire, l'arc va du lever au coucher du soleil ;
  - en mode fixe, il va de 6 h à 21 h ;
  - les complies se placent sous l'horizon ;
  - le soleil avance au fil de la journée.
- **Le style** est celui d'un livre liturgique : fond crème comme un parchemin, tons or et brun, rubriques en rouge, titres en capitales à empattements, pastille de la couleur liturgique.
- **Le thème nuit** s'active automatiquement selon le réglage d'Android ou après le coucher du soleil.
- **Transitions douces et sobres**, désactivées si Android demande de réduire les animations. Taille du texte réglable.
- **Zone liturgique :** France par défaut, modifiable. Changer de zone recharge les textes.
- Interface en français uniquement.

## Notes complémentaires

**Risques**

- **Les droits de l'AELF.** Sans son autorisation, pas de publication avec ses textes. Courrier à envoyer dès maintenant, avec la traduction Crampon (1923) comme repli pour les passages des mystères.
- **Les règles des offices.** Leurs exceptions (cantiques sans Gloire au Père, solennités, octaves, Triduum) sont la partie la plus délicate. Une erreur se verrait en pleine prière.
- **Le volume de textes à valider** par le porteur du projet conditionne la sortie.
- **Les économies de batterie de Xiaomi et Samsung**, les deux téléphones du porteur du projet, sont connues pour bloquer les rappels.

**Dépendances**

- **L'API AELF** : un service tiers, sans conditions d'utilisation publiées ni garantie de stabilité de son format. Le cache amortit une panne passagère.
- **L'autorisation Android « Alarmes et rappels »**, pour des rappels à l'heure exacte.

**Hypothèses à vérifier**

- La zone France renvoie bien le calendrier propre de la France les jours de fête nationale : le 5 octobre 2026, elle renvoyait le calendrier romain.
- La structure des offices fournie par l'AELF reste la même toute l'année liturgique.

**Références**

- L'API AELF.
- Jean-Paul II, *Rosarium Virginis Mariae* (2002).
- Paul VI, *Marialis Cultus* n° 47.
