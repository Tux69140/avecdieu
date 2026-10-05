# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**Avec Dieu** : app Android (web empaquetée avec Capacitor) qui guide la liturgie des heures (textes de l'API AELF) et le chapelet marial. Les documents de `docs/` font référence, consulte-les avant de décider :

- `docs/PRD.md` : quoi et pourquoi (50 user stories, critères de succès, hors périmètre).
- `docs/PLAN.md` : décisions d'architecture durables (routes, modèles, stockage, frontière AELF), puis les phases. On avance phase par phase. Une phase est terminée quand ses critères d'acceptation sont cochés et que son parcours Playwright est vert.
- `docs/DESIGN.md` : jetons, polices, composants. `docs/design-preview.html` en est l'aperçu jetable, ignoré par git.

## Commandes

Pile : TypeScript + React + Vite, Vitest, Playwright (Capacitor Android arrive en phase 2 : compléter alors avec la construction et l'installation de l'APK).

- `npm run dev` : serveur de développement (http://localhost:5173).
- `npm run build` : vérification TypeScript puis construction dans `dist/`.
- `npm test` : tests unitaires Vitest. Un seul fichier : `npx vitest run src/chapelet/deroule.test.ts` ; un seul test : ajouter `-t "nom du test"`.
- `npm run test:e2e` : parcours Playwright (construit l'app et la sert sur le port 4173, émulation Pixel 7). Un seul test : `npx playwright test -g "glisser"`.
- `npm run lint` : oxlint.

## Organisation du code

- `src/recueil/` : textes sacrés figés (prières, mystères) et leur test d'empreinte.
- `src/chapelet/` : définition déclarative du chapelet, déroulé, série du jour, gestes, dessin.
- `src/ecrans/` : un écran par route ; routes déclarées dans `src/main.tsx`.
- `src/styles/jetons.css` : jetons de `docs/DESIGN.md` et polices auto-hébergées (paquets `@fontsource`).
- `e2e/` : parcours Playwright, un par phase au moins.

## Travailler avec le porteur du projet

- Il est chef de projet, pas développeur : l'IA code et débogue, il décide et valide. Réponds en français.
- Les choix techniques sont délégués : tranche-les toi-même. Garde les questions pour le produit, la liturgie et les textes, une à la fois, avec ta recommandation.
- Il ne relit pas le code. La preuve qu'une chose marche, ce sont les tests verts et les captures d'écran, jamais une affirmation.
- Il teste sur deux téléphones, un **Xiaomi** et un **Samsung**, deux marques qui bloquent volontiers les notifications en arrière-plan.

## Textes sacrés

- Prières, mystères (titres, fruits, références, passages), conclusions d'oraison et règles de rubriques vivent dans un recueil de données validé **ligne par ligne par le porteur du projet**, puis figé par un test d'empreinte. Rédige-les à partir des versions liturgiques officielles et soumets-les à sa validation avant de les figer. Toute modification passe par une nouvelle validation de sa part.
- Versions retenues : Notre Père dans la traduction liturgique de 2017 (« ne nous laisse pas entrer en tentation »), Credo du chapelet = Symbole des Apôtres, passages bibliques dans la traduction liturgique AELF.

## API AELF : pièges vérifiés

- Points d'accès : `https://api.aelf.org/v1/{informations|messes|lectures|laudes|tierce|sexte|none|vepres|complies}/AAAA-MM-JJ/{zone}`. CORS ouvert (`*`). **Aucun accès à la Bible.** Documentation de l'API (Swagger) à la racine `https://api.aelf.org/`.
- Les contenus sont des **fragments HTML** : `<span class="verse_number">`, syllabes accentuées en `<u>`, astérisque de médiante `*`, `V/` et `R/`, `<br>`. Ils sont assainis et transformés en modèle `Office` par **un seul module** ; aucun HTML AELF brut n'atteint l'écran.
- Les offices sont **abrégés** :
  - antienne donnée une seule fois ;
  - psaumes sans Gloire au Père ;
  - `notre_pere` contient seulement le titre « Notre Père » ;
  - oraison tronquée (« Toi qui règnes. ») ;
  - les laudes contiennent toujours l'invitatoire.

  La reconstitution selon les rubriques est le travail de l'app (phase 6).
- La zone `france` peut répondre `"zone":"romain"` les jours sans fête propre. Le comportement un jour de fête propre à la France reste à vérifier.
- Les textes AELF sont protégés par le droit d'auteur. L'usage personnel est acceptable. Avant de rendre l'app ou ses textes accessibles publiquement (hébergement public, Play Store), il faut l'autorisation de l'AELF, demandée par courrier par le porteur du projet.

## Design : choix délibérés

- Les titres sont en **Baumans** : c'est un choix décalé assumé par le porteur du projet, garde-le tel quel. Rubriques et dates en Cormorant SC, texte des prières en Literata. Interdis le faux gras (`font-synthesis: none`), car Baumans n'a qu'une graisse.
- Le **rouge est réservé aux rubriques** : V/ et R/, versets, astérisques, ajouts de l'app. Les erreurs s'affichent en brun brique `#7A3B1E` avec ⚠ et un texte explicatif.
- Les polices sont auto-hébergées : l'app doit fonctionner hors-ligne dès le premier lancement.

## Git

- Dépôt distant : `git@github.com:Tux69140/avecdieu.git`, branche `main`.
- Messages de commit en français, préfixés (`docs:`, `feat:`, `fix:`…).
