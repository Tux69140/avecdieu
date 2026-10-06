# Rythme de travail — Avec Dieu

Règles reprises de Lumosphère, où chacune a été établie par la mesure d'un temps perdu.

## 1. Ce qui se voit se valide avant

Tout libellé, état ou écran visible par le porteur du projet est validé **avant** d'être codé en
entier : liste des textes exacts, ou capture. Les textes sacrés, toujours, ligne par ligne.

## 2. Captures pendant, pas en campagne finale

Une capture destinée au porteur du projet est prise **par la tâche qui modifie l'écran**, au
moment où elle le modifie, à 360 px de large (le plus petit téléphone visé). Jamais d'écran
capturé « pour la forme ». Les captures vivent dans le dossier temporaire de la session et sont
supprimées quand elles sont périmées.

## 3. Tests ciblés pendant, suite complète une fois

Voir `tests.md` : les tests des fichiers touchés pendant la tâche, la suite complète en fin de
lot et avant toute poussée.

## 4. Paralléliser ce qui ne se touche pas

Au moment du plan, noter pour chaque tâche les fichiers qu'elle modifie : deux tâches sans
fichier commun partent ensemble (sous-agents).

## 5. Une relecture par lot, pas par tâche

Une relecture de fond après un groupe cohérent de tâches ; contre-relecture réservée aux points
critiques (textes sacrés, données du porteur du projet, rappels manqués).

## 6. Comptes rendus courts

Ce qui a changé, ce qui a été vérifié (et comment), ce qui reste. Pas de récit du chemin
parcouru, pas de re-citation de la consigne.

## 7. Aucun processus ne survit à une session

Les serveurs de test sont démarrés et arrêtés par Playwright. Un serveur lancé à la main
(`pnpm dev`) est arrêté avant la fin de la session. Sur une machine partagée par plusieurs
sessions, ne couper que ses propres processus, par leur numéro.

## 8. Poussées par lot

Commits libres et fréquents en local ; poussée sur GitHub à la fin d'un lot de travail
cohérent, suite verte (le crochet `pre-push` la relance).
