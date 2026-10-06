#!/usr/bin/env bash
# Installe dist-apk/avec-dieu.apk sur chaque téléphone branché en USB, puis l'ouvre.
#
# Usage : pnpm apk:installer   (ou scripts/installer-apk.sh)
#
# L'installation remplace l'app en gardant ce qu'elle garde (chapelet en
# cours, réglages). Elle n'est jamais précédée d'une désinstallation, qui
# effacerait tout : si Android refuse, le script s'arrête et explique.
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck source=scripts/android-commun.sh
source scripts/android-commun.sh

[ -f "$APK" ] || arret "aucun APK à installer : le fabriquer d'abord (pnpm apk)."

mapfile -t PRETS < <("$ADB" devices | awk 'NR > 1 && $2 == "device" { print $1 }')
if "$ADB" devices | awk 'NR > 1 { print $2 }' | grep -q unauthorized; then
    echo "Un téléphone attend votre accord : sur son écran, accepter « Autoriser le débogage USB »."
fi
[ ${#PRETS[@]} -gt 0 ] || arret "aucun téléphone prêt. Le brancher en USB, débogage USB activé (voir docs/APK.md)."

ECHECS=0
for appareil in "${PRETS[@]}"; do
    modele=$("$ADB" -s "$appareil" shell getprop ro.product.model | tr -d '\r')
    echo "→ $modele ($appareil)"
    if sortie=$("$ADB" -s "$appareil" install -r "$APK" 2>&1); then
        "$ADB" -s "$appareil" shell am start -n "$IDENTIFIANT/.MainActivity" >/dev/null
        echo "  Installée et ouverte."
    else
        ECHECS=$((ECHECS + 1))
        case "$sortie" in
            *INSTALL_FAILED_UPDATE_INCOMPATIBLE*)
                echo "  Refusée : une app Avec Dieu signée d'une autre clé est déjà installée. La désinstaller"
                echo "  à la main depuis le téléphone (ce qu'elle garde sera perdu), puis relancer." ;;
            *INSTALL_FAILED_VERSION_DOWNGRADE*)
                echo "  Refusée : le téléphone a une version plus récente que cet APK. Refabriquer (pnpm apk)." ;;
            *INSTALL_FAILED_USER_RESTRICTED*|*"Install canceled by user"*)
                echo "  Refusée par le téléphone : sur un Xiaomi, activer « Installer via USB » dans les"
                echo "  options pour les développeurs, et accepter l'installation sur l'écran du téléphone." ;;
            *)
                echo "  Échec : $sortie" ;;
        esac
    fi
done
[ $ECHECS -eq 0 ] || exit 1
