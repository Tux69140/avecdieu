package fr.biovibralyon.avecdieu;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import androidx.core.content.pm.ShortcutInfoCompat;
import androidx.core.content.pm.ShortcutManagerCompat;
import androidx.core.graphics.drawable.IconCompat;
import java.util.Arrays;
import java.util.List;

// Les raccourcis de l'icône de l'app (appui long) : « Prière du moment »,
// « Chapelet », « Rosaire » (demande du porteur du projet, 2026-10-09).
// Publiés à chaque démarrage, au nom du paquet qui tourne (l'APK d'essai a le
// sien) ; chacun rouvre l'app sur une adresse avecdieu://…, que l'app web
// traduit en écran (src/telephone/raccourcis.ts). Android 7.1 et plus.
final class Raccourcis {

    private Raccourcis() {}

    static void publier(Context contexte) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return;
        List<ShortcutInfoCompat> raccourcis = Arrays.asList(
            raccourci(contexte, "moment", "Prière du moment", R.drawable.raccourci_moment, 0),
            raccourci(contexte, "chapelet", "Chapelet", R.drawable.raccourci_chapelet, 1),
            raccourci(contexte, "rosaire", "Rosaire", R.drawable.raccourci_rosaire, 2)
        );
        try {
            ShortcutManagerCompat.setDynamicShortcuts(contexte, raccourcis);
        } catch (RuntimeException e) {
            // Un lanceur qui refuse les raccourcis : l'app s'ouvre comme avant.
        }
    }

    private static ShortcutInfoCompat raccourci(Context contexte, String id, String nom, int icone, int rang) {
        Intent ouvrir = new Intent(Intent.ACTION_VIEW, Uri.parse("avecdieu://" + id), contexte, MainActivity.class);
        ouvrir.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return new ShortcutInfoCompat.Builder(contexte, id)
            .setShortLabel(nom)
            .setLongLabel(nom)
            .setIcon(IconCompat.createWithResource(contexte, icone))
            .setIntent(ouvrir)
            .setRank(rang)
            .build();
    }
}
