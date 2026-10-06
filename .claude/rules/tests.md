# Tests — Avec Dieu

## Principe

Les tests s'écrivent **pendant** le développement, test d'abord (rouge, puis vert). Le porteur du
projet ne relit pas le code : la preuve qu'une chose marche, ce sont les tests verts et les
captures, jamais une affirmation.

## Matrice

| Code | Outil | Quand |
|---|---|---|
| Règle métier, calcul, transformation de données | Vitest (unitaire) | Chaque règle |
| Parcours d'écran (réciter, naviguer, lire un office) | Playwright | Chaque phase, au moins un |
| Accessibilité (contrastes, titres, ARIA) | axe-core dans Playwright (`e2e/accessibilite.spec.ts`) | Chaque nouvel écran |
| Textes sacrés | Test d'empreinte (`src/recueil/empreinte.test.ts`) | Toute retouche validée |
| Longueur des fichiers, style, types | `pnpm lint` | Chaque commit (crochet) |
| Secrets | gitleaks | Chaque commit (crochet) |

## Barrière de qualité (tout doit passer avant « terminé »)

1. `pnpm lint` ✓ (ESLint, Prettier, 500 lignes, types)
2. `pnpm test` ✓
3. `pnpm test:e2e` ✓
4. Captures d'écran des écrans touchés, montrées au porteur du projet
5. Validation du porteur du projet avant de cocher un critère dans `docs/PLAN.md`

## Prouver qu'un test teste

Un test vu vert sans avoir été vu rouge ne prouve rien. Pour un parcours écrit après coup, ou
dont le premier rouge venait d'autre chose (navigateur absent, serveur non démarré), casser
volontairement le code visé et vérifier que le test échoue, puis réparer.

## Pièges connus

- **`pnpm test -- <fichier>` ne filtre pas** : toute la suite tourne. Cibler avec
  `pnpm exec vitest run <fichier>` et vérifier l'en-tête (`Test Files 1 passed (1)`).
- **`waitForTimeout` est interdit dans `e2e/`** (règle ESLint) : un délai fixe expire trop tôt sur
  une machine chargée et trop tard sur une machine rapide. Attendre une condition (`expect`,
  `expect.poll`).
- **Une analyse ou une capture pendant une animation ment** : un texte en plein fondu n'a ni son
  contraste ni son aspect final. Attendre `document.getAnimations().length === 0`.
- **Une touche pressée avant que l'écran soit prêt est perdue** : vérifier d'abord que le
  premier contenu est affiché.
- **Une suite lancée sur une machine encombrée ment** : des échecs dispersés sans rapport entre
  eux après plusieurs lancements rapprochés font d'abord soupçonner les navigateurs de test
  restés ouverts, pas le code.
- **Les parcours tournent contre la version construite** (`vite preview`, port 4173) : c'est
  elle qui ira dans l'APK.

## Rythme

- Pendant une tâche : les tests des fichiers touchés, plus `pnpm lint`.
- La suite complète tourne une fois en fin de lot, et toujours avant de pousser (le crochet
  `pre-push` l'impose).
- Ne jamais attendre en boucle (`while … sleep`) : lancer en tâche de fond.
