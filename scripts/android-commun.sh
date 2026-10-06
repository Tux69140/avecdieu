# Réglages communs aux scripts Android. À charger par `source`, depuis la racine du dépôt.

arret() { echo "ERREUR : $*" >&2; exit 1; }

export JAVA_HOME=${JAVA_HOME:-$HOME/.local/share/android-jdk-21}
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Android/Sdk}
[ -x "$JAVA_HOME/bin/keytool" ] || arret "Java introuvable (JAVA_HOME=$JAVA_HOME)."
[ -d "$ANDROID_HOME/platform-tools" ] || arret "SDK Android introuvable (ANDROID_HOME=$ANDROID_HOME)."
KEYTOOL=$JAVA_HOME/bin/keytool
ADB=$ANDROID_HOME/platform-tools/adb

# La clé vit hors du dépôt. La perdre, c'est ne plus pouvoir mettre à jour
# l'app installée : Android n'accepte une mise à jour que signée par la même clé.
CLE=$HOME/.config/avecdieu/android.jks
ALIAS=avecdieu
# Empreinte publique du certificat de la vraie clé, épinglée au premier APK.
EMPREINTE_FICHIER=android/empreinte-cle.txt
APK=dist-apk/avec-dieu.apk
IDENTIFIANT=fr.biovibralyon.avecdieu

# Demande le mot de passe de la clé une fois, sans écho, dans AVECDIEU_CLE_MDP.
demander_mot_de_passe() {
    IFS= read -rsp "${1:-Mot de passe de la clé Android : }" AVECDIEU_CLE_MDP; echo
    # printf est une commande interne : le mot de passe n'apparaît dans aucune liste de processus.
    if printf '%s' "$AVECDIEU_CLE_MDP" | LC_ALL=C grep -q '[^ -~]'; then
        arret "le mot de passe contient un caractère non ASCII (accent…) : la clé n'en accepte pas."
    fi
    [ ${#AVECDIEU_CLE_MDP} -ge 8 ] || arret "mot de passe trop court (8 caractères au moins)."
    export AVECDIEU_CLE_MDP
}

# Chemin d'apksigner, dans les build-tools les plus récents.
trouver_apksigner() {
    local candidat
    candidat=$(find "$ANDROID_HOME/build-tools" -mindepth 2 -maxdepth 2 -name apksigner -type f | sort -V | tail -n1)
    [ -n "$candidat" ] || arret "apksigner introuvable dans $ANDROID_HOME/build-tools."
    printf '%s' "$candidat"
}
