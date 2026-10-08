---
target: écrans du chapelet
total_score: 31
p0_count: 0
p1_count: 0
timestamp: 2026-10-08T14-08-23Z
slug: src-ecrans-ecranchapelet-tsx
---
Method: dual-agent (A: relecture de design · B: détecteur, axe et mesures). Navigateur MCP indisponible, les deux évaluations ont piloté la version construite avec le Playwright du projet, à 360 × 780.

## Score : 31/40 (Bon), contre 29
1 État 3 · 2 Monde réel 4 · 3 Contrôle 3 · 4 Cohérence 3 (2 avant) · 5 Prévention 3 · 6 Reconnaissance 3 · 7 Efficacité 3 · 8 Minimalisme 3 · 9 Erreurs 3 · 10 Aide 3 (2 avant)

## Anti-patterns
LLM : pas de slop, un objet de prière. Détecteur CLI : 0. Injecté : 3 au seuil (deux « wide-tracking » sur les rubriques Cormorant SC, « cramped-padding » sur Complet/Compact), faux positifs déjà écartés ; rien sur l'annonce, l'Ave, le compact, la fin. axe : 0 violation, jour et nuit. Cibles toutes ≥ 48 px, aucun défilement horizontal à 16, 20, 24 px, aucune césure, aucune apostrophe droite.

## Résolu depuis la critique précédente
Fin alignée sur l'office ; à plusieurs, une seule grammaire ; date sépia ; « ? » et aide à la taille du texte ; « Plus bas » au seuil ; exposant ; « Lire le passage » ; Ave tenant à 20 px barres comprises (7 px de marge).

## Priorités
- [P2] Deux titres en Baumans empilés à chaque grain : « Mystères lumineux » (30 px) au-dessus de « Je vous salue Marie » (28 px). L'office n'a qu'un titre en Baumans et nomme ses parties en rubriques. Correction : un seul titre en Baumans pendant la prière.
- [P2] « Prier à plusieurs » seulement dans les réglages, alors que le seuil propose déjà l'affichage et les vibrations pour la séance. Question produit.
- [P2] Lecteur d'écran : en compact, le mystère qui commence n'est jamais annoncé (hors région vivante), et les libellés « Voir la prière », « Lire le passage » sont lus à chaque grain ; la progression « prière 11 sur 78 » n'est pas dite. Compteur lu « 5 / 10 ».
- [P3] Clavier : après un toucher sur un lien du mode compact, Espace rebascule le lien au lieu d'avancer (télécommande Bluetooth).
- [P3] Titres 34 (seuil) / 30 (chapelet) / 32 (office) ; « ? » sur la ligne de la date au chapelet, sur celle du titre dans l'office.

## Personas
Débutant : rien ne dit « une dizaine par mystère », « fruit » non expliqué. Lecteur d'écran : voir ci-dessus. Pouce seul : excellent, toucher partout. Animateur âgé d'un groupe : « à plusieurs » enfoui ; à 24 px et à plusieurs, l'aide fait 748 px sur 780 et défile ; Credo à faire défiler en demi-gras.

## Mineurs
Annonce à 24 px : la zone fixe de la perle (181 px) ne laisse que 5 lignes du passage ; légende de la perle redite à chaque mystère. « FRUIT DU MYSTERE » coupé au milieu du fruit à l'annonce, « Fruit : » en compact. ℣ décale la première ligne centrée. « Voir la prière » se referme à chaque grain. Indice « Touchez l'écran pour avancer » redit après l'aide. Pas de ☰ pendant le chapelet (aucune décision notée). Contour des perles à venir 0,8 px à 3,85:1, suffisant mais fin.

## Questions
Pendant la prière, qui a besoin de « Mystères lumineux » quand la ligne du mystère le dit ? « À plusieurs », habitude ou choix du soir ? La légende de la perle cinq fois par chapelet ? Le chapelet, pièce close ou ☰ comme l'office ?
