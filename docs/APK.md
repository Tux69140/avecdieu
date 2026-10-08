# Mettre Avec Dieu sur le téléphone

Une page pour le porteur du projet. Les commandes se tapent dans un terminal ouvert dans le
dossier `Avec_Dieu/`.

## Une seule fois par téléphone : autoriser l'installation par câble

1. **Paramètres › A propos du téléphone** : toucher 7 fois **Numéro de build** (Samsung :
   dans **Informations sur le logiciel** ; Xiaomi : **Version de MIUI** ou **Version de
   HyperOS**). Le téléphone annonce que les options pour les développeurs sont activées.
2. **Options pour les développeurs** (Samsung : en bas des Paramètres ; Xiaomi :
   **Paramètres supplémentaires**) : activer **Débogage USB**.
3. **Xiaomi seulement** : activer aussi **Installer via USB** (le téléphone peut demander
   d'être connecté au compte Xiaomi, avec une carte SIM).
4. Brancher le téléphone à l'ordinateur. Sur son écran, accepter **Autoriser le débogage
   USB** (cocher « Toujours autoriser depuis cet ordinateur »).

## Une seule fois dans la vie de l'app : créer la clé de signature

Android n'accepte une mise à jour que signée par la même clé que l'app installée. Cette clé
se crée **une seule fois**, et ne se refait **jamais**.

1. Dans KeePassXC, créer l'entrée **« Avec Dieu — clé Android »** avec un mot de passe
   généré (lettres sans accent, chiffres et signes du clavier).
2. Lancer :
   ```bash
   scripts/creer-cle-android.sh
   ```
   Coller le mot de passe (Ctrl+Maj+V, rien ne s'affiche, c'est normal), Entrée, deux fois.
3. **Aussitôt** : joindre le fichier `~/.config/avecdieu/android.jks` à l'entrée KeePassXC
   (onglet Avancé, Pièces jointes). Le coffre est copié sur le stockage en ligne : c'est
   cette copie qui sauve l'app si l'ordinateur est perdu.

Le premier APK fabriqué enregistre l'empreinte de la clé dans le dépôt (rien de secret). Le
signaler à Claude, qui l'enregistre. Ensuite, toute autre clé est refusée.

## À chaque nouvelle version

1. **Fabriquer** (une à trois minutes) :
   ```bash
   pnpm apk
   ```
   Coller le mot de passe de la clé depuis KeePassXC, Entrée. Il est vérifié avant toute
   fabrication : en cas d'erreur, rien n'est perdu, il suffit de relancer.
2. **Installer**, téléphone branché (on peut brancher les deux à la fois) :
   ```bash
   pnpm apk:installer
   ```
   L'app est remplacée et s'ouvre. Le chapelet en cours et les réglages sont gardés.

## Si l'ordinateur est perdu ou changé

Récupérer le coffre KeePassXC depuis le stockage en ligne, enregistrer la pièce jointe
`android.jks` dans `~/.config/avecdieu/` (créer le dossier au besoin). La fabrication repart
comme avant. Ne **jamais** lancer `scripts/creer-cle-android.sh` dans ce cas : il le refuse
d'ailleurs, puisque le dépôt connaît déjà l'empreinte de la clé.

## Si l'installation est refusée

Le script dit pourquoi et ce qu'il faut faire. Il ne désinstalle jamais l'app de lui-même :
une désinstallation efface ce que l'app garde sur le téléphone.
