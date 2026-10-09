#!/usr/bin/env bash
# Fabrique l'APK signé d'Avec Dieu, prêt à installer : dist-apk/avec-dieu.apk.
#
# Usage : pnpm apk   (ou scripts/fabriquer-apk.sh)
#
# Le mot de passe de la clé est demandé une fois, sans écho, vérifié AVANT la
# fabrication, puis transmis à Gradle par l'environnement seulement. La clé
# doit être celle dont l'empreinte est épinglée dans le dépôt : un APK signé
# d'une autre clé serait refusé en mise à jour par le téléphone.
set -euo pipefail
shopt -s inherit_errexit
unset AVECDIEU_CLE AVECDIEU_CLE_MDP
cd "$(dirname "$0")/.."
# shellcheck source=scripts/android-commun.sh
source scripts/android-commun.sh

[ -f "$CLE" ] || arret "clé Android introuvable : $CLE. Première fois : scripts/creer-cle-android.sh. \
Sinon, la recopier depuis KeePassXC (pièce jointe android.jks)."
APKSIGNER=$(trouver_apksigner)

trap 'unset AVECDIEU_CLE_MDP' EXIT
demander_mot_de_passe
"$KEYTOOL" -list -keystore "$CLE" -alias "$ALIAS" -storepass:env AVECDIEU_CLE_MDP >/dev/null 2>&1 ||
    arret "ce mot de passe n'ouvre pas la clé $CLE. Recopier celui de KeePassXC. Rien n'a été fabriqué."
EMPREINTE=$("$KEYTOOL" -exportcert -keystore "$CLE" -alias "$ALIAS" -storepass:env AVECDIEU_CLE_MDP 2>/dev/null |
    sha256sum | cut -d' ' -f1)
echo "Clé Android ouverte."

if [ -f "$EMPREINTE_FICHIER" ]; then
    EPINGLEE=$(grep -E '^[0-9a-f]{64}$' "$EMPREINTE_FICHIER" || true)
    [ "$EPINGLEE" = "$EMPREINTE" ] ||
        arret "cette clé n'est PAS celle d'Avec Dieu (empreinte $EMPREINTE, attendue $EPINGLEE). Rien n'a été fabriqué."
else
    printf '# SHA-256 du certificat de la clé de signature Android (public, pas un secret).\n%s\n' \
        "$EMPREINTE" > "$EMPREINTE_FICHIER"
    echo "Empreinte de la clé épinglée dans $EMPREINTE_FICHIER (premier APK) : à committer."
fi

# Le numéro de version croît à chaque commit : chaque APK remplace le précédent.
VERSION_CODE=$(git rev-list --count HEAD)
VERSION_NOM=$(node -p "require('./package.json').version")

# Seul Gradle a besoin du mot de passe : la construction web et ses greffons
# (Vite, Capacitor, dépendances) ne le voient pas dans leur environnement.
env -u AVECDIEU_CLE_MDP pnpm build
env -u AVECDIEU_CLE_MDP pnpm exec cap sync android
rm -f android/app/build/outputs/apk/release/*.apk
(
    cd android
    AVECDIEU_CLE=$CLE ./gradlew assembleRelease --console=plain --quiet \
        -PversionCode="$VERSION_CODE" -PversionName="$VERSION_NOM"
)
unset AVECDIEU_CLE_MDP

SORTIE_GRADLE=android/app/build/outputs/apk/release/app-release.apk
[ -f "$SORTIE_GRADLE" ] || arret "APK absent après fabrication : $SORTIE_GRADLE"
SIGNATURE=$("$APKSIGNER" verify --print-certs "$SORTIE_GRADLE" 2>&1) || arret "APK non signé ou signature invalide."
grep -q "certificate SHA-256 digest: $EMPREINTE" <<<"$SIGNATURE" || arret "l'APK n'est pas signé par la clé d'Avec Dieu."

mkdir -p "$(dirname "$APK")"
cp "$SORTIE_GRADLE" "$APK"
echo
echo "APK prêt : $APK (version $VERSION_NOM, n° $VERSION_CODE)."
echo "Brancher le téléphone en USB, puis : pnpm apk:installer"
