# Design System — Avec Dieu

## Product Context
- **Quoi** : app Android qui guide la prière quotidienne — les 7 offices de la liturgie des heures (textes AELF reconstitués selon les rubriques) et le chapelet marial grain par grain, avec rappels et hors-ligne.
- **Pour qui** : laïc catholique francophone pratiquant, qui prie seul ou en famille, souvent le soir, parfois sans réseau. Voir `docs/PRD.md`.
- **Espace** : apps de prière catholiques (AELF, Prions en Église, YouPray, Prier Aujourd'hui).
- **Type** : app mobile de lecture et de récitation — plus proche d'un livre liturgique que d'un outil.
- **Memorable thing** : « bréviaire de poche ».

## Aesthetic Direction
- **Direction** : Livre d'heures — le livre liturgique raffiné (parchemin, encre, rubriques rouges, or), avec des titres géométriques décalés assumés.
- **Décoration** : intentionnelle — grain de papier très léger, filets fins, perles. Aucune illustration ni photo : le texte sacré est l'ornement.
- **Mood** : un objet de prière qu'on ouvre, calme et chaleureux ; une voix d'aujourd'hui (les titres) posée sur une voix séculaire (les rubriques et le texte).
- **Signatures** :
  - **Rubriques rouges** : tout ce qui est *indication* est en rouge, comme dans un missel — V/ et R/, libellés « Antienne », numéros de versets, astérisques de médiante, lettrines, et les ajouts de l'app (antienne répétée, Gloire au Père), signalés par un filet rouge à gauche et la mention « Ajouté selon les rubriques ». Le rouge n'est jamais utilisé pour les erreurs.
  - **La perle** comme motif unique : offices sur le cadran, grains du chapelet, grosse perle (bouton d'avancée de l'annonce du mystère), fil de perles pour la progression. Perle passée = or plein ; à venir = cercle or ; en cours = soleil avec halo rosé (rubrique diluée) ; sur le chapelet dessiné, les perles sont en relief (or poli, nacre cerclée d'or, soleil), éclairées en haut à gauche ; pendant le Gloire au Père, aucune perle : un halo rosé (rubrique diluée) éclaire le fil ; le chapelet dessiné est couché pour tenir peu de hauteur : boucle à gauche, médaille à son bout droit, pendentif qui part vers la droite puis s'arrondit vers le bas, croix pendue la tête en haut ; office du moment sur le cadran = cercle rouge avec halo rosé.
  - **Le cadran solaire** de l'accueil : arc elliptique ouvert vers le bas, au sommet aplati ; en mode heures fixes, les heures se répartissent linéairement de 6 h (gauche) à 22 h (droite), midi légèrement à gauche du sommet ; en mode solaire, l'arc va du lever au coucher. Repères « 6 h · midi · 18 h · 21 h » en petites capitales à l'extérieur de l'arc. Soleil doré à rayons à l'heure actuelle ; entre le coucher et le lever, croissant de lune au ciel, sous le sommet de l'arc. Date, temps, fête et pastille liturgique (une seule, sans texte) centrées sous l'arc ; ordinaux en exposant (« 27ᵉ »). Sous la liste des offices, après un filet d'or, la ligne « Chapelet · 20 h », atténuée une fois l'heure passée.
- **Références** : maquette du cadran fournie par le porteur du projet ; aperçu `docs/design-preview.html`.

## Typography
- **Display/Hero** : Baumans (400, seule graisse, pas d'italique) — titres : nom de l'app, fête du jour, noms d'offices, titres de cartes. Choix décalé assumé par le porteur du projet ; jamais en dessous de 20 px.
- **Rubriques / dates** : Cormorant SC (500, 600) — vraies petites capitales pour les dates, libellés (« Antienne 1 »), V/ R/, repères du cadran, lettrines ; interlettrage 0,06–0,1 em ; jamais en dessous de 14 px.
- **Body** : Literata (400, 500, 600 + italique, taille optique automatique) — tout le texte des prières, les boutons (500), les réglages ; un texte redit (antienne reprise, répons) en italique, sa première fois en romain.
- **Data/Tables** : Literata avec `tabular-nums lining-nums` — heures des offices, compteurs.
- **Code** : sans objet (aucun code affiché dans l'app).
- **Loading** : `https://fonts.googleapis.com/css2?family=Baumans&family=Cormorant+SC:wght@500;600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&display=swap` — à auto-héberger dans l'app (hors-ligne dès le premier lancement). `font-synthesis: none` pour interdire le faux gras de Baumans.
- **Scale** : 14 (libellés SC) / 16 (notes, heures) / 18 (texte des prières, défaut ; réglable 16 → 24) / 22 (nom d'office en liste) / 30 (titre de carte) / 32 (titre d'office) / 56 px (titre). Interligne du texte 1,65 ; vers des psaumes, cantiques et hymnes 1,5.
- **Psalmodie** : syllabes accentuées soulignées d'un trait fin rouge (1 px, décalé de 3 px), masquables ; numéros de versets en exposant rouge 12 px.

## Color
- **Approche** : restrained — parchemin et encre ; le rouge des rubriques et l'or sont les seuls accents ; les couleurs liturgiques n'existent qu'en pastilles.
- **Thème jour** :
  - Parchemin (fond) `#EBE0CB` · Vélin (cartes, champs) `#F6EFE2` · Filet `#D6C7AB`
  - Encre (texte) `#2B2118` · Sépia (texte secondaire) `#6B5A48` · Sépia pâle `#A39280`
  - Rubrique `#9E2A1F` · Or `#B08A3E` · Or foncé `#8A6A2A` · Soleil `#D9A441` · Halo `rgba(217,164,65,.28)`
- **Primary** : Encre `#2B2118` — bouton principal (fond encre, texte vélin ; survol rubrique).
- **Secondary** : Or `#B08A3E` — bouton secondaire (contour or), perles, arc du cadran, focus des champs (halo).
- **Neutrals** : `#F6EFE2` → `#EBE0CB` → `#D6C7AB` → `#A39280` → `#6B5A48` → `#2B2118`
- **Semantic** : success `#4E6B3A`, warning `#9A6A12`, error `#7A3B1E` (brun brique, toujours accompagné de ⚠ et d'un texte — jamais le rouge des rubriques), info `#3E5C76`. Avis = cadre de 1 px de leur couleur sur fond vélin (plus de filet latéral, 2026-10-08).
- **Couleurs liturgiques** (pastilles, identiques jour/nuit, cerclées de sépia) : blanc `#F4EFE4`, vert `#3E6A3F`, violet `#5A3E7A`, rouge `#B8231B`, rose `#D58F9C`, noir `#23201C`.
- **Dark mode — thème nuit** : brun-noir chaud, jamais noir pur, pour les complies dans la pénombre. Nuit (fond) `#14100C` · Surface `#1D1813` · Filet `#3A3026` · Encre `#E6D9C2` · Sépia `#A6927A` · Sépia pâle `#6E604F` · Rubrique `#E07A6A` · Or `#C9A45C` · Soleil `#E2B45A` · success `#8FB07A`, warning `#D8A94A`, error `#D98A5E`, info `#8FB0CC`. Bouton principal inversé (fond encre clair, texte sombre). Activation automatique selon le réglage Android ou après le coucher du soleil.
- **Grain** : bruit fractal très léger en surimpression (opacité 7 % le jour, 5 % la nuit).

## Spacing
- **Base** : 4px
- **Densité** : spacieuse — on lit et on prie, on ne scanne pas.
- **Scale** : 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approche** : grid-disciplined — une seule colonne de lecture, marges de livre.
- **Grid** : 1 colonne sur téléphone, gouttières latérales 20–24 px (16 px sous 420 px de large).
- **Max content width** : 34 em pour le texte des prières (≈ 600 px).
- **Sections** : séparées par des filets fins (1 px, couleur Filet), jamais par des ombres.
- **Border radius** : sm:2px, md:4px (boutons, champs), lg:8px (cartes), full:9999px (perles, pastilles uniquement).
- **Cibles tactiles** : ≥ 48 px ; la grosse perle fait 72 px.

## Motion
- **Approche** : intentionnelle et sobre — accompagner le recueillement, jamais attirer l'œil.
- **Usages** : fondu entre prières du chapelet, perle qui se remplit à l'avancée, transitions d'écran en fondu, soleil qui glisse sur l'arc au fil de la journée, léger enfoncement de la grosse perle au toucher (échelle 0,94).
- **Easing** : enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration** : micro(50-100ms) court(150-250ms) moyen(250-400ms) long(400-700ms)
- **Réduire les animations** : si Android le demande, toutes les animations et transitions sont coupées.

## Decisions Log
| Date | Décision | Rationale |
|------|----------|-----------|
| 2026-10-05 | Création initiale | /design — app de prière (offices AELF + chapelet), « bréviaire de poche », à partir de la maquette du cadran solaire du porteur du projet |
| 2026-10-05 | Titres en Baumans au lieu de Cormorant Garamond | Choix du porteur du projet : style décalé assumé ; les rubriques restent en Cormorant SC et le texte en Literata pour garder la voix liturgique |
| 2026-10-05 | Parchemin jour assombri `#F6EFE2` → `#EBE0CB` | Demande du porteur du projet ; le vélin passe à `#F6EFE2` pour garder les cartes plus claires que le fond |
| 2026-10-05 | Aucune police sans empattements pour le texte | Le texte des prières est l'objet même d'un bréviaire ; Literata est dessinée pour la lecture longue sur écran |
| 2026-10-06 | Perles du chapelet en relief | Choix du porteur du projet parmi trois dessins : plus vivant que le dessin plat, sans ornement ajouté (ni chaînette, ni médaille gravée) |
| 2026-10-06 | Gloire au Père : halo rosé sur le fil | Choix du porteur du projet : aucune perle n'apparaît, le halo rosé distingue clairement le Gloire au Père des perles |
| 2026-10-06 | Seuil du chapelet avant le signe de croix | Choix du porteur du projet : les cinq mystères et « Commencer le chapelet », puis les autres séries et l'affichage ; les choix se font avant la prière, jamais pendant |
| 2026-10-06 | Signal « Plus bas » sur tout écran plus long que le téléphone | Demande du porteur du projet : rien ne doit rester ignoré sous la ligne de flottaison ; texte et chevron sur une seule ligne |
| 2026-10-06 | Aide aux gestes au début du chapelet | Validée par le porteur du projet : fenêtre par-dessus le signe de croix, avec « Ne plus afficher » |
| 2026-10-06 | Mode compact : liens « Voir la prière » et « Lire le passage » | Validés par le porteur du projet : en compact, l'annonce se fait sur le Notre Père, sans écran à part |
| 2026-10-06 | Accueil : lune sous le sommet de l'arc, pastille seule | La lune posée à l'heure se cachait derrière la perle des complies ; une seule pastille sans texte, choix du porteur du projet pour un écran simple à lire |
| 2026-10-07 | Accueil : arc aplati, ligne du chapelet sous les offices | Demandes du porteur du projet après essai ; le chapelet dessiné passe couché, croix pendue la tête en haut (il refuse la croix couchée) |
| 2026-10-07 | Lueur rosée de toutes les perles en cours | Choix du porteur du projet : chapelet dessiné, grosse perle de l'annonce, fil de perles des offices, office du moment sur le cadran ; le soleil du cadran garde son halo d'or |
| 2026-10-07 | Office : en-tête sur une ligne, vers resserrés ; interrupteurs lisibles | Comparaison avec l'app AELF et critique Impeccable, validées par le porteur du projet : ‹ date ☰ sur une ligne de 48 px, titre à 32 px, fil de perles sous le titre (ouvre le sommaire), repères 16/12 px ; interrupteur allumé = rail plein d'or (or foncé le jour, 3,85:1), éteint = rail vide cerclé de sépia |
| 2026-10-07 | Barre d'office qui s'efface ; menu des prières du jour | Validés par le porteur du projet : la barre (‹, étape et fil de perles, ☰) se cache en lisant, revient après 32 px de remontée et en fin d'office ; le menu ☰ liste les 7 offices et le chapelet à leur heure, l'office ouvert marqué de la perle rosée ; chaque écran s'ouvre en haut, le retour retrouve sa place |
| 2026-10-07 | Accueil resserré | Validé par le porteur du projet : lignes des offices à 48 px, marges réduites ; à 360 × 780, l'écran montre tout jusqu'aux complies sans défiler, cadran inchangé |
| 2026-10-07 | Accueil : badge « Prière du moment » sur la ligne de l'office | Demande du porteur du projet : l'encadré répétait la liste ; badge discret cerclé de rouge, Literata italique 11 px (plus étroite que les petites capitales), sans délai, écarté du nom de 16 px ; tout tient à 360 px jusqu'au chapelet |
| 2026-10-07 | « Plus bas » s'efface dans un office dès qu'on lit | Choix du porteur du projet : au-delà de 48 px de défilement, le signal ne revient plus dans l'office ; il reste partout ailleurs |
| 2026-10-08 | Fermer : une croix fine partout, titres centrés sur sa ligne | Décision du porteur du projet : la même croix (sépia, trait de 1,5, dessin de 18 px, cible de 48 px) en haut à gauche de chaque écran, chapelet en prière compris, remplace « ‹ Retour » et ‹ ; le titre se centre sur sa ligne et gagne une ligne en haut (au seuil, au chapelet et dans l'office, la ligne de la croix porte la date) |
| 2026-10-08 | › réservé à « ouvre un autre écran » | Décision du porteur du projet : les rubriques des réglages prennent une flèche dessinée vers le bas (le caractère retombait sur Arial), retournée vers le haut une fois ouverte, rotation de 0,2 s coupée si les animations sont réduites |
| 2026-10-08 | Menu : chapelet à part, lignes de 48 px en graisse normale | Décision du porteur du projet : le chapelet forme son groupe sous les offices, séparé par un filet d'or comme sur l'accueil ; lignes à 48 px, Literata 400 (l'office ouvert en 600) ; le menu tient sur un écran de 360 × 780 |
| 2026-10-08 | Date du menu en petites capitales, telle quelle | Choix assumé du porteur du projet après la critique du menu : la date (« jeudi 8 octobre », Cormorant SC 15 px, sépia) reste comme elle est ; ne plus la signaler comme trop ténue dans les critiques |
| 2026-10-08 | Bandeau de l'accueil : rang du jour en petit, saint seul en gros | Choix du porteur du projet : le rang (« 27e semaine du temps ordinaire ») toujours dans la petite ligne, Cormorant SC 400, le même chaque jour ; en gros, la fête ou le saint seul, sans qualités ni rang de célébration (« S. Denis », abréviations gardées pour la place) ; rien en gros un jour sans fête ni saint |
| 2026-10-08 | Pas d'accent sur les majuscules | Choix du porteur du projet pour ses applications : « A propos », « Ecouter » ; la cédille reste |
| 2026-10-08 | Noms d'offices en Baumans sur l'accueil, en Literata dans le menu | Choix assumé du porteur du projet après la critique de l'accueil : l'écart entre les deux écrans est voulu ; ne plus le signaler |
| 2026-10-08 | Accueil : « ⚠ Rappels bloqués par le téléphone › » à droite du ☰ | Décision du porteur du projet : quand le téléphone bloque les rappels, une ligne en brun brique (Literata 15 px), sur la ligne du ☰ pour ne rien faire descendre ; les complies restent à l'écran à 360 × 780. Le résumé de la rubrique Rappels, passée en tête des Réglages, le dit aussi |
| 2026-10-08 | Saint du jour en tête de l'office | Choix du porteur du projet : le saint seul, comme sur l'accueil, en Cormorant SC 13 px sépia à droite du titre, qui reste centré ; sur plusieurs lignes s'il est long, jamais en défilement ; sous le titre pour l'office des lectures ; rien un jour de fête (« Tous les Saints ») |
| 2026-10-08 | Fin de l'office | Choix du porteur du projet : après la dernière partie, une perle d'or entre deux filets, puis « Revenir à l’accueil » (lien discret, centré) ; aucune mention « Fin » ; l'écran reste allumé, on lit peut-être encore le haut |
| 2026-10-08 | Pas de repère entre une antienne et son psaume | Décision du porteur du projet : le filet à perle ne sépare plus que les étapes (antienne, psaume et reprise) ; entre l'antienne et le psaume qu'elle ouvre, un espace de 24 px. L'invitatoire et son psaume suivent la même règle |
| 2026-10-08 | Aucun mot coupé en fin de ligne | Choix du porteur du projet : plus de césure automatique dans le texte prié (offices et passages du chapelet), plus joli et plus lisible à voix haute ; la prose passe à la ligne entière |
| 2026-10-08 | Texte des offices aligné à gauche | Choix du porteur du projet : l'office se lit comme un livre (retraits des vers, versets et ℣. ℟. dans la marge, filet des ajouts) ; seules les prières du chapelet, montrées une à une, sont centrées |
| 2026-10-08 | Apostrophes typographiques, mots composés entiers | Décision du porteur du projet : l'AELF mêle « j'ai » et « l’honneur » ; tout devient « ’ » à la lecture (textes, titres, sources), sans effet sur un texte déjà juste. Un mot composé (« Saint-Esprit », « délivre-nous ») ne se coupe plus à son trait d'union |
| 2026-10-08 | Perles de couleur cerclées de sépia | Choix du porteur du projet après la critique de l'office : cerclée de sépia pâle, la perle blanche des fêtes et mémoires (1,14:1) ne se voyait plus ; toutes les couleurs prennent le cerclage sépia, dans l'office et sur l'accueil |
| 2026-10-08 | Pour qui débute : répons redit, consignes, aide | Décisions du porteur du projet : le répons de l'intercession redit après chaque intention (R12) ; consignes rouges en italique (« On la répète aussitôt. », « On reprend l’antienne. », « On répond après chaque intention : », R13), masquables par « Consignes pour débuter » ; fenêtre « Lire un office » comme l'aide du chapelet, huit lignes qui n'expliquent que ce qui se voit, réglage « Aide à la lecture » |
| 2026-10-08 | Le premier dit droit, le redit en italique | Choix du porteur du projet : l'antienne qui ouvre un psaume reste en romain, sa reprise, le répons redit et la reprise du répons bref passent en italique |
| 2026-10-08 | « L’invitatoire était aux laudes. Le dire ici » | Décision du porteur du projet : la raison avant l'action, seuls les derniers mots se touchent |
| 2026-10-08 | Intercession sans tiret | Choix du porteur du projet : celui qui mène lit l'intention en entier, tous répondent par le ℟ ; le tiret de la seconde moitié n'est plus affiché, la moitié garde sa ligne |
| 2026-10-08 | À plusieurs : la part de tous en demi-gras | Choix du porteur du projet sur maquette : Literata 600, interligne inchangé ; une strophe de psaume ou de cantique sur deux (celui qui mène commence), les reprises de l'antienne de l'invitatoire, le Gloire au Père (plus de « Tous ») ; une ligne de l'aide, dans ce mode seulement |
| 2026-10-08 | En-tête de l'office : saint à gauche, « ? » à droite | Choix du porteur du projet : un petit « ? » cerclé de sépia (cible de 48 px) rouvre « Lire un office » ; aux lectures, saint sous le titre et « ? » au bout de sa ligne |
| 2026-10-08 | Pâques : une note, pas une erreur | Choix du porteur du projet : même texte, en sépia, sans ⚠ ni encadré, puis « Prier les laudes » et « Revenir à l’accueil » |
| 2026-10-08 | Petites capitales sans accent | Choix du porteur du projet : une police tirée de Cormorant SC dessine les lettres accentuées sans accent (« BENEDICTION »), cédille gardée ; le texte garde ses accents |
| 2026-10-08 | Chapelet aligné sur l'office | Choix du porteur du projet après la critique du chapelet : la fin comme celle de l'office (perle d'or entre deux filets, « Revenir à l’accueil » ; plus de « Chapelet terminé » ni de « Recommencer », qu'un toucher machinal relançait) ; la date seule, en sépia, sur la ligne de la croix, au seuil et en prière ; « ? » en face de la croix rouvre l'aide aux gestes, qui suit la taille du texte et dit « Ecartez deux doigts pour agrandir le texte. » |
| 2026-10-08 | Chapelet à plusieurs : demi-gras, plus de « Tous » | Choix du porteur du projet : comme dans l'office, les prières dites ensemble (signe de croix, Credo, Ô mon Jésus, Salve Regina jusqu'au verset) passent en Literata 600 ; Notre Père, Je vous salue et Gloire au Père restent partagés en ℣/℟ (usage du chapelet récité en groupe), sans demi-gras ; l'aide du chapelet reprend, à plusieurs, les deux lignes de l'office (℣ ℟, demi-gras) |
| 2026-10-08 | Chapelet : le haut se resserre en grand texte | Choix du porteur du projet après la critique du chapelet : au-delà de 18 px, le chapelet dessiné rapetisse (64 px de haut à 20 px, 56 à 22, 48 à 24) et les espaces se resserrent ; un Je vous salue tient à 20 px sur 360 × 780, barres d'Android comprises ; à 24 px, on fait encore défiler de deux lignes |
| 2026-10-08 | Perles à venir cerclées d'or foncé, de jour | Choix du porteur du projet après la critique du chapelet : le cercle des perles nacrées passe de l'or à l'or foncé pour se détacher du parchemin ; la nuit garde l'or |
| 2026-10-08 | « Lire le passage », pas « Lecture » | Décision du porteur du projet : « Lecture » désigne l'office des lectures, sans rapport avec le chapelet ; le lien du mode compact redevient « Lire le passage » / « Masquer le passage », et le réglage « Titre, fruit et passage avant chaque dizaine. » |
| 2026-10-08 | Pendant le chapelet, la série n'est qu'une indication | Choix du porteur du projet après la seconde critique du chapelet : « Mystères lumineux » passe en petites capitales sépia (Cormorant SC 15 px, comme la date) sous la ligne de la croix ; le nom de la prière est le seul titre en Baumans. Au seuil, le titre de la série passe de 34 à 32 px, comme celui de l'office |
| 2026-10-08 | Seuil : les choix avant les autres séries, repliées | Choix du porteur du projet : sous « Commencer le chapelet », l'affichage, les vibrations et « Prier à plusieurs » (le même réglage que dans les réglages), puis « Prier d’autres mystères » en accordéon, replié, résumé par les noms des séries (« Lumineux, douloureux, glorieux »). Les cinq mystères sous le titre ne sont qu'une indication : Literata 16 px sépia, numéros rouges à 15 px, pour que les choix restent à l'écran |
| 2026-10-08 | Menu : offices et prières repliés, deux prières en accès direct | Choix du porteur du projet : Aujourd’hui ; Chapelet, Je vous salue Marie, Notre Père ; « Offices du jour » (la date en petites capitales sous le nom) et « Prières » (Je crois en Dieu, Gloire au Père, Salve Regina, Je confesse à Dieu) en accordéon, sur une ligne du menu avec la flèche vers le bas, dépliés les offices quand le menu vient d'un office ; Réglages, A propos. Chaque prière a sa page, comme une prière du chapelet (titre Baumans 32 px, texte centré, ℣ ℟ à plusieurs), close comme un office (perle d'or, « Revenir à l’accueil ») |
