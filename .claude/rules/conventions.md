# Conventions de code — Avec Dieu

## Taille et découpage

- **500 lignes au plus par fichier de code** (`.ts`, `.tsx`, `.js`, `.mjs`, `.css`). Les tests
  (`*.test.ts(x)`, `e2e/`) en sont exemptés. Contrôlé par `scripts/verifier-longueurs.mjs`,
  lancé par `pnpm lint`, donc bloquant au commit.
- Approcher la limite est un signal : découper **par responsabilité** (un module = une idée),
  pas en coupant un fichier en deux moitiés arbitraires. Un composant React qui grossit cède ses
  calculs à un module pur testable (exemple : `chapelet/disposition.ts` hors de `ChapeletDessine.tsx`).
- Une fonction se lit sans faire défiler l'écran ; au-delà, extraire.

## Langue

- **Vocabulaire métier en français, partout** : chapelet, dizaine, grain, mystère, prière, office,
  rubrique, antienne, strophe… (`derouler`, `serieDuJour`, `ChapeletDessine`). C'est la langue
  du porteur du projet et des textes liturgiques.
- **Plomberie technique en anglais** quand c'est l'idiome (`useEffect`, `onPointerDown`, `props`).
- **Interdit : mélanger les deux langues pour le même genre de nom dans un fichier.** Suivre le
  fichier où l'on écrit. Aucune campagne de renommage.
- Libellés d'écran en français avec tous les accents et l'apostrophe typographique `’`.
- Commentaires en français, denses comme ceux du voisinage : ils disent **pourquoi**, pas quoi.

## Nommage

| Contexte | Style | Exemple |
|---|---|---|
| Composant React | PascalCase, un par fichier | `ChapeletDessine.tsx` |
| Écran (une route) | `Ecran` + nom, dans `src/ecrans/` | `EcranChapelet.tsx` |
| Fonction, hook | camelCase | `classerGeste()` |
| Constante de module | MAJUSCULES | `CHAPELET_MARIAL` |
| Type, interface | PascalCase | `DefinitionChapelet` |
| CSS | fichier à côté du composant, classes en kebab-case | `.priere-tete` |

## Architecture

- **Logique pure hors des composants** : règles, calculs et données vivent dans des modules
  sans React, testés par Vitest. Les composants affichent et relaient les gestes.
- **Textes sacrés seulement dans `src/recueil/`**, jamais en dur dans un composant ; toute
  retouche passe par la validation du porteur du projet et le test d'empreinte.
- **Un seul module parle à l'API AELF** (phase 5) ; le reste de l'app ne voit que les modèles
  `Office` et `JourLiturgique`.
- **Couleurs, espacements, polices : uniquement par les jetons** de `src/styles/jetons.css`
  (`var(--rubrique)`…), jamais de valeur en dur dans un composant. Le rouge est réservé aux rubriques.
- Pas de dépendance nouvelle sans besoin réel : chaque paquet est une surface à maintenir.

## Style

- Prettier (`.prettierrc`) et ESLint (`eslint.config.js`) font foi ; `pnpm lint:fix` corrige.
- TypeScript en mode strict ; pas de `any`, pas de `@ts-ignore` sans commentaire qui le justifie.

## Commits

- Conventional Commits en français : `feat|fix|docs|refactor|test|chore(portée): message`.
- Un commit par changement cohérent, jamais par retouche minuscule.
- Les crochets `.githooks/` tournent seuls (installés par `pnpm install`) : lint et secrets au
  commit, suite complète à la poussée. Ne jamais les contourner (`--no-verify`).
