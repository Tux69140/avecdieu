---
target: écran de prière des offices
total_score: 28
p0_count: 0
p1_count: 2
timestamp: 2026-10-08T09-52-14Z
slug: src-ecrans-ecranoffice-tsx
---
Method: dual-agent (A: relecture de design · B: détecteur, axe et mesures)

## Score : 28/40 (Bon, bas de fourchette)
1 État 3 · 2 Monde réel 3 · 3 Contrôle 3 · 4 Cohérence 3 · 5 Prévention 3 · 6 Reconnaissance 2 · 7 Efficacité 3 · 8 Minimalisme 3 · 9 Erreurs 3 · 10 Aide 2

## Anti-patterns
LLM : pas de slop ; identité liturgique (rubriques rouges, V/ R/, versets, syllabes soulignées, Literata). Détecteur CLI : 0 (aussi sans config). Détecteur injecté : 3 « wide-tracking » sur des rubriques Cormorant SC (faux positifs, choix assumé). axe : 0 grave ou critique jour et nuit ; 1 modéré « landmark-unique » (deux sections « Antienne » aux complies, deux « Répons » aux lectures).

## Forces
Typographie liturgique juste et lisible jusqu'à 24 px ; bandeau qui s'efface et sommaire qui marque l'étape ; hors-ligne honnête ; contrastes de texte tous au-dessus du seuil (sépia 5,05 jour / 6,32 nuit, rubrique 5,72 / 6,46).

## Priorités
- [P1] L'office n'a pas de fin : après la dernière ligne (antienne mariale des complies), parchemin vide, aucun signe de clôture ni suite ; seul le bandeau revenu (perles or) dit « fini ». L'écran reste allumé.
- [P1] Le jour de fête n'est pas nommé dans l'office : la Toussaint s'ouvre sur « Dimanche 1er novembre · Laudes » ; la perle blanche de la couleur du jour ressemble à une perle vide. Reprendre la règle du bandeau de l'accueil (fête ou saint seul, rien un jour de férie).
- [P2] L'antienne est séparée de son psaume par le même repère qu'entre deux parties sans lien ; romain à l'ouverture, italique à la reprise. L'écran découpe 18 parties, le sommaire 13 étapes.
- [P2] Office absent : « Impossible de récupérer l'office. » puis « L'AELF ne propose pas cet office pour ce jour », sans suite ; page vide. Premier lancement : « Le chapelet, lui, se prie dès maintenant » sans lien.
- [P3] Coupures de mots dans les oraisons (« avan-cer », « ré-pondu ») ; « Plus bas » 44 px (zone touchable 42 px au-dessus de la barre) ; prières repliées d'une ligne 30 px ; perles à venir du fil 2,45:1 (sous 3:1) ; fondu du fond du sommaire non coupé par « réduire les animations ».

## Mineurs
« 1ER » en petites capitales au lieu de l'exposant ; titre de l'antienne mariale qui répète sa première ligne ; apostrophes droites AELF à côté des typographiques ; « Psaume 67 - I » (trait d'union) ; Gloire au Père replié pris pour un vers coupé ; « Dire l'invitatoire ici » sans contexte ; perles du titre annoncées « Sommaire » sans l'étape ; pincement sans aucune affordance ; DESIGN.md décrit encore les avis à filet gauche.

## Questions
Qu'est-ce qui dit au priant des complies qu'il peut poser le téléphone ? Pourquoi la Toussaint ressemble-t-elle à un mardi ? L'antienne appartient-elle au psaume ou à l'office ? Une phrase unique expliquerait-elle le filet rouge des ajouts ?
