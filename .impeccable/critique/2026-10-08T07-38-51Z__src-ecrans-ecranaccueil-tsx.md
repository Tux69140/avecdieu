---
target: écran Aujourd’hui
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-10-08T07-38-51Z
slug: src-ecrans-ecranaccueil-tsx
---
Method: dual-agent (A: relecture de design · B: détecteur, axe et mesures)

## Score : 27/40 (Acceptable haut)
1 État 3 · 2 Monde réel 3 · 3 Contrôle 3 · 4 Cohérence 2 · 5 Prévention 2 · 6 Reconnaissance 3 · 7 Efficacité 3 · 8 Minimalisme 3 · 9 Erreurs 3 · 10 Aide 2

## Anti-patterns
LLM : pas de slop (cadran, parchemin, filets) ; seule la pilule « Prière du moment » sent le kit. Détecteur CLI : 0. Détecteur injecté : 0 (témoin vérifié). axe : 0 violation jour et nuit.

## Priorités
- [P1] Jour de mémoire sur téléphone (barres simulées) : titre sur 3 lignes, complies sous la barre de navigation, chapelet hors écran, sans « Plus bas ». Même un jour de férie, le chapelet déborde de 1,5 px sous la barre.
- [P1] Titre héros = typographie brute AELF (« S. », « [d'Avila] », « Eglise », « . Mémoire facultative ») en Baumans 24 px ; le rang coûte une ligne. Retouche d'un texte AELF : validation du porteur.
- [P2] Hiérarchie plate : titre 24 px contre noms d'offices 21 px, tous en Baumans ; le menu vient de passer en Literata 400. Un jour de férie, la semaine du temps ordinaire est le plus gros texte.
- [P2] Le chapelet s'atténue dès son heure (heure <= minutes) et n'a jamais le badge.
- [P2] Premier lancement sans réseau : badge vers un office impossible à ouvrir ; erreur en paragraphe centré de 6 lignes, forme différente de l'avis de l'office.
- [P3] Cadran : soleil caché par la perle du moment, « 21 h » sur la perle des complies, lune qui touche la date, cibles laudes/tierce qui se chevauchent (centres à 37,6 px) ; perles à venir 2,45:1.

## Mineurs
« › » dans le nom lu des lignes ; les 6 perles précèdent le h1 dans l'ordre de lecture et doublent les lignes ; badge 11 px ; pastille liturgique muette ; glissement non signalé ; à 10 h, sexte est déjà « du moment ».

## Questions
Semaine du temps ordinaire en vedette un jour de férie ? « Prochaine · midi » plutôt que « Prière du moment » avant l'heure ? Le cadran doit-il rester cliquable ? Le chapelet doit-il porter le badge à son heure ?
