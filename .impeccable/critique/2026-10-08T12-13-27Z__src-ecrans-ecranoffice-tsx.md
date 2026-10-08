---
target: écran de prière des offices
total_score: 31
p0_count: 0
p1_count: 1
timestamp: 2026-10-08T12-13-27Z
slug: src-ecrans-ecranoffice-tsx
---
Method: dual-agent (A: relecture de design · B: détecteur, axe et mesures)

## Score : 31/40 (Bon)
1 État 3 · 2 Monde réel 3 · 3 Contrôle 3 · 4 Cohérence 3 · 5 Prévention 3 · 6 Reconnaissance 3 · 7 Efficacité 3 · 8 Minimalisme 4 · 9 Erreurs 3 · 10 Aide 3

## Anti-patterns
LLM : pas de slop, un bréviaire. Détecteur CLI : 0. Injecté : 6 « wide-tracking » sur les rubriques Cormorant SC (faux positifs). axe : 0 violation, jour et nuit, sur 12 écrans (dont la fenêtre d'aide, « à plusieurs », consignes coupées, 24 px). Vérifiés : astérisque jamais seul à 24 px (29 signes), aucune intercession avec tiret (12 offices), retour à l'accueil sans second accueil, « Plus bas » d'un coup si animations réduites, ℣ ℟ nommés, fil de perles qui dit l'étape.

## Forces
Fidélité visible (ajout signalé, redit en italique, consigne rouge) ; grand texte qui tient ; structure constante ; répons redit qui libère la mémoire.

## Priorités
- [P1] « Prier à plusieurs » ne dit pas qui dit les psaumes (« Tous » seulement devant le Gloire au Père) ; le refrain de l'invitatoire, part de l'assemblée, n'a pas de ℟.
- [P2] La reprise d'une antienne prend la mise en page des vers (retrait, interligne) : le même texte a deux formes.
- [P2] Antiennes, invitatoire, intercession : une ligne coupée faute de place repart au bord, indiscernable d'une vraie ligne (la seconde moitié de l'intention n'a plus que ce repère).
- [P2] Fenêtre « Lire un office » : 15 px fixes (illisible pour qui a choisi 24 px), déborde de 10 px à 360 × 780, passe sous les barres d'Android, focus initial sur « Ne plus afficher ».
- [P3] Pâques : impasse sous un ⚠ d'erreur, le jour le plus joyeux.

## Mineurs
Perle « en cours » 1,72:1 ; bandeau resté affiché après un saut instantané en haut ; « Plus bas » visible sous le voile du sommaire ; retraits ℟ 1,45 em contre vers 1,2 em ; « Amen » espacé de trois façons ; répons bref aéré puis serré ; petites capitales accentuées (« BÉNÉDICTION ») face à la règle des majuscules sans accent ; « * Pitié pour nous » lu « astérisque ».

## Questions
Qui dit les psaumes à plusieurs ? Pourquoi le refrain de l'invitatoire n'a-t-il pas son ℟ ? Un fait liturgique normal doit-il parler avec la voix des erreurs ? L'aide doit-elle se rouvrir depuis l'office ? Faut-il un temps de silence à l'examen de conscience ?
