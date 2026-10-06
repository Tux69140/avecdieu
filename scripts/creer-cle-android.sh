#!/usr/bin/env bash
# Crée la clé de signature Android, UNE SEULE FOIS dans la vie de l'app.
#
# Usage : scripts/creer-cle-android.sh
#
# La clé est écrite dans ~/.config/avecdieu/android.jks, hors du dépôt. Le
# script refuse d'écraser une clé existante : une clé neuve obligerait à
# désinstaller l'app du téléphone, et donc à perdre ce qu'elle garde.
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck source=scripts/android-commun.sh
source scripts/android-commun.sh

[ ! -e "$CLE" ] || arret "une clé existe déjà ($CLE). Ne JAMAIS la refaire : la garder, et sa copie dans KeePassXC."
[ ! -f "$EMPREINTE_FICHIER" ] ||
    arret "le dépôt connaît déjà une clé ($EMPREINTE_FICHIER) : récupérer android.jks depuis KeePassXC au lieu d'en créer une."

echo "Choisir le mot de passe dans KeePassXC (entrée « Avec Dieu — clé Android »),"
echo "lettres sans accent, chiffres et signes du clavier seulement, puis le coller ici (Ctrl+Maj+V)."
demander_mot_de_passe "Mot de passe de la nouvelle clé : "
IFS= read -rsp "Le même, une seconde fois : " CONFIRMATION; echo
[ "$CONFIRMATION" = "$AVECDIEU_CLE_MDP" ] || arret "les deux mots de passe diffèrent. Rien n'a été créé."
unset CONFIRMATION

mkdir -p "$(dirname "$CLE")"
chmod 700 "$(dirname "$CLE")"
# PKCS12 : un seul mot de passe pour le coffre et la clé. Validité de 100 ans,
# bien au-delà de ce qu'exige le Play Store.
"$KEYTOOL" -genkeypair -keystore "$CLE" -storetype PKCS12 -alias "$ALIAS" \
    -keyalg RSA -keysize 4096 -validity 36500 \
    -dname "CN=Avec Dieu, O=Biovibralyon, C=FR" \
    -storepass:env AVECDIEU_CLE_MDP -keypass:env AVECDIEU_CLE_MDP >/dev/null
chmod 600 "$CLE"
unset AVECDIEU_CLE_MDP

echo
echo "Clé créée : $CLE"
echo "À FAIRE MAINTENANT : joindre ce fichier à l'entrée KeePassXC « Avec Dieu — clé Android »"
echo "(onglet Avancé, Pièces jointes), à côté du mot de passe. Sans cette copie, une"
echo "machine perdue = plus aucune mise à jour possible de l'app installée."
