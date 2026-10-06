# Product

Synthèse stratégique tirée de `docs/PRD.md` et `docs/DESIGN.md`, qui font foi.

## Register

product

## Users

Un laïc catholique francophone pratiquant, en France, qui prie seul ou en famille sur son téléphone
Android, souvent le soir, parfois sans réseau. Il connaît par cœur les prières courantes du
chapelet, mais pas toutes les rubriques de l'office : il compte sur l'app pour lui dire quoi dire,
quoi répéter et quel mystère méditer. Le porteur du projet est l'utilisateur de référence.

## Product Purpose

Guider la liturgie des heures (textes AELF reconstitués selon les rubriques) et le chapelet marial,
grain par grain, hors-ligne, avec des rappels. Réussir, c'est prier sans chercher : ouvrir l'app et
dire l'office ou le chapelet du jour, complets et justes, sans livret ni calcul de rubriques.

## Brand Personality

Recueilli, chaleureux, juste. Un « bréviaire de poche » : un objet de prière qu'on ouvre, plus
proche d'un livre liturgique que d'un outil. Une voix d'aujourd'hui (les titres) posée sur une voix
séculaire (les rubriques et le texte).

## Anti-references

- Les apps de prière à flux et à notifications qui sollicitent : badges, séries, gamification.
- Les interfaces d'outil : tableaux de bord, cartes empilées, icônes partout.
- L'imagerie pieuse décorative : photos, illustrations, dégradés. Le texte sacré est l'ornement.

## Design Principles

1. Prier d'abord : chaque écran sert la prière en cours, rien ne distrait du texte.
2. Un geste simple : toucher avance, glisser revient ; les choix arrivent avant ou après la prière,
   jamais au milieu.
3. Le livre, pas l'outil : une colonne de lecture, des filets, des rubriques rouges ; aucun gadget.
4. Fidélité aux textes : aucun texte sacré n'est reformulé ni affiché sans validation.
5. Hors-ligne et discret : rien ne quitte le téléphone.

## Accessibility & Inclusion

WCAG 2.1 AA, vérifié par axe-core sur chaque écran. Cibles tactiles de 48 px au moins ; texte de
prière à 18 px. Thème nuit pour la pénombre. Les animations sont coupées quand Android le demande.
