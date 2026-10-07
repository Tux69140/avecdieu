package fr.biovibralyon.avecdieu;

import android.app.ActivityManager;
import android.app.AppOpsManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.PowerManager;
import android.os.Process;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

// Le son des rappels et les réglages d'Android qui les laissent passer. Depuis
// Android 8, le son et la vibration appartiennent au canal de notification, pas
// à la notification, et un canal ne change plus une fois créé : l'app crée un
// canal par combinaison (son, vibreur), nommée par l'app web (préfixe « rappel- »).
@CapacitorPlugin(name = "Sonnerie")
public class Sonnerie extends Plugin {

    private static final String PREFIXE = "rappel-";
    private static final List<String> CLOCHES = Arrays.asList("bourdon_notre_dame", "cloche_marcel", "angelus_village");
    // Où le MP3 choisi est rangé : parmi les sons de notification du téléphone,
    // que le système a le droit de lire (un fichier propre à l'app, il ne le peut pas).
    private static final String DOSSIER = Environment.DIRECTORY_NOTIFICATIONS + "/Avec Dieu";

    private Ringtone ecoute;

    @PluginMethod
    public void creerCanal(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            call.resolve();
            return;
        }
        String id = call.getString("id", "");
        if (!id.startsWith(PREFIXE)) {
            call.reject("Identifiant de canal inattendu : " + id);
            return;
        }
        Uri son = uriDuSon(call.getObject("son"));
        if (son == null) {
            call.reject("Son introuvable");
            return;
        }
        NotificationChannel canal = new NotificationChannel(id, call.getString("nom", id), NotificationManager.IMPORTANCE_HIGH);
        AudioAttributes usage = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        canal.setSound(son, usage);
        boolean vibreur = Boolean.TRUE.equals(call.getBoolean("vibreur", true));
        canal.enableVibration(vibreur);
        if (vibreur) canal.setVibrationPattern(new long[] { 0, 400, 200, 400 });
        canal.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
        gestionnaire().createNotificationChannel(canal);
        call.resolve();
    }

    @PluginMethod
    public void supprimerCanaux(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            call.resolve();
            return;
        }
        List<String> garder;
        try {
            garder = call.getArray("garder").toList();
        } catch (Exception e) {
            call.reject("Liste « garder » illisible");
            return;
        }
        NotificationManager gestionnaire = gestionnaire();
        for (NotificationChannel canal : gestionnaire.getNotificationChannels()) {
            String id = canal.getId();
            if (id.startsWith(PREFIXE) && !garder.contains(id)) gestionnaire.deleteNotificationChannel(id);
        }
        call.resolve();
    }

    @PluginMethod
    public void choisirMp3(PluginCall call) {
        Intent choix = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        choix.addCategory(Intent.CATEGORY_OPENABLE);
        choix.setType("audio/*");
        startActivityForResult(call, choix, "mp3Choisi");
    }

    @ActivityCallback
    private void mp3Choisi(PluginCall call, ActivityResult resultat) {
        Intent donnees = resultat.getData();
        if (resultat.getResultCode() != android.app.Activity.RESULT_OK || donnees == null || donnees.getData() == null) {
            call.resolve(new JSObject());
            return;
        }
        Uri source = donnees.getData();
        String nom = nomAffiche(source);
        try {
            Uri copie = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ? copierDansMediaStore(source, nom) : copierDansFichiers(source, nom);
            JSObject reponse = new JSObject();
            reponse.put("uri", copie.toString());
            reponse.put("nom", nom.replaceFirst("\\.[^.]+$", ""));
            call.resolve(reponse);
        } catch (Exception e) {
            call.reject("Le fichier n’a pas pu être copié", e);
        }
    }

    @PluginMethod
    public void ecouter(PluginCall call) {
        arreter();
        Uri son = uriDuSon(call.getObject("son"));
        if (son == null) {
            call.reject("Son introuvable");
            return;
        }
        ecoute = RingtoneManager.getRingtone(getContext(), son);
        if (ecoute != null) ecoute.play();
        call.resolve();
    }

    @PluginMethod
    public void arreterEcoute(PluginCall call) {
        arreter();
        call.resolve();
    }

    // Redmi et POCO sont des Xiaomi : même surcouche, mêmes économies de batterie.
    @PluginMethod
    public void fabricant(PluginCall call) {
        String marque = Build.MANUFACTURER == null ? "" : Build.MANUFACTURER.toLowerCase(Locale.ROOT);
        String fabricant = "autre";
        if (marque.contains("xiaomi") || marque.contains("redmi") || marque.contains("poco")) fabricant = "xiaomi";
        else if (marque.contains("samsung")) fabricant = "samsung";
        JSObject reponse = new JSObject();
        reponse.put("fabricant", fabricant);
        call.resolve(reponse);
    }

    // Sur Xiaomi comme sur Samsung, la fiche de l'app réunit la batterie et,
    // chez Xiaomi, le démarrage automatique.
    @PluginMethod
    public void ouvrirFicheApp(PluginCall call) {
        Intent fiche = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName()));
        ouvrir(call, fiche);
    }

    // Ce qui empêche un rappel d'arriver alors que les notifications sont
    // accordées : l'économie de batterie (Xiaomi « Aucune restriction »,
    // Samsung « Non restreinte »), la restriction de l'arrière-plan, et chez
    // Xiaomi le démarrage automatique, faute duquel l'app fermée n'est plus
    // réveillée par son alarme (vu le 2026-10-07 : « proc frequent died »).
    @PluginMethod
    public void blocages(PluginCall call) {
        Context contexte = getContext();
        String paquet = contexte.getPackageName();
        PowerManager energie = (PowerManager) contexte.getSystemService(Context.POWER_SERVICE);
        ActivityManager activites = (ActivityManager) contexte.getSystemService(Context.ACTIVITY_SERVICE);
        JSObject reponse = new JSObject();
        reponse.put("batterie", energie != null && !energie.isIgnoringBatteryOptimizations(paquet));
        reponse.put("arrierePlan", Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && activites != null && activites.isBackgroundRestricted());
        Boolean demarrage = demarrageAutomatique();
        if (demarrage != null) reponse.put("demarrage", !demarrage);
        call.resolve(reponse);
    }

    // La page « Démarrage automatique » de Xiaomi, qui n'est pas dans la fiche
    // de l'app sous HyperOS ; à défaut, la fiche de l'app.
    @PluginMethod
    public void ouvrirDemarrageAutomatique(PluginCall call) {
        Intent page = new Intent();
        page.setClassName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity");
        page.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(page);
            call.resolve();
        } catch (Exception e) {
            ouvrirFicheApp(call);
        }
    }

    // Le démarrage automatique de Xiaomi : l'opération 10008 de sa surcouche,
    // absente des API d'Android, donc lue par réflexion. Rien (null) hors de
    // Xiaomi ou si la lecture échoue : on ne prévient pas sans savoir.
    private Boolean demarrageAutomatique() {
        String marque = Build.MANUFACTURER == null ? "" : Build.MANUFACTURER.toLowerCase(Locale.ROOT);
        if (!(marque.contains("xiaomi") || marque.contains("redmi") || marque.contains("poco"))) return null;
        try {
            AppOpsManager operations = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
            Method lire = AppOpsManager.class.getMethod("checkOpNoThrow", int.class, int.class, String.class);
            int mode = (Integer) lire.invoke(operations, 10008, Process.myUid(), getContext().getPackageName());
            return mode == AppOpsManager.MODE_ALLOWED;
        } catch (Exception e) {
            return null;
        }
    }

    @PluginMethod
    public void ouvrirReglagesNotifications(PluginCall call) {
        Intent reglages;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reglages = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            reglages.putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
        } else {
            reglages = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName()));
        }
        ouvrir(call, reglages);
    }

    private void ouvrir(PluginCall call, Intent intention) {
        intention.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intention);
            call.resolve();
        } catch (Exception e) {
            call.reject("Page des réglages introuvable", e);
        }
    }

    private void arreter() {
        if (ecoute != null && ecoute.isPlaying()) ecoute.stop();
        ecoute = null;
    }

    private NotificationManager gestionnaire() {
        return (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
    }

    private Uri uriDuSon(JSObject son) {
        if (son == null) return null;
        String sorte = son.getString("sorte", "");
        switch (sorte) {
            case "telephone":
                return Settings.System.DEFAULT_NOTIFICATION_URI;
            case "cloche": {
                String cloche = son.getString("cloche", "");
                if (!CLOCHES.contains(cloche)) return null;
                return Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getContext().getPackageName() + "/raw/" + cloche);
            }
            case "mp3": {
                String uri = son.getString("uri", "");
                return uri.isEmpty() ? null : Uri.parse(uri);
            }
            default:
                return null;
        }
    }

    private String nomAffiche(Uri source) {
        try (Cursor curseur = getContext().getContentResolver().query(source, new String[] { OpenableColumns.DISPLAY_NAME }, null, null, null)) {
            if (curseur != null && curseur.moveToFirst()) {
                String nom = curseur.getString(0);
                if (nom != null && !nom.isEmpty()) return nom;
            }
        } catch (Exception ignore) {}
        return "son.mp3";
    }

    // Android 10 et plus : rangé parmi les sons de notification ; un même nom
    // déjà copié est repris plutôt que dupliqué.
    private Uri copierDansMediaStore(Uri source, String nom) throws Exception {
        ContentResolver resolveur = getContext().getContentResolver();
        Uri collection = MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
        String[] colonnes = { MediaStore.Audio.Media._ID };
        String filtre = MediaStore.Audio.Media.DISPLAY_NAME + "=? AND " + MediaStore.Audio.Media.RELATIVE_PATH + "=?";
        try (Cursor curseur = resolveur.query(collection, colonnes, filtre, new String[] { nom, DOSSIER + "/" }, null)) {
            if (curseur != null && curseur.moveToFirst()) {
                return Uri.withAppendedPath(collection, String.valueOf(curseur.getLong(0)));
            }
        }
        ContentValues valeurs = new ContentValues();
        valeurs.put(MediaStore.Audio.Media.DISPLAY_NAME, nom);
        valeurs.put(MediaStore.Audio.Media.MIME_TYPE, resolveur.getType(source) == null ? "audio/mpeg" : resolveur.getType(source));
        valeurs.put(MediaStore.Audio.Media.RELATIVE_PATH, DOSSIER);
        valeurs.put(MediaStore.Audio.Media.IS_NOTIFICATION, 1);
        valeurs.put(MediaStore.Audio.Media.IS_PENDING, 1);
        Uri copie = resolveur.insert(collection, valeurs);
        if (copie == null) throw new IllegalStateException("Insertion refusée");
        try (InputStream entree = resolveur.openInputStream(source); OutputStream sortie = resolveur.openOutputStream(copie)) {
            recopier(entree, sortie);
        } catch (Exception e) {
            resolveur.delete(copie, null, null);
            throw e;
        }
        valeurs.clear();
        valeurs.put(MediaStore.Audio.Media.IS_PENDING, 0);
        resolveur.update(copie, valeurs, null, null);
        return copie;
    }

    // Avant Android 10 : dans les fichiers de l'app, prêtés au système qui joue les notifications.
    private Uri copierDansFichiers(Uri source, String nom) throws Exception {
        File dossier = new File(getContext().getFilesDir(), "sons");
        if (!dossier.exists() && !dossier.mkdirs()) throw new IllegalStateException("Dossier des sons impossible");
        File cible = new File(dossier, nom.replaceAll("[^\\w.\\- ]", "_"));
        try (InputStream entree = getContext().getContentResolver().openInputStream(source); OutputStream sortie = new FileOutputStream(cible)) {
            recopier(entree, sortie);
        }
        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", cible);
        getContext().grantUriPermission("com.android.systemui", uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    }

    private static void recopier(InputStream entree, OutputStream sortie) throws Exception {
        if (entree == null || sortie == null) throw new IllegalStateException("Flux indisponible");
        byte[] tampon = new byte[64 * 1024];
        int lus;
        while ((lus = entree.read(tampon)) != -1) sortie.write(tampon, 0, lus);
    }
}
