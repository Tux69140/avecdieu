# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**Avec Dieu** : app Android (web empaquetée avec Capacitor) qui guide la liturgie des heures (textes de l'API AELF) et le chapelet marial. Les documents de `docs/` font référence, consulte-les avant de décider :

- `docs/PRD.md` : quoi et pourquoi (50 user stories, critères de succès, hors périmètre).
- `docs/PLAN.md` : décisions d'architecture durables (routes, modèles, stockage, frontière AELF), puis les phases. On avance phase par phase. Une phase est terminée quand ses critères d'acceptation sont cochés et que son parcours Playwright est vert.
- `docs/PRODUCT.md` : synthèse stratégique (utilisateurs, personnalité, principes) pour les travaux de design.
- `docs/DESIGN.md` : jetons, polices, composants. `docs/design-preview.html` en est l'aperçu jetable, ignoré par git.

## Commandes

Pile : TypeScript + React + Vite, Vitest, Playwright, Capacitor 8 pour l'APK Android (`android/`, versionné). Gestionnaire de paquets : **pnpm**, jamais npm ni npx (`pnpm add`, `pnpm exec`).

- `pnpm dev` : serveur de développement (http://localhost:5173).
- `pnpm build` : vérification TypeScript puis construction dans `dist/`.
- `pnpm test` : tests unitaires Vitest. Un seul fichier : `pnpm exec vitest run src/chapelet/deroule.test.ts` ; un seul test : ajouter `-t "nom du test"`.
- `pnpm test:e2e` : parcours Playwright, dont l'accessibilité (construit l'app et la sert sur le port 4173, émulation Pixel 7). Un seul test : `pnpm exec playwright test -g "glisser"`.
- `pnpm lint` : ESLint, Prettier, longueur des fichiers (500 lignes au plus, tests exceptés) et types. `pnpm lint:fix` corrige le style.
- `pnpm apk` : APK signé dans `dist-apk/` (demande le mot de passe de la clé : c'est le porteur du projet qui le lance). `pnpm apk:installer` : installe sur les téléphones branchés en USB. Procédure complète, clé comprise : `docs/APK.md`. Pour vérifier que le projet Android compile sans la clé : `cd android && ./gradlew assembleDebug` (JDK 21 dans `~/.local/share/android-jdk-21`, SDK dans `~/Android/Sdk`).
- Après une modification de `capacitor.config.ts` ou d'un greffon : `pnpm exec cap sync android`.

Crochets git dans `.githooks/` (activés par `pnpm install`) : `pnpm lint` et gitleaks à chaque commit, `pnpm test` et `pnpm test:e2e` à chaque poussée. Ne jamais les contourner.

## Règles (chargées automatiquement)

Les règles détaillées vivent dans `.claude/rules/` :

- `conventions.md` : 500 lignes par fichier, découpage par responsabilité, langue (métier en français), nommage, architecture, commits.
- `tests.md` : matrice de tests, barrière de qualité, pièges connus.
- `rythme-de-travail.md` : validation avant, captures pendant, tests ciblés, poussées par lot.
- `securite.md` : rien ne quitte le téléphone, HTML AELF assaini, secrets et clé Android hors dépôt.

## Organisation du code

- `src/recueil/` : textes sacrés figés (prières, mystères, fruits, passages par traduction dans `passages-aelf/`) et leur test d'empreinte.
- `src/chapelet/` : définition déclarative du chapelet, déroulé, série du jour, gestes, dessin, seuil, annonce, rotation des passages et mémoire locale (lectures, affichage, aide).
- `src/composants/` : composants partagés entre écrans (signal « Plus bas »).
- `src/ecrans/` : un écran par route ; routes déclarées dans `src/main.tsx`.
- `src/telephone/` : ce qui passe par les greffons Capacitor (vibrations, écran allumé) ; dans le navigateur, ils retombent sur les API web, espionnées par `e2e/telephone.spec.ts`.
- `android/` : projet Android généré par Capacitor puis retouché (icône, démarrage, signature, sauvegarde Google coupée) ; empreinte de la clé épinglée dans `android/empreinte-cle.txt`.
- `src/styles/jetons.css` : jetons de `docs/DESIGN.md` et polices auto-hébergées (paquets `@fontsource`).
- `e2e/` : parcours Playwright, un par phase au moins.
- `scripts/` : contrôles lancés par les commandes ci-dessus.

## Comment répondre au porteur du projet (règle non négociable)

Il lui faut ce qui change pour lui et ce qu'il doit décider, rien d'autre :

1. **Dix lignes par défaut.** Le détail ne vient que s'il le demande.
2. **Pas de chemins de fichiers, de noms de fonctions ni de commandes** dans le corps de la réponse, sauf s'il doit taper la commande lui-même ou si le nom sert à une décision qu'il prend.
3. **Dire l'effet, pas la mécanique** : « le chapelet reprend où tu l'avais laissé », pas « l'état est persisté en IndexedDB ».
4. **Pas de récit du chemin parcouru** : seul compte l'état d'arrivée, et ce qui a échoué s'il doit en tenir compte.
5. **Une question à la fois, puis attendre.** Ne jamais enchaîner sur une décision qui lui revient.

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
