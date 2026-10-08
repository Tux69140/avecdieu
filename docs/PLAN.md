# Plan : Avec Dieu

> PRD source : `docs/PRD.md` · Design : `docs/DESIGN.md`

## Décisions architecturales

Décisions durables qui s'appliquent à toutes les phases :

- **Pile** : TypeScript + React + Vite ; application web empaquetée pour Android avec Capacitor ; tests unitaires Vitest, parcours de bout en bout Playwright. Chaque phase se termine par un parcours Playwright vert.
- **Routes** :
  - `/` : accueil « Aujourd'hui » ; `/jour/AAAA-MM-JJ` : accueil d'un autre jour
  - `/office/<office>/<AAAA-MM-JJ>` : avec `<office>` ∈ `lectures | laudes | tierce | sexte | none | vepres | complies` (mêmes noms que l'API AELF)
  - `/chapelet` : chapelet du jour ; `/chapelet/<série>` : avec `<série>` ∈ `joyeux | lumineux | douloureux | glorieux` ; `/rosaire` : les quatre séries à la suite (phase 17)
  - `/priere/<prière>` : une prière seule ouverte par le menu (2026-10-08), avec `<prière>` ∈ `je-vous-salue-marie | notre-pere | credo | gloire-au-pere | salve-regina | je-confesse`
  - `/reglages` ; `/lieu` (lieu des heures solaires, phase 12) ; `/menu` (ouvert par ☰ depuis le seuil) ; `/a-propos`
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
- **Navigation et en-têtes**, décisions du porteur du projet :
  - **Fermer, une croix partout** (2026-10-08) : la même croix fine (sépia, dessin de 18 px, cible de 48 px), en haut à gauche, nommée « Fermer », remplace « ‹ Retour » et le chevron ‹ sur le menu, les réglages, « A propos », le lieu, le seuil du chapelet et l'office (dans l'office, sur la ligne de la date) ; elle fait ce que fait le retour d'Android.
  - **Chapelet pendant la prière** (2026-10-08) : la même croix, sur la ligne de la date, pendant la prière et sur l'écran de fin ; elle ramène au seuil, comme le retour d'Android, où l'on change de série ou reprend ; la croix du seuil ramène là d'où le chapelet a été ouvert. La progression reste gardée ; un toucher sur la croix ne fait jamais avancer le chapelet.
  - **Titres centrés sur la ligne de la croix** (2026-10-08) : menu, réglages, « A propos » et lieu ; au seuil et au chapelet, la ligne de la croix porte la date (« Chapelet du jour · jeudi 8 octobre », coupée après le point sur un petit écran) et le titre de la série vient dessous.
  - **Chevrons** (2026-10-08) : › veut toujours dire « ouvre un autre écran » ; une rubrique des réglages qui se déplie sur place porte une flèche vers le bas, retournée vers le haut une fois ouverte.
  - **Menu** (2026-10-08) : le chapelet forme son propre groupe sous les offices, séparé par un filet d'or comme sur l'accueil ; toutes les lignes à 48 px, noms en graisse normale (l'office d'où l'on vient reste marqué) ; à 360 × 780, le menu tient sur un seul écran ; › ne se lit pas dans le nom des lignes.

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

Un premier écran de réglages pour le chapelet : annonce des mystères (oui ou non), « Ô mon Jésus » et Salve Regina en option (activés par défaut), affichage (texte complet ou compact), vibrations (oui ou non, pour la discrétion à l'église), prier à plusieurs (V/ et R/ marquent la part de celui qui mène et la réponse des autres). Les choix du moment (affichage, vibrations, prier à plusieurs depuis le 2026-10-08) sont aussi sur le seuil. Un menu ☰ en haut du seuil mène au chapelet, aux réglages et à « A propos » (version, sources des textes), et annonce les offices à venir. Un chapelet interrompu par un appel ou un changement d'app reprend au grain exact s'il est rouvert le jour même. Passé minuit, il est abandonné.

### Critères d'acceptation

- [x] Chaque option modifie le déroulé comme prévu (un test par combinaison), et les réglages persistent après redémarrage.
- [x] Les vibrations se coupent et se rétablissent depuis les réglages (demande du porteur du projet, 2026-10-06).
- [x] Le texte du « Ô mon Jésus » et celui du Salve Regina (avec son verset) sont validés et figés.
- [x] « Prier à plusieurs » marque V/ et R/ sur le Notre Père, le Je vous salue Marie et le Gloire au Père, aux coupures validées par le porteur du projet (2026-10-06).
- [x] Un chapelet quitté puis rouvert le jour même reprend au même grain (l'app rouvre directement sur la prière ; le seuil propose « Reprendre » ou « Recommencer du début »). Rouvert le lendemain, il repart au début avec la série du nouveau jour.
- [x] Validée sur le Xiaomi et le Samsung par le porteur du projet (2026-10-06).

Ajouts du porteur du projet (2026-10-07), textes validés :
- **Aide aux gestes** : l'interrupteur `Aide aux gestes` (Réglages › Chapelet, aide `Au début du chapelet, rappelle comment avancer et revenir en arrière.`) la rétablit après « Ne plus afficher ».
- **Réinitialiser l’app** : lien discret en bas des réglages, puis la confirmation `Réinitialiser l’app ?` / `Réglages, rappels, lieu et chapelet en cours sont effacés : l’app revient comme au premier lancement. Les textes enregistrés pour la semaine sont gardés.` / `Réinitialiser` · `Annuler` ; l'app revient à l'accueil, les rappels annulés.

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

Pendant la lecture d'un office, un bandeau fixe indique la partie en cours et la progression sous forme de fil de perles. Un sommaire, accessible d'un toucher, permet de sauter à n'importe quelle partie.

Décisions du porteur du projet (2026-10-07) :
- **L'antienne compte avec son psaume** : une seule étape « Psaume 84 », qui commence à l'antienne (laudes : 13 étapes au lieu de 18). Le bandeau affiche le libellé de l'étape (« Psaume 84 », « Hymne », « Lecture brève »).
- **Bandeau en haut, dès qu'on descend** : à l'ouverture, l'en-tête reste tel quel avec un lien `Sommaire` sous le titre ; dès que le titre sort de l'écran, un bandeau fin glisse en haut (nom de l'étape, chevron ⌄, fil de perles dessous). Un toucher sur le bandeau ouvre le sommaire.
- **Perles** (`docs/DESIGN.md`) : dite = or plein, en cours = soleil avec halo rosé, à venir = cercle or.
- **Sommaire en volet qui descend** depuis le bandeau, par-dessus le texte assombri : titre `Sommaire · Laudes`, chaque étape avec sa perle et sa précision (`Hymne · Soleil levant`, `Lecture brève · 1 Jn 4, 14-15`). Toucher une étape y conduit et referme le volet ; le bouton retour d'Android le referme aussi.
- **Revu le 2026-10-07** (comparaison avec l'app AELF, critique Impeccable, validé par le porteur du projet) : l'en-tête tient en une ligne `‹ date ☰`, le fil de perles sous le titre ouvre le sommaire ; le bandeau s'efface pendant la lecture et revient quand on remonte d'environ 1 cm ou en fin d'office, avec ‹ et ☰ ; ☰ ouvre le menu, qui liste les prières du jour à leur heure.

### Critères d'acceptation

- [ ] Le bandeau suit le défilement et nomme toujours la partie visible (parcours Playwright).
- [ ] Le sommaire liste toutes les étapes, et un toucher sur l'une d'elles y amène.
- [ ] Le fil de perles reste lisible pour l'office le plus long sur un écran de 360 px de large.

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
- **Ouverture** : l'app s'ouvre toujours sur l'accueil, même avec un chapelet en cours ; le chapelet s'ouvre par le menu ou par sa ligne de l'accueil, et son seuil propose la reprise. Pas de carte « Chapelet du jour » (US-6 retirée).
- **Ligne du chapelet** (demande du porteur du projet après essai, 2026-10-07, revient en partie sur l'US-6) : sous les complies, séparée des offices par un filet d'or, la ligne `Chapelet · 20 h` ouvre le seuil du chapelet ; elle s'atténue une fois son heure passée.
- **Menu** : le ☰ passe en haut de l'accueil ; le menu devient Aujourd'hui, Chapelet, Réglages, A propos. Le seuil du chapelet perd son ☰ au profit de « ‹ Retour » vers l'accueil. L'écran provisoire « Offices du jour » disparaît.
- **Cadran** : arc de 6 h à 22 h, complies au bout de l'arc (la maquette l'emporte sur l'ancien PRD), au sommet aplati (demande du porteur du projet après essai, 2026-10-07). Le soleil laisse place au croissant de lune entre le coucher et le lever, calculés pour la date du jour au centre de la France, sans demander de position (au lieu des heures solaires dès qu'il est choisi, phase 12).
- **Prière du moment** (revue le 2026-10-08) : une prière (office ou chapelet) est « du moment » de 30 minutes avant son heure à une heure après ; si deux créneaux se chevauchent, la plus proche de son heure. Hors de ces créneaux, aucun badge ni perle rouge (plus de complies « du moment » jusqu'à minuit, ni de laudes dès minuit). Sans aucun texte des offices (premier lancement sans réseau), aucun badge et les offices sont atténués. Tout office passé reste ouvrable d'un toucher, sur le cadran comme dans la liste.
- **Prière du moment, sur sa ligne** (2026-10-07, remplace l'encadré d'origine, qui répétait l'office déjà marqué dans la liste) : la ligne de l'office du moment porte, après son nom et un peu d'air, un badge discret `Prière du moment` (cerclé de rouge, minuscules italiques, 11 px), sans délai ; toute la ligne ouvre l'office.
- **Office des lectures** : en tête de la liste avec « à toute heure », jamais atténué, sans perle sur le cadran, jamais « du moment » ; il prendra place sur le cadran quand une heure lui sera donnée (phase 11).
- **Bandeau** : date (`MARDI 6 OCTOBRE`), temps (`27e semaine du temps ordinaire`, omis quand le titre le dit déjà), titre (fête ou saint, sinon nom du jour : `S. Bruno, prêtre`, `28e dimanche du temps ordinaire`), puis **une seule pastille de la couleur du jour, sans aucun texte** (ni nom de couleur, ni rang). Typographie corrigée (« 27e », minuscules), mots de l'AELF inchangés, mention « semaine du psautier » retirée. Lecteur d'écran : « couleur liturgique : vert ».
- **Autre jour** : en haut, « ‹ dim. 4 · Aujourd'hui · mar. 6 › » ; sur un autre jour, le centre devient « Revenir à aujourd'hui », les perles prennent toutes le même aspect, sans soleil ni lune, et aucune ligne ne porte le badge « Prière du moment ». Navigation jour par jour, sans calendrier ; glisser sur le cadran change aussi de jour, vers la gauche le suivant, vers la droite le précédent (demande du porteur du projet, 2026-10-07).
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
- **Renouvellement** : la réserve se complète à l'ouverture, au retour dans l'app et au retour du réseau ; l'accueil ou l'office restés sur un message d'absence se rechargent seuls quand le réseau revient.

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
- **Zone liturgique** : les 8 zones de l'AELF, France par défaut. Libellé `Zone liturgique`, aide `Le calendrier propre à votre pays ou région.`, choix `France`, `Afrique`, `Belgique`, `Canada`, `Luxembourg`, `Monaco`, `Suisse`, `Calendrier romain général`. Une seule ligne dans la rubrique Offices (`Zone liturgique` · zone retenue ›), qui ouvre le choix dans une fenêtre (`Annuler`). Si des textes sont gardés, une confirmation avant de les effacer : `Changer de zone ?` / `Les textes gardés pour prier sans connexion seront effacés et remplacés par ceux de la zone Belgique. Il faudra une connexion pour les recharger, sinon aucun texte ne sera disponible.` (« ceux du calendrier romain général » pour celui-ci) / `Changer`, `Annuler` (textes validés le 2026-10-08).
- **Taille du texte** : 5 crans (16, 18, 20, 22, 24 px ; 18 d'origine), boutons `A−` et `A+` autour de 5 points, avec en exemple le début du Notre Père (`Notre Père, qui es aux cieux, / que ton nom soit sanctifié,`) qui change en direct ; lien `Taille d’origine` seulement hors de 18 ; aide `Dans un office ou au chapelet, pincez ou écartez deux doigts.` Lecteur d'écran : `Réduire le texte`, `Agrandir le texte`, `Taille 2 sur 5`.
- **Ce qui grandit** : le texte à prier des offices et du chapelet, et à la même échelle ce qui s'y mêle (V/ R/, versets, astérisques, libellés des parties). Titres, accueil, menu et réglages ne changent pas.
- **Pincement** : il saute de cran en cran, sans aucun repère à l'écran : seul le texte change.
- **Thème** : `Thème` à trois choix `Automatique | Jour | Nuit`, aide `Automatique : nuit après le coucher du soleil, ou si le téléphone est en mode sombre.` (coucher du soleil du cadran : centre de la France, ou lieu des heures solaires dès qu'il est choisi).

### Critères d'acceptation

- [x] Changer de zone vide puis recharge le cache, et les offices affichés correspondent à la nouvelle zone.
- [x] En automatique, le thème nuit s'allume si Android est en mode sombre ou après le coucher du soleil ; « Jour » et « Nuit » le forcent ; tous les écrans respectent les jetons nuit.
- [x] La taille du texte s'applique aux offices et au chapelet, et persiste.
- [x] Pincer ou écarter deux doigts dans un office ou au chapelet change la taille du texte de cran en cran entre 16 et 24 px, sans faire avancer le chapelet (parcours Playwright).
- [x] Avec « réduire les animations », aucune transition ne joue (test).
- [x] À vérifier : le comportement de la zone `france` un jour de fête propre à la France (hypothèse du PRD). Vérifié le 2026-10-07 : la zone `france` répond `"zone":"france"` avec le propre de France (Ste Jeanne d'Arc le 30 mai, S. Louis le 25 août avec son oraison propre), et `"romain"` seulement les jours où les deux calendriers coïncident.

## Bloquée par

- Phase 5

---

## Phase 11 : Rappels à heure fixe

**User stories** : US-36, US-37, US-38, US-39, US-40, US-46

### Ce qu'on livre

Dans les réglages, une liste des offices et du chapelet à rappeler, chacun avec son heure. Les valeurs par défaut sont celles du PRD : aucun rappel activé. Les notifications sont programmées environ un mois à l'avance et arrivent même si l'app n'est pas ouverte. Un toucher sur la notification ouvre l'office ou le chapelet du jour. L'autorisation « Alarmes et rappels » est demandée au premier rappel activé, avec une explication. Sur Xiaomi et Samsung, l'app guide vers le réglage de batterie qui évite le blocage des rappels.

Décisions du porteur du projet (2026-10-07) :
- **Rubrique `Rappels`, la dernière des Réglages** (passée en tête le 2026-10-08, voir plus bas) : une ligne par prière dans l'ordre du jour (office des lectures, laudes, tierce, sexte, none, vêpres, complies, chapelet), avec son interrupteur et son heure ; toucher l'heure ouvre l'horloge d'Android. Résumé : les prières rappelées (`Laudes, vêpres, complies`), ou `Aucun rappel`.
- **App muette par défaut** : aucun rappel activé d'origine (le PRD est corrigé en ce sens).
- **Une seule heure partout** : l'heure réglée devient celle de l'office sur le cadran, dans la liste et pour la prière du moment, même rappel coupé.
- **Office des lectures** : sans heure (et hors du cadran) tant qu'on n'en a pas choisi une ; activer son rappel ouvre l'horloge, proposée sur 6 h 30.
- **Notification** : titre `C’est l’heure de l’office des lectures` / `des laudes` / `de tierce` / `de sexte` / `de none` / `des vêpres` / `des complies` / `du chapelet` ; texte : les premiers mots de la prière. `Seigneur, ouvre mes lèvres.` pour le premier office du matin (le plus matinal des rappels actifs entre lectures et laudes, R1), `Dieu, viens à mon aide.` pour les autres offices, `Je vous salue, Marie, pleine de grâce.` pour le chapelet.
- **Son, prière par prière** : sous la ligne de la prière, son son et son vibreur (`Cloche du matin · vibreur`) ; toucher le nom de la prière ouvre le choix : plusieurs cloches fournies par l'app (écoutables, à faire écouter au porteur avant de les retenir), `Son du téléphone`, `Choisir un MP3…`, et l'interrupteur `Vibreur`. D'origine : une cloche, vibreur activé.
- **Cloches retenues après écoute** (Wikimedia Commons, crédits dans A propos) : `Bourdon de Notre-Dame` (bourdon Marie, NemesisIII, CC BY-SA 3.0), `Cloche Marcel` (Notre-Dame de Paris, CC0), `Angélus de village` (Saint-Pé-d'Ardet, Tiasma31, CC BY-SA 3.0) ; extraits de 12 s. D'origine, selon l'heure : Cloche Marcel pour l'office des lectures et les laudes, Angélus de village pour tierce, sexte, none et le chapelet, Bourdon de Notre-Dame pour les vêpres et les complies.
- **Autorisations, au premier rappel activé** (textes validés) :
  1. `Recevoir les rappels` / `Pour vous prévenir à l’heure de la prière, l’app a besoin de votre accord. Android va vous le demander.` / `Continuer`, puis la fenêtre d'Android pour les notifications ;
  2. si besoin, `A la minute près` / `Pour que le rappel arrive à l’heure exacte, autorisez « Alarmes et rappels » dans la page qui va s’ouvrir.` / `Ouvrir la page` · `Plus tard` ;
  3. avis dans la rubrique en cas de refus : `⚠ Android bloque les notifications de l’app : aucun rappel ne s’affichera.` / `Ouvrir les Paramètres du téléphone`, et `⚠ Sans l’autorisation « Alarmes et rappels », les rappels peuvent arriver en retard.` / `Autoriser`.
- **Guide de batterie**, Xiaomi et Samsung seulement, juste après les autorisations et seulement si l'app n'est pas exemptée d'économie de batterie, puis par la ligne `Rappels bloqués ? Régler la batterie ›` en bas de la rubrique (textes validés) :
  - `Sur un Xiaomi` / `L’économiseur de batterie peut bloquer les rappels. Dans la page qui va s’ouvrir :` / `Economiseur de batterie : Aucune restriction` ;
  - `Sur un Samsung` / `La mise en veille des applis peut bloquer les rappels. Dans la page qui va s’ouvrir :` / `Batterie : Non restreinte` ;
  - boutons `Ouvrir la page` · `Plus tard`.
- **Démarrage automatique**, Xiaomi seulement, après le guide de batterie et seulement s'il est désactivé (textes validés le 2026-10-07) : `Démarrage automatique` / `Si l’app est fermée, Xiaomi l’empêche de se réveiller pour vous prévenir. Dans la page qui va s’ouvrir, activez Avec Dieu.` / `Ouvrir la page` · `Plus tard`. La page est celle de la sécurité de Xiaomi : sous HyperOS 2, ce réglage n'est pas dans la fiche de l'app. Vu le 2026-10-07 : l'app fermée depuis les récentes, sans démarrage automatique, son alarme ne la réveille plus et le rappel est perdu.
- **Avis des réglages qui bloquent**, tant qu'un rappel est activé et relus au retour des réglages d'Android (textes validés le 2026-10-07) :
  - toute marque, arrière-plan interdit : `⚠ Android interdit à l’app de travailler en arrière-plan : aucun rappel ne viendra.` / `Ouvrir les Paramètres du téléphone` ;
  - Xiaomi, démarrage automatique désactivé : `⚠ Le démarrage automatique est désactivé : si l’app est fermée, le téléphone ne la réveille pas et le rappel ne vient pas.` / `Ouvrir la page` ;
  - Xiaomi et Samsung, économie de batterie : `⚠ L’économiseur de batterie peut bloquer les rappels.` / `Régler la batterie` (remplace alors la ligne du guide).
- **Rappels bloqués, visibles sans déplier la rubrique** (décisions du porteur du projet, 2026-10-08) :
  - les Réglages s'ouvrent sur `Rappels`, puis `Affichage`, `Chapelet`, `Offices` ;
  - « bloqués » : tant qu'un rappel est activé, l'un des avis de blocage s'affiche (notifications refusées, arrière-plan interdit, démarrage automatique désactivé sur Xiaomi, économiseur de batterie sur Xiaomi et Samsung) ; l'avis « Alarmes et rappels » ne compte pas, un rappel en retard arrive quand même. Un seul calcul pour les avis, le résumé et l'accueil, relu à chaque retour dans l'app ;
  - résumé de la rubrique fermée : `⚠ Rappels bloqués par le téléphone`, en brun brique ; le lecteur d'écran entend `Rappels bloqués par le téléphone.` juste avant la rubrique ;
  - accueil : `⚠ Rappels bloqués par le téléphone ›` en brun brique, à droite du ☰ sur sa ligne (rien ne descend : les complies restent à l'écran à 360 × 780), sur l'accueil de chaque jour ; un toucher ouvre les Réglages, rubrique `Rappels` dépliée.
- **Détails de forme codés sans validation, à montrer avec l'essai sur téléphones** : le titre `Son` au-dessus du choix du son, le lien `Changer` à côté d'un MP3 déjà choisi, le nom du MP3 affiché en clair, l'écoute du son du téléphone et du MP3, l'heure écrite `7 h 00`, la rédaction des crédits des cloches dans A propos.

### Critères d'acceptation

- [ ] Les valeurs par défaut correspondent au tableau du PRD (aucun rappel activé).
- [ ] Une heure changée dans les rappels déplace l'office sur l'accueil.
- [ ] Chaque prière sonne avec le son et le vibreur choisis, y compris un MP3 du téléphone.
- [ ] Activer, désactiver ou changer l'heure d'un rappel reprogramme les notifications sur environ un mois.
- [ ] Un toucher sur la notification ouvre la bonne route (`/office/<office>/<date>` ou `/chapelet`).
- [ ] Un refus de l'autorisation est signalé par un avis expliquant que les rappels peuvent arriver en retard.
- [ ] Le guide de batterie s'affiche sur Xiaomi et sur Samsung, et pas sur les autres marques.
- [ ] Sur le Xiaomi, l'avis du démarrage automatique s'affiche tant qu'il est désactivé, et un rappel arrive l'app fermée depuis les récentes une fois activé.

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

Décisions du porteur du projet (2026-10-07, cadrage en cours) :
- **Commutateur en tête de la rubrique `Rappels`** : `Heures des prières` / `Fixes | Solaires` ; en solaire, aide `Selon la course du soleil à Lyon, du lever au coucher.` et ligne `Lieu : Lyon ›`. Lignes des offices : `Laudes · lever`, `Sexte · midi solaire`, avec l'heure du jour. Résumé de la rubrique : `Heures solaires · Laudes, vêpres`.
- **Aucune connexion** : lever et coucher se calculent sur le téléphone ; la liste des villes est embarquée (rien n'est cherché en ligne). **Villes de plus de 15 000 habitants** (GeoNames, environ 25 000 dans le monde), plus `Me localiser` par le GPS.
- **Décalage et limite** : chaque office solaire a un décalage de −1 h à +1 h, par 5 min ; les laudes ont une limite `Pas avant`, les vêpres une limite `Pas après`. D'origine : décalages à 0, laudes pas avant 7 h, vêpres pas après 19 h 30 (limites activées, désactivables).
- **Volet d'un office solaire** (toucher son heure ; complies, lectures et chapelet gardent l'horloge d'Android) : `LAUDES` / `Au lever du soleil` / `Décalage` avec `−` `0 min` `+` / `Pas avant 7 h 00` et interrupteur (heure réglée par l'horloge d'Android) / `Aujourd’hui : 7 h 52` / `Lever du soleil à Lyon : 7 h 52` / `Fermer`. Sous-titres : tierce `Fin de la 3e heure du jour`, sexte `Au midi solaire`, none `Fin de la 9e heure du jour`, vêpres `Au coucher du soleil` (limite `Pas après 19 h 30`).
- **Écran du lieu**, ouvert en passant à `Solaires` sans lieu connu (revenir sans choisir garde les heures fixes) ou par `Lieu : … ›` : croix `Fermer` (2026-10-08, remplace `‹ Retour`) / `LIEU DES HEURES SOLAIRES` / bouton `Me localiser` / `Une seule fois. La position reste sur le téléphone.` / `ou` / champ `Chercher une ville` (résultats `Saint-Denis · La Réunion, France`) / `Lieu actuel : Près de Lyon` (après le GPS, la ville la plus proche de la liste). Erreurs en brun brique :
  - `⚠ Aucune ville de ce nom dans la liste. Essayez une ville voisine de plus de 15 000 habitants, ou « Me localiser ».` ;
  - `⚠ Android refuse l’accès à la position. Cherchez plutôt une ville, ou autorisez la position dans les Paramètres du téléphone.` / `Ouvrir les Paramètres du téléphone` ;
  - `⚠ La position n’a pas pu être trouvée. Vérifiez que la localisation du téléphone est allumée, ou cherchez une ville.`
- **Voyage** : sur l'écran du lieu, `Actualiser à chaque ouverture` (désactivé d'origine), aide `A plus de 50 km du lieu enregistré, l’app recalcule les heures. La position reste sur le téléphone.` Le recalcul est silencieux : seule la ligne `Lieu :` change.
- **Cadran solaire** : arc doré du lever au coucher, prolongé en pointillés aux deux bouts pour les offices de la nuit (complies au bout). Repères `LEVER 7 H 52` · `MIDI` · `COUCHER 18 H 40`.
- **A propos**, nouvelle rubrique `Heures solaires` : `Liste des villes de plus de 15 000 habitants : GeoNames (CC BY 4.0). Lever et coucher du soleil calculés sur le téléphone.`

### Critères d'acceptation

- [x] Les levers et couchers calculés s'écartent de moins de 2 minutes des éphémérides officielles, pour plusieurs villes et dates (critère de succès 5).
- [x] Tierce, sexte et none tombent exactement au quart, à la moitié et aux trois quarts du jour solaire, décalage compris.
- [x] La saisie d'une ville introuvable affiche l'erreur prévue dans le design, et la position ne quitte jamais le téléphone.
- [x] Un déplacement simulé de plus de 50 km, avec l'option active, recalcule les heures et reprogramme les rappels. En dessous de 50 km, rien ne change.
- [x] Le cadran en mode solaire place les perles sur l'arc du lever au coucher.

Reste à confirmer sur les téléphones : « Me localiser » fonctionne (vérifié le 2026-10-07) ; un rappel solaire arrive à l'heure calculée (le porteur du projet le confirmera à la prochaine notification).

## Bloquée par

- Phase 11

---

> **Phases 15 à 17** (décision du porteur du projet, 2026-10-08) : le Rosaire, la clôture enrichie et les durées entrent dans le périmètre **avant la recette**. Elles gardent ces numéros pour ne pas renuméroter la recette et la publication.
>
> Décisions durables propres à ces phases :
> - **Route** `/rosaire` : le Rosaire du jour. Le commutateur du seuil passe de `/chapelet` à `/rosaire` ; l'accueil et le rappel du chapelet ouvrent celle que le choix retenu désigne.
> - **Réglages** : le choix Chapelet / Rosaire (Chapelet au départ) ; une bascule par texte de clôture ; pour les Litanies et saint Joseph, trois valeurs : en octobre, toujours, jamais.
> - **Chapelet en cours** : retient aussi Chapelet ou Rosaire et la série atteinte ; même règle de reprise (le jour même).
> - **Durées** : une table fixe dans le recueil des données, pas un calcul.

## Phase 15 : Durées affichées

**User stories** : US-59

### Ce qu'on livre

À côté du chapelet et de chaque office, l'app dit combien de temps prendre : sur le seuil du chapelet, sur l'accueil et dans le menu. Les durées sont celles du PRD, fixes, affichées « ~20 min ».

### Critères d'acceptation

- [ ] Les durées du PRD s'affichent sur le seuil, l'accueil et le menu, pour le chapelet et les 7 offices (test unitaire de la table, parcours Playwright sur les trois écrans).
- [ ] À 360 px de large, aucune ligne de l'accueil ni du menu ne passe à la ligne à cause de la durée ; le menu tient toujours sur un écran à 360 × 780.
- [ ] Le lecteur d'écran dit la durée en toutes lettres (« environ vingt minutes »).
- [ ] Captures des trois écrans validées par le porteur du projet.

## Bloquée par

Aucune — démarrable immédiatement.

---

## Phase 16 : Clôture enrichie et octobre

**User stories** : US-56, US-57, US-58

### Ce qu'on livre

Le chapelet se clôt selon l'ordre validé : Salve Regina, Litanies de la Sainte Vierge, verset et oraison du Rosaire, Sous l'abri de ta miséricorde, prière à saint Joseph. Les trois premiers Je vous salue Marie portent leur intention en rouge. Chaque texte se règle ; en octobre, les Litanies et saint Joseph s'ajoutent d'eux-mêmes. « A propos » donne les sources de l'ordre de clôture et est réorganisé pour rester lisible.

### Critères d'acceptation

- [ ] Les nouveaux textes (intentions, Litanies, verset, oraison du Rosaire, Sous l'abri, saint Joseph) sont rédigés d'après les versions liturgiques officielles, validés ligne par ligne par le porteur du projet et figés par le test d'empreinte.
- [ ] L'ordre de la clôture et les réglages de départ sont ceux du PRD (tests du déroulé pour chaque combinaison utile).
- [ ] Avec les réglages de départ, Litanies et saint Joseph sont dits le 1er et le 31 octobre, absents le 30 septembre et le 1er novembre ; « toujours » et « jamais » l'emportent sur le mois (critère de succès 10).
- [ ] « A propos » cite Léon XIII et l'usage français pour l'ordre de clôture ; sa nouvelle organisation est validée sur capture.
- [ ] Parcours Playwright : un chapelet d'octobre récité jusqu'à la fin passe par chaque texte de clôture ; analyse axe des écrans touchés.

## Bloquée par

Aucune — peut avancer en même temps que la phase 15.

---

## Phase 17 : Le Rosaire

**User stories** : US-51, US-52, US-53, US-54, US-55

### Ce qu'on livre

Sur le seuil, un commutateur Chapelet / Rosaire, retenu. Le Rosaire enchaîne les 20 dizaines, joyeux, lumineux, douloureux, glorieux : ouverture une fois, une ligne en rouge à chaque passage de série, un repère « Série n sur 4 », clôture une fois. Il se reprend au grain exact le jour même. Une aide repliée « Chapelet ou Rosaire ? » éclaire le novice. La ligne de l'accueil dit « Rosaire » quand ce choix est retenu. Le seuil, qui porte désormais le commutateur, les durées et les réglages de clôture, est réorganisé (impeccable layout).

### Critères d'acceptation

- [ ] Le déroulé du Rosaire : une ouverture, 20 dizaines dans l'ordre, trois passages de série, une clôture (tests unitaires ; critère de succès 9).
- [ ] Le texte de l'aide « Chapelet ou Rosaire ? » (les deux phrases validées, puis l'histoire et le sens) et les lignes de passage de série sont validés mot à mot par le porteur du projet.
- [ ] Le choix est retenu d'une ouverture à l'autre ; l'accueil et le rappel du chapelet ouvrent le Rosaire quand il est choisi.
- [ ] Un Rosaire interrompu en deuxième série reprend au grain exact le jour même et est abandonné passé minuit.
- [ ] La disposition du seuil est validée sur maquette puis sur capture à 360 px.
- [ ] Parcours Playwright : un Rosaire complet récité du début à la fin ; analyse axe du seuil et du Rosaire ; le seuil ajouté au contrôle des barres d'Android.

## Bloquée par

- Phase 15 (les durées sur le seuil)
- Phase 16 (la clôture partagée et ses réglages)

---

## Phase 13 : Recette en conditions réelles

**User stories** : aucune nouvelle. Valide les critères de succès 4, 6 et 8 du PRD.

### Ce qu'on livre

L'app est mise à l'épreuve dans la vraie vie du porteur du projet, sur ses deux téléphones. Les défauts constatés reviennent dans les phases concernées.

### Critères d'acceptation

- [ ] Pendant 7 jours consécutifs, sur le Xiaomi et sur le Samsung en veille, chaque rappel activé arrive à moins d'une minute de l'heure prévue et ouvre le bon office (critère 4).
- [ ] L'accueil s'affiche en moins de 2 secondes après l'ouverture de l'app, sur les deux téléphones (critère 6).
- [ ] Pendant 14 jours consécutifs, le porteur du projet dit laudes, vêpres, complies et un chapelet uniquement avec l'app (critère 8).

Points laissés pour la recette au fil des phases :
- l'icône de l'app sur l'écran d'accueil du Xiaomi et du Samsung (dépend de leur lanceur, phase 2) ;
- l'écran « A propos », validé « on peaufinera plus tard » (phase 4) ;
- la structure des offices AELF reste la même au fil de l'année (hypothèse du PRD) : tout office qui s'affiche mal pendant la recette est enregistré et ajouté au jeu de référence de la phase 6.

## Bloquée par

- Toutes les phases précédentes, phases 15 à 17 comprises

---

## Phase 14 : Publication sur le Play Store

**User stories** : aucune nouvelle. Décision du cadrage (2026-10-05) : l'app est d'abord installée directement, puis publiée.

### Ce qu'on livre

L'app est disponible sur le Play Store, avec l'accord écrit de l'AELF et la mention qu'elle demande.

### Critères d'acceptation

- [ ] L'AELF a donné son accord écrit ; les risques du PRD sont mis à jour selon sa réponse. En cas de refus pour les passages bibliques, le recueil des passages passe à la traduction Crampon (sans toucher au code) et ces passages sont validés par le porteur du projet.
- [ ] La mention de l'AELF figure dans l'app sous la forme qu'elle indique.
- [ ] Le compte Google Play Developer est ouvert par le porteur du projet (25 $, payés une fois).
- [ ] La fiche du Play Store est rédigée et validée par le porteur du projet, avec une déclaration de confidentialité : aucune donnée collectée, la position ne quitte pas le téléphone.
- [ ] L'app publiée s'installe depuis le Play Store sur le Xiaomi et le Samsung, signée par la même clé que les versions installées à la main.

## Bloquée par

- Phase 13
- Réponse de l'AELF au courrier du porteur du projet
