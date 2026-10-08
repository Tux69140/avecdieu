---
target: écran de prière des offices
total_score: 29
p0_count: 0
p1_count: 0
timestamp: 2026-10-08T11-19-28Z
slug: src-ecrans-ecranoffice-tsx
---
Method: dual-agent (A: relecture de design · B: détecteur, axe et mesures)

## Score : 29/40 (Bon)
1 État 3 · 2 Monde réel 3 · 3 Contrôle 3 · 4 Cohérence 3 · 5 Prévention 3 · 6 Reconnaissance 3 · 7 Efficacité 3 · 8 Minimalisme 3 · 9 Erreurs 3 · 10 Aide 2

## Anti-patterns
LLM : pas de slop ; vrai bréviaire (rubriques rouges, ℣ ℟, versets, syllabes soulignées, ✱ ✝). Détecteur CLI : 0. Détecteur injecté : 3 « wide-tracking » sur les rubriques Cormorant SC (faux positifs, choix assumé). axe : 0 violation, jour et nuit, sur 11 états (laudes, complies, lectures, Toussaint, office absent, sommaire, menu, prières repliées et dépliées, invitatoire déplacé). Aucun débordement à 360 px ni à 24 px ; toutes les cibles à 48 px ; rien sous les barres d'Android.

## Forces
Typographie liturgique tenue jusqu'au détail ; rythme des étapes (repère seulement entre étapes, sommaire et fil sur les mêmes 13 étapes) ; fin d'office et états d'absence justes. Corrections précédentes vérifiées : fin, repères, office absent, césure, cibles 48 px, perles à venir 3,85:1, sections sans nom, voile du sommaire.

## Priorités
- [P2] Astérisque de médiante (et croix de flexe) seul sur sa ligne en grand texte : « Nous avons une ville forte ! / ✱ » (taille 24). L'espace avant le signe reste sécable.
- [P2] « Revenir à l’accueil » remplace l'office par un second accueil : le premier appui sur retour d'Android ne fait rien de visible.
- [P2] Perle de repère blanche des jours en blanc (Toussaint, Noël, Pâques…) presque invisible : 1,14:1 de jour, un anneau gris pâle.
- [P2] Lignes ℣/℟ et lignes de l'intercession sans retrait quand elles se coupent (grand texte) : la suite repart contre la marge et ressemble à une ligne nouvelle.
- [P3] « 1ᴱᴿ » encore en petites capitales dans la date (l'exposant hérite de Cormorant SC) ; « Plus bas » défile en douceur malgré « réduire les animations » ; perles « dite » 2,45:1 et « en cours » 1,72:1 de jour.

## Mineurs
℣ et ℟ lus « V barre oblique » par le lecteur d'écran ; fil de perles du titre annoncé « Sommaire » sans l'étape (la barre dit « étape 4 sur 13 ») ; « Plus bas » visible sous le voile du sommaire ; Gloire au Père replié en retrait dans les psaumes, contre la marge à l'introduction ; antienne d'ouverture en romain, reprise en italique ; « Dire l’invitatoire ici » sans contexte ; premier lancement hors ligne : « le chapelet se prie dès maintenant » sans lien ; page de Pâques sans suite à prier.

## Questions
Le ℟ de l'intercession doit-il revenir après chaque intention, comme l'antienne de l'invitatoire ? Quelle perle pour un jour en blanc ? Qui apprend au priant que « … » se touche, ce que dit le filet rouge, qu'on peut pincer ? L'antienne d'ouverture doit-elle être en italique comme sa reprise ?
