# Sécurité et vie privée — Avec Dieu

- **Rien ne quitte le téléphone** (PRD) : aucune requête réseau hors l'API AELF, aucune mesure
  d'audience, aucune police ni script chargé d'un autre site. Le parcours du chapelet vérifie
  qu'aucune requête ne sort de l'app.
- **La position** (phase 12) ne quitte jamais le téléphone, et n'est jamais écrite dans un journal.
- **Aucun HTML AELF brut n'atteint l'écran** : il est assaini par le module frontière (phase 5),
  jamais injecté tel quel (`dangerouslySetInnerHTML` interdit hors de ce module).
- **Secrets hors dépôt** : la clé de signature Android (`.jks`/`.keystore`) et ses mots de passe
  vivent hors du dépôt (phase 2). gitleaks bloque le commit qui en contiendrait (`.gitleaks.toml`).
- **Clé de signature : jamais régénérée après la première installation** — Android n'accepte une
  mise à jour que signée par la même clé.
- **Droits d'auteur AELF** : usage personnel seulement tant que l'AELF n'a pas donné son accord
  écrit ; rien de public (hébergement, Play Store) avant.
