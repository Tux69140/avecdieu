---
target: écrans du chapelet
total_score: 29
p0_count: 0
p1_count: 3
timestamp: 2026-10-08T13-14-13Z
slug: src-ecrans-ecranchapelet-tsx
---
Method: dual-agent (A: relecture de design · B: détecteur, axe et mesures)

## Score : 29/40 (Bon)
1 État 3 · 2 Monde réel 4 · 3 Contrôle 3 · 4 Cohérence 2 · 5 Prévention 3 · 6 Reconnaissance 3 · 7 Efficacité 3 · 8 Minimalisme 3 · 9 Erreurs 3 · 10 Aide 2

## Anti-patterns
LLM : pas de slop, un objet de prière. Détecteur CLI : 0. Injecté : 7 « wide-tracking » (petites capitales des rubriques, faux positifs), 1 « cramped-padding » sur le sélecteur Complet/Compact (faux positif probable). axe : 0 violation jour et nuit sur 7 états. Aucune césure, aucune apostrophe droite, aucun débordement à 360 px ni à 24 px. Fenêtre d'aide : tient à 360 × 640, hors des barres, focus sur « J'ai compris ».

## Forces
Chapelet dessiné qui porte la progression ; annonce protégée par la grosse perle ; reprise au grain près ; aide aux gestes déjà correcte là où celle de l'office pêchait.

## Priorités
- [P1] Fin du chapelet non alignée sur la fin de l'office : « Chapelet terminé » (= le « Fin » écarté) et « Recommencer » au centre, à portée d'un toucher machinal ; aucun « Revenir à l’accueil ».
- [P1] À plusieurs, deux grammaires : « Tous » rouge devant les prières dites ensemble au chapelet, demi-gras sans « Tous » dans l'office ; Gloire au Père partagé ℣/℟ au chapelet, dit par tous à l'office.
- [P1] À 24 px, l'en-tête (date sur deux lignes, titre, chapelet dessiné) prend 224 px : un Je vous salue ne tient plus, « Plus bas » à chaque grain (≈ 50 défilements).
- [P2] Date de la ligne de la croix en rouge rubrique (sépia dans l'office) : rouge hors rubrique.
- [P2] Aide aux gestes figée à 16 px et impossible à rouvrir (pas de « ? ») ; rien sur le pincement ni le ℣/℟ à plusieurs.
- [P2] « Plus bas » absent au seuil sans chapelet en cours alors que « Vibrations » est sous le pli.

## Mineurs
Perles jour sous 3:1 (en cours 1,72, à venir 2,45, halo 1,61), Ave à 7 px ; « Plus bas » 32 px de haut dans l'annonce ; progression non dite au lecteur d'écran ; « Reprendre à la 3e dizaine » sans exposant ; › lu dans le nom du lien du seuil ; « Coupez-/les » coupé ; Notre Père ouvert au défilement de l'annonce ; titres 34/30 px contre 32 dans l'office ; « Afficher la Lecture » / « Voir la prière » (deux verbes, L majuscule) ; case « Ne plus afficher » native.

## Questions
La fin du chapelet doit-elle ressembler à celle de l'office ? Le répons de l'Ave est-il « la part de tous » ? Faut-il la date quand la série le dit ? Toucher partout pour avancer, et un bouton au centre à la fin : lequel gagne ?
