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
  - **La perle** comme motif unique : offices sur le cadran, grains du chapelet, grosse perle (bouton d'avancée de l'annonce du mystère), fil de perles pour la progression. Perle passée = or plein ; à venir = cercle or ; en cours = soleil avec halo ; office du moment sur le cadran = cercle rouge avec halo.
  - **Le cadran solaire** de l'accueil : arc elliptique ouvert vers le bas ; en mode heures fixes, les heures se répartissent linéairement de 6 h (gauche) à 22 h (droite), midi légèrement à gauche du sommet ; en mode solaire, l'arc va du lever au coucher. Repères « 6 h · midi · 18 h · 21 h » en petites capitales à l'extérieur de l'arc. Soleil doré à rayons à l'heure actuelle, lune en croissant après le coucher. Date, fête et pastille liturgique centrées sous l'arc.
- **Références** : maquette du cadran fournie par le porteur du projet ; aperçu `docs/design-preview.html`.

## Typography
- **Display/Hero** : Baumans (400, seule graisse, pas d'italique) — titres : nom de l'app, fête du jour, noms d'offices, titres de cartes. Choix décalé assumé par le porteur du projet ; jamais en dessous de 20 px.
- **Rubriques / dates** : Cormorant SC (500, 600) — vraies petites capitales pour les dates, libellés (« Prière du moment », « Antienne 1 »), V/ R/, repères du cadran, lettrines ; interlettrage 0,06–0,1 em ; jamais en dessous de 14 px.
- **Body** : Literata (400, 500, 600 + italique, taille optique automatique) — tout le texte des prières, les antiennes (italique), les boutons (500), les réglages.
- **Data/Tables** : Literata avec `tabular-nums lining-nums` — heures des offices, compteurs.
- **Code** : sans objet (aucun code affiché dans l'app).
- **Loading** : `https://fonts.googleapis.com/css2?family=Baumans&family=Cormorant+SC:wght@500;600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&display=swap` — à auto-héberger dans l'app (hors-ligne dès le premier lancement). `font-synthesis: none` pour interdire le faux gras de Baumans.
- **Scale** : 14 (libellés SC) / 16 (notes, heures) / 18 (texte des prières, défaut ; réglable 16 → 24) / 22 (nom d'office en liste) / 30 (titre de carte) / 40 (titre d'office) / 56 px (titre). Interligne du texte 1,65.
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
- **Semantic** : success `#4E6B3A`, warning `#9A6A12`, error `#7A3B1E` (brun brique, toujours accompagné de ⚠ et d'un texte — jamais le rouge des rubriques), info `#3E5C76`. Avis = filet gauche coloré de 3 px sur fond vélin.
- **Couleurs liturgiques** (pastilles, identiques jour/nuit, cerclées de sépia pâle) : blanc `#F4EFE4`, vert `#3E6A3F`, violet `#5A3E7A`, rouge `#B8231B`, rose `#D58F9C`, noir `#23201C`.
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
