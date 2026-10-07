# Plan : Avec Dieu

> PRD source : `docs/PRD.md` · Design : `docs/DESIGN.md`

## Décisions architecturales

Décisions durables qui s'appliquent à toutes les phases :

- **Pile** : TypeScript + React + Vite ; application web empaquetée pour Android avec Capacitor ; tests unitaires Vitest, parcours de bout en bout Playwright. Chaque phase se termine par un parcours Playwright vert.
- **Routes** :
  - `/` : accueil « Aujourd'hui » ; `/jour/AAAA-MM-JJ` : accueil d'un autre jour
  - `/office/<office>/<AAAA-MM-JJ>` : avec `<office>` ∈ `lectures | laudes | tierce | sexte | none | vepres | complies` (mêmes noms que l'API AELF)
  - `/chapelet` : chapelet du jour ; `/chapelet/<série>` : avec `<série>` ∈ `joyeux | lumineux | douloureux | glorieux`
  - `/reglages` ; `/menu` (ouvert par ☰ depuis le seuil) ; `/a-propos`
  - Les notifications de rappel ouvrent directement ces routes.
- **Modèles clés** :
  - `JourLiturgique` : date, zone, temps liturgique, semaine, fête, rang, couleur(s)
  - `Office` : nom, date, zone, suite ordonnée de `Partie`
  - `Partie` : type (introduction, hymne, antienne, psaume, cantique, lecture, répons, intercession, Notre Père, oraison, bénédiction…), libellé, contenu, indicateur « ajoutée selon les rubriques »
  - `Chapelet` : définition déclarative (suite d'étapes `{prière, répétitions}`), indépendante du code d'affichage, pour ajouter d'autres chapelets en ajoutant des données
  - `SérieDeMystères` et `Mystère` : titre, fruit, référence biblique, passage
  - `Prière`, `RègleDeRubrique`, `Réglages`, `Rappel` (office, heure, actif, décalage), `Position`
- **Stockage, entièrement local, sans serveur** :
  - offices indexés par (zone, date, office)
  - jours liturgiques indexés par (zone, date)
  - réglages (un seul enregistrement)
  - chapelet en cours (date, série, position)
- **Frontière AELF** : un seul module parle à l'API AELF (`/v1/<office>/<date>/<zone>`, `/v1/informations/<date>/<zone>`). Il transforme le HTML AELF en `Office` et `JourLiturgique` assainis. Le reste de l'app ne connaît jamais le format AELF.
- **Recueil de textes figés** : prières, mystères (titres, fruits, références, passages), conclusions d'oraison et règles de rubriques vivent dans un recueil de données lisible, validé ligne par ligne par le porteur du projet. Un test d'empreinte échoue à toute modification non validée.
- **Design** : jetons, polices et composants conformes à `docs/DESIGN.md`. Polices auto-hébergées pour fonctionner hors-ligne dès le premier lancement.

---

## Phase 1 : Chapelet récitable

**User stories** : US-9, US-11, US-12, US-13, US-23

### Ce qu'on livre

Dans le navigateur, on ouvre le chapelet du jour et on le récite du signe de croix à la fin, sans réseau. La série de mystères est celle du jour. Chaque toucher n'importe où avance d'une prière, glisser revient en arrière. Le chapelet dessiné met en évidence le grain en cours, et le titre du mystère s'affiche à chaque dizaine. Un écran de fin conclut. Cette phase pose le socle : jetons de design jour, polices, recueil de textes figés, définition déclarative du chapelet.

### Critères d'acceptation

- [x] Le déroulé correspond exactement au PRD : signe de croix, Credo, Notre Père, 3 Je vous salue Marie, Gloire au Père, 5 dizaines, fin.
- [x] La série proposée suit le jour de la semaine (test pour chacun des 7 jours).
- [x] Un parcours Playwright récite un chapelet complet : chaque toucher avance d'exactement une prière, et un glissement recule d'une prière.
- [x] Les textes des prières (Notre Père 2017, Je vous salue Marie, Gloire au Père, Symbole des Apôtres, signe de croix) sont validés par le porteur du projet et figés par le test d'empreinte.
- [x] Le rendu respecte `docs/DESIGN.md` (parchemin, Baumans, Cormorant SC, Literata, perles).

## Bloquée par

Aucune — démarrable immédiatement.

---

## Phase 2 : Le chapelet sur le téléphone

**User stories** : US-14, US-21

### Ce qu'on livre

L'app de la phase 1 est empaquetée en APK Android et installée directement sur les téléphones Xiaomi et Samsung du porteur du projet. Une vibration courte marque chaque grain, une vibration plus marquée chaque fin de dizaine, et l'écran reste allumé pendant tout le chapelet. À partir de cette phase, chaque livraison arrive sur le téléphone.

### Critères d'acceptation

- [x] L'APK s'installe et s'ouvre sur le Xiaomi et sur le Samsung, avec l'identifiant `fr.biovibralyon.avecdieu` et le nom « Avec Dieu ».
- [x] Un chapelet complet se récite sur le téléphone, en mode avion.
- [x] Les vibrations se ressentent à chaque grain, plus fort en fin de dizaine (ressentie sur le Notre Père qui ouvre la dizaine suivante, et à la fin du chapelet : choix du porteur du projet, 2026-10-06).
- [x] L'écran ne se verrouille pas pendant le chapelet, puis reprend son comportement normal en sortant.
- [x] La procédure pour reconstruire et réinstaller l'APK est documentée et reproductible.

## Bloquée par

- Phase 1

---

## Phase 3 : Annonce des mystères

**User stories** : US-10, US-15, US-16, US-17, US-18

### Ce qu'on livre

Au début de chaque dizaine, un écran d'annonce présente le titre, le fruit, la référence et le passage biblique du mystère. En mode texte complet, le passage défile et l'écran ne s'avance qu'en touchant la grosse perle. En mode compact, seuls le nom de la prière et le compteur s'affichent, et le passage est replié derrière « Lire le passage ». On peut choisir une autre série que celle du jour.

### Critères d'acceptation

- [x] Les 20 mystères (titre, fruit, référence, passage dans la traduction liturgique AELF) sont validés par le porteur du projet et figés (trois passages par mystère, qui tournent toutes les 6 lectures : choix du porteur du projet, 2026-10-06).
- [x] Les passages sont dans un recueil séparé, remplaçable par une autre traduction sans toucher au code.
- [x] Un parcours Playwright vérifie qu'un toucher hors de la grosse perle n'avance pas l'écran d'annonce, et qu'un toucher sur la perle l'avance.
- [x] Le basculement entre mode complet et mode compact fonctionne, et le lien « Lire le passage » déplie le passage.
- [x] Les 4 séries s'ouvrent depuis le choix de série (le seuil du chapelet, avant le signe de croix).
- [x] Validée sur le Xiaomi et le Samsung par le porteur du projet (2026-10-06).

## Bloquée par

- Phase 1

---

## Phase 4 : Réglages du chapelet et reprise

**User stories** : US-19, US-20, US-22

### Ce qu'on livre

Un premier écran de réglages pour le chapelet : annonce des mystères (oui ou non), « Ô mon Jésus » et Salve Regina en option (activés par défaut), affichage (texte complet ou compact), vibrations (oui ou non, pour la discrétion à l'église), prier à plusieurs (V/ et R/ marquent la part de celui qui mène et la réponse des autres). Les choix du moment (affichage, vibrations) sont aussi sur le seuil. Un menu ☰ en haut du seuil mène au chapelet, aux réglages et à « À propos » (version, sources des textes), et annonce les offices à venir. Un chapelet interrompu par un appel ou un changement d'app reprend au grain exact s'il est rouvert le jour même. Passé minuit, il est abandonné.

### Critères d'acceptation

- [x] Chaque option modifie le déroulé comme prévu (un test par combinaison), et les réglages persistent après redémarrage.
- [x] Les vibrations se coupent et se rétablissent depuis les réglages (demande du porteur du projet, 2026-10-06).
- [x] Le texte du « Ô mon Jésus » et celui du Salve Regina (avec son verset) sont validés et figés.
- [x] « Prier à plusieurs » marque V/ et R/ sur le Notre Père, le Je vous salue Marie et le Gloire au Père, aux coupures validées par le porteur du projet (2026-10-06).
- [x] Un chapelet quitté puis rouvert le jour même reprend au même grain (l'app rouvre directement sur la prière ; le seuil propose « Reprendre » ou « Recommencer du début »). Rouvert le lendemain, il repart au début avec la série du nouveau jour.
- [x] Validée sur le Xiaomi et le Samsung par le porteur du projet (2026-10-06).

## Bloquée par

- Phase 3

---

## Phase 5 : Premier office AELF en lecture continue

**User stories** : US-29, US-30, US-31

### Ce qu'on livre

On ouvre n'importe lequel des 7 offices du jour, récupéré auprès de l'AELF (zone France), et on le lit d'un trait. Les parties sont séparées par des repères en couleur liturgique. Les numéros de versets, V/ et R/, refrains, astérisques et accents de psalmodie s'affichent selon le code des rubriques rouges. Les accents de psalmodie sont masquables. À ce stade, le texte est affiché tel que l'AELF le fournit, sans reconstitution.

### Critères d'acceptation

- [x] Les 7 offices du jour s'affichent depuis l'API AELF, sur le navigateur et sur l'APK.
- [x] La transformation du HTML AELF en `Office` est testée sur des réponses AELF réelles enregistrées (au moins une par office), et aucun HTML non assaini n'atteint l'écran.
- [x] Les repères (versets, V/ et R/, astérisques, accents) apparaissent en rouge rubrique, et les accents se masquent par réglage.
- [x] Si l'API est injoignable, un message clair s'affiche au lieu d'un écran vide.

## Bloquée par

- Phase 1

---

## Phase 6 : Office reconstitué selon les rubriques

**User stories** : US-24, US-25, US-26

### Ce qu'on livre

L'office affiché est complet :
- l'antienne est répétée avant et après chaque psaume ou cantique ;
- le Gloire au Père est ajouté, sauf exceptions (comme Dn 3) ;
- le Notre Père est écrit en entier ;
- la conclusion de l'oraison est développée ;
- l'introduction et l'invitatoire s'adaptent au premier office du jour ;
- l'office se termine par sa conclusion (« Que le Seigneur nous bénisse… » aux laudes et vêpres, « Bénissons le Seigneur » à l'office des lectures et aux petites heures) ;
- les complies s'ouvrent, après l'introduction, sur la rubrique « Examen de conscience » suivie du « Je confesse à Dieu ».

Décisions du porteur du projet (2026-10-06) :
- **Invitatoire** : une fois par jour, en tête du premier des deux offices ouverts ce jour-là (laudes ou office des lectures), l'autre commençant par « Dieu, viens à mon aide ». Un lien en tête de l'office permet de le déplacer à la main. Son antienne est reprise après chaque strophe du psaume.
- **Prières courantes** (Notre Père, Gloire au Père, Je confesse à Dieu) : repliées sur leur première ligne, dépliées d'un toucher ; le réglage « Prières courantes en entier » (Réglages › Offices) les déplie toujours.
- **Signalement des ajouts** : un filet rouge le long de l'ajout, sans aucun texte ; le réglage « Signaler les ajouts de l’app » (Réglages › Offices, actif par défaut) le retire.
- **Textes de référence** : les textes officiels actuels (Gloire au Père de la liturgie des heures francophone, conclusions du Missel romain de 2021).
- Avec « Prier à plusieurs », le Gloire au Père (après l'introduction et après chaque psaume) porte la rubrique « Tous », comme au chapelet.

### Critères d'acceptation

- [x] Les règles de rubriques et les conclusions d'oraison sont rédigées dans un recueil lisible, validées par le porteur du projet et figées.
- [x] Un jeu d'offices de référence enregistrés (chacun des 7 offices, couvrant un dimanche, une solennité, l'Avent, le Carême, le temps pascal et le temps ordinaire) produit 100 % des ajouts attendus (critère de succès 2).
- [ ] L'introduction change selon que l'office ouvert est le premier de la journée ou non.
- [x] Chaque partie ajoutée porte le filet rouge des ajouts, retiré quand le réglage est coupé.

## Bloquée par

- Phase 5

---

## Phase 7 : Se repérer dans l'office

**User stories** : US-27, US-28

### Ce qu'on livre

Pendant la lecture d'un office, un bandeau fixe indique la partie en cours (par exemple « Psaume 2 — Ps 83 ») et la progression sous forme de fil de perles. Un sommaire, accessible d'un toucher, permet de sauter à n'importe quelle partie.

### Critères d'acceptation

- [ ] Le bandeau suit le défilement et nomme toujours la partie visible (parcours Playwright).
- [ ] Le sommaire liste toutes les parties, et un toucher sur l'une d'elles y amène.
- [ ] Le fil de perles reste lisible pour un office de 17 parties sur un écran de 360 px de large.

## Bloquée par

- Phase 5

---

## Phase 8 : Accueil « Aujourd'hui »

**User stories** : US-1, US-2, US-3, US-4, US-5, US-7 (US-6 retirée)

### Ce qu'on livre

L'écran d'accueil de l'app comprend :
- le bandeau liturgique en cadran solaire (mode heures fixes, de 6 h à 22 h), avec la date, le temps, la fête et la pastille de couleur ;
- le soleil à l'heure actuelle et les offices en perles, chaque perle s'ouvrant au toucher ;
- la prière du moment mise en avant ;
- la liste des 7 offices, les offices passés étant atténués ;
- la navigation vers les jours précédents et suivants.

Décisions du porteur du projet (2026-10-06) :
- **Ouverture** : l'app s'ouvre toujours sur l'accueil, même avec un chapelet en cours ; le chapelet s'ouvre par le menu, et son seuil propose la reprise. Pas de carte « Chapelet du jour » (US-6 retirée).
- **Menu** : le ☰ passe en haut de l'accueil ; le menu devient Aujourd'hui, Chapelet, Réglages, À propos. Le seuil du chapelet perd son ☰ au profit de « ‹ Retour » vers l'accueil. L'écran provisoire « Offices du jour » disparaît.
- **Cadran** : arc de 6 h à 22 h, complies au bout de l'arc (la maquette l'emporte sur l'ancien PRD). Le soleil laisse place au croissant de lune entre le coucher et le lever, calculés au centre de la France pour la date du jour, sans demander de position.
- **Prière du moment** : un office reste « du moment » pendant une heure après son heure, puis l'app passe au suivant et il devient « passé » (atténué). Les complies restent « du moment » jusqu'à minuit ; de minuit à 7 h, ce sont les laudes du nouveau jour. Tout office passé reste ouvrable d'un toucher, sur le cadran comme dans la liste.
- **Encadré « Prière du moment »** : trois lignes, tout l'encadré se touche, chevron › à droite centré sur les trois lignes :
  `PRIÈRE DU MOMENT` / `Vêpres` / `18 h 30 · dans 40 min` (« depuis 10 min » une fois l'heure passée, « dans 2 h 15 » au-delà d'une heure).
- **Office des lectures** : en tête de la liste avec « à toute heure », jamais atténué, sans perle sur le cadran, jamais « du moment » ; il prendra place sur le cadran quand une heure lui sera donnée (phase 11).
- **Bandeau** : date (`MARDI 6 OCTOBRE`), temps (`27e semaine du temps ordinaire`, omis quand le titre le dit déjà), titre (fête ou saint, sinon nom du jour : `S. Bruno, prêtre`, `28e dimanche du temps ordinaire`), puis **une seule pastille de la couleur du jour, sans aucun texte** (ni nom de couleur, ni rang). Typographie corrigée (« 27e », minuscules), mots de l'AELF inchangés, mention « semaine du psautier » retirée. Lecteur d'écran : « couleur liturgique : vert ».
- **Autre jour** : en haut, « ‹ dim. 4 · Aujourd'hui · mar. 6 › » ; sur un autre jour, le centre devient « Revenir à aujourd'hui », les perles prennent toutes le même aspect, sans soleil ni lune, et l'encadré « Prière du moment » disparaît. Navigation jour par jour, sans calendrier.
- **AELF injoignable** : la date seule, puis `⚠ Le jour liturgique n’a pas pu être récupéré.` en brun brique, avec un lien discret « Réessayer » ; le cadran, la prière du moment et la liste restent affichés.

### Critères d'acceptation

- [x] Le bandeau affiche les données du `JourLiturgique` (vérifié sur des réponses AELF enregistrées).
- [x] La position du soleil, l'état des perles et la prière du moment sont justes à plusieurs heures de la journée (tests avec une horloge simulée).
- [x] Un toucher sur une perle (passée comprise), une ligne de la liste ou la prière du moment ouvre la bonne route.
- [x] La navigation par date change le jour affiché et met l'adresse à jour (`/jour/AAAA-MM-JJ`).

## Bloquée par

- Phase 5

---

## Phase 9 : Hors-ligne sur 7 jours

**User stories** : US-8, US-32, US-33, US-34, US-35

### Ce qu'on livre

L'app garde toujours au moins 7 jours d'offices et de jours liturgiques d'avance, et renouvelle ce cache à chaque ouverture avec réseau. Sans réseau, tout ce qui est en cache s'ouvre. Un jour non disponible affiche un message avec la date limite des textes disponibles. Au premier lancement sans réseau, le chapelet fonctionne, et un message explique que les offices demandent une première connexion. Si l'AELF est indisponible, l'app utilise son cache.

Décisions du porteur du projet (2026-10-07) :
- **Étendue** : aujourd'hui et les 7 jours suivants, plus la veille ; les jours plus anciens sont effacés. Un jour déjà enregistré n'est jamais retéléchargé, et s'ouvre depuis le téléphone même avec du réseau. L'enregistrement se fait aussi en données mobiles (environ 600 Ko la première fois, 80 Ko par jour ensuite).
- **Discrétion** : rien ne s'affiche pendant l'enregistrement. Dans Réglages › Offices, une ligne : `Textes disponibles hors connexion jusqu’au mercredi 14 octobre.` (avant toute connexion : `Aucun texte enregistré pour l’instant.`).
- **Office non enregistré** (sans réseau ou AELF muette) : `⚠ Cet office n’est pas enregistré sur le téléphone.` / `Les textes enregistrés vont du mardi 6 au mercredi 14 octobre. Pour ce jour-ci, connectez-vous à internet, puis réessayez.` / bouton `Réessayer`.
- **Accueil d'un jour non enregistré**, sous la date : `⚠ Ce jour n’est pas enregistré. Connectez-vous à internet, puis réessayez.` et le lien discret `Réessayer`.
- **Premier lancement sans réseau** (accueil et écran d'un office) : `⚠ Les offices demandent une première connexion à internet. Une fois connecté, l’app enregistre une semaine de textes d’avance. Le chapelet, lui, se prie dès maintenant.` ; sur l'accueil seulement, le bouton `Prier le chapelet`. L'écran d'un office garde le bouton `Réessayer` (validé après captures).
- **AELF muette, jour enregistré** : aucun message, l'office s'ouvre.

### Critères d'acceptation

- [x] En mode avion, pour chacun des 7 jours à venir, les 7 offices et le chapelet s'ouvrent avec tous leurs textes (critère de succès 1, vérifié sur l'APK).
- [x] L'ouverture avec réseau complète le cache jusqu'à 7 jours d'avance au moins, sans retélécharger ce qui est déjà présent.
- [x] Les messages pour un jour indisponible, un premier lancement sans réseau et l'AELF injoignable sont couverts par des tests.

## Bloquée par

- Phase 8

---

## Phase 10 : Affichage et zone liturgique

**User stories** : US-47, US-48, US-49, US-50

### Ce qu'on livre

Dans les réglages :
- le choix de la zone liturgique (France par défaut) ; en changer recharge les textes ;
- la taille du texte (de 16 à 24 px), avec de quoi revenir à la taille d'origine.

Dans les offices et au chapelet, pincer ou écarter deux doigts règle cette même taille, comme dans l'app de l'AELF (demande du porteur du projet, 2026-10-07) ; l'app la retient.

Le thème nuit s'active automatiquement selon le réglage d'Android. Toutes les animations sont coupées si Android demande de les réduire. Les transitions douces de `docs/DESIGN.md` sont mises en place.

Décisions du porteur du projet (2026-10-07) :
- **Réglages en accordéon** : trois rubriques, toutes fermées à l'ouverture de l'app, plusieurs ouvrables à la fois (l'écran se souvient de ce qui est ouvert tant que l'app reste ouverte). Chaque titre porte une ligne de résumé et un chevron › qui pivote à l'ouverture. (Le lien « Tous les réglages » du seuil, prévu pour ouvrir la rubrique Chapelet, n'existe plus depuis la phase 8 : sans objet.)
  - `Affichage` / `Taille du texte, thème` (nouvelle, en tête) ;
  - `Chapelet` / `Annonce, prières, vibrations` (contenu inchangé) ;
  - `Offices` / `Zone, accents, textes hors connexion` (la zone en tête, puis le reste inchangé).
- **Zone liturgique** : les 8 zones de l'AELF, France par défaut. Libellé `Zone liturgique`, aide `Le calendrier des fêtes propres à votre pays.`, choix `France`, `Afrique`, `Belgique`, `Canada`, `Luxembourg`, `Monaco`, `Suisse`, `Calendrier romain général`.
- **Taille du texte** : 5 crans (16, 18, 20, 22, 24 px ; 18 d'origine), boutons `A−` et `A+` autour de 5 points, avec en exemple le début du Notre Père (`Notre Père, qui es aux cieux, / que ton nom soit sanctifié,`) qui change en direct ; lien `Taille d’origine` seulement hors de 18 ; aide `Dans un office ou au chapelet, pincez ou écartez deux doigts.` Lecteur d'écran : `Réduire le texte`, `Agrandir le texte`, `Taille 2 sur 5`.
- **Ce qui grandit** : le texte à prier des offices et du chapelet, et à la même échelle ce qui s'y mêle (V/ R/, versets, astérisques, libellés des parties). Titres, accueil, menu et réglages ne changent pas.
- **Pincement** : il saute de cran en cran, sans aucun repère à l'écran : seul le texte change.
- **Thème** : `Thème` à trois choix `Automatique | Jour | Nuit`, aide `Automatique : nuit après le coucher du soleil, ou si le téléphone est en mode sombre.` (coucher du soleil du cadran, centre de la France).

### Critères d'acceptation

- [ ] Changer de zone vide puis recharge le cache, et les offices affichés correspondent à la nouvelle zone.
- [ ] En automatique, le thème nuit s'allume si Android est en mode sombre ou après le coucher du soleil ; « Jour » et « Nuit » le forcent ; tous les écrans respectent les jetons nuit.
- [ ] La taille du texte s'applique aux offices et au chapelet, et persiste.
- [ ] Pincer ou écarter deux doigts dans un office ou au chapelet change la taille du texte de cran en cran entre 16 et 24 px, sans faire avancer le chapelet (parcours Playwright).
- [ ] Avec « réduire les animations », aucune transition ne joue (test).
- [ ] À vérifier : le comportement de la zone `france` un jour de fête propre à la France (hypothèse du PRD). Vérifié le 2026-10-07 : la zone `france` répond `"zone":"france"` avec le propre de France (Ste Jeanne d'Arc le 30 mai, S. Louis le 25 août avec son oraison propre), et `"romain"` seulement les jours où les deux calendriers coïncident.

## Bloquée par

- Phase 5

---

## Phase 11 : Rappels à heure fixe

**User stories** : US-36, US-37, US-38, US-39, US-40, US-46

### Ce qu'on livre

Dans les réglages, une liste des offices et du chapelet à rappeler, chacun avec son heure. Les valeurs par défaut sont celles du PRD : laudes, vêpres et complies activées. Les notifications sont programmées environ un mois à l'avance et arrivent même si l'app n'est pas ouverte. Un toucher sur la notification ouvre l'office ou le chapelet du jour. L'autorisation « Alarmes et rappels » est demandée au premier rappel activé, avec une explication. Sur Xiaomi et Samsung, l'app guide vers le réglage de batterie qui évite le blocage des rappels.

### Critères d'acceptation

- [ ] Les valeurs par défaut correspondent au tableau du PRD.
- [ ] Activer, désactiver ou changer l'heure d'un rappel reprogramme les notifications sur environ un mois.
- [ ] Un toucher sur la notification ouvre la bonne route (`/office/<office>/<date>` ou `/chapelet`).
- [ ] Un refus de l'autorisation est signalé par un avis expliquant que les rappels peuvent arriver en retard.
- [ ] Le guide de batterie s'affiche sur Xiaomi et sur Samsung, et pas sur les autres marques.

## Bloquée par

- Phase 2
- Phase 8

---

## Phase 12 : Heures solaires

**User stories** : US-41, US-42, US-43, US-44, US-45 (et la partie « après le coucher du soleil » de US-48)

### Ce qu'on livre

Un commutateur fait passer de l'heure fixe à l'heure solaire. En mode solaire :
- les heures temporaires sont calculées hors-ligne pour la position saisie une fois (localisation ou ville) : laudes au lever, tierce, sexte et none aux heures solaires, vêpres au coucher ; complies, lectures et chapelet gardent leur heure fixe ;
- un décalage est réglable pour chaque office ;
- une option actualise la position à l'ouverture et recalcule tout après un déplacement de plus de 50 km ;
- le cadran de l'accueil s'étire du lever au coucher du soleil ;
- le thème nuit peut aussi s'activer après le coucher du soleil.

### Critères d'acceptation

- [ ] Les levers et couchers calculés s'écartent de moins de 2 minutes des éphémérides officielles, pour plusieurs villes et dates (critère de succès 5).
- [ ] Tierce, sexte et none tombent exactement au quart, à la moitié et aux trois quarts du jour solaire, décalage compris.
- [ ] La saisie d'une ville introuvable affiche l'erreur prévue dans le design, et la position ne quitte jamais le téléphone.
- [ ] Un déplacement simulé de plus de 50 km, avec l'option active, recalcule les heures et reprogramme les rappels. En dessous de 50 km, rien ne change.
- [ ] Le cadran en mode solaire place les perles sur l'arc du lever au coucher.

## Bloquée par

- Phase 11

---

## Phase 13 : Recette en conditions réelles

**User stories** : aucune nouvelle. Valide les critères de succès 4, 6 et 8 du PRD.

### Ce qu'on livre

L'app est mise à l'épreuve dans la vraie vie du porteur du projet, sur ses deux téléphones. Les défauts constatés reviennent dans les phases concernées.

### Critères d'acceptation

- [ ] Pendant 7 jours consécutifs, sur le Xiaomi et sur le Samsung en veille, chaque rappel activé arrive à moins d'une minute de l'heure prévue et ouvre le bon office (critère 4).
- [ ] L'accueil s'affiche en moins de 2 secondes après l'ouverture de l'app, sur les deux téléphones (critère 6).
- [ ] Pendant 14 jours consécutifs, le porteur du projet dit laudes, vêpres, complies et un chapelet uniquement avec l'app (critère 8).

## Bloquée par

- Toutes les phases précédentes
