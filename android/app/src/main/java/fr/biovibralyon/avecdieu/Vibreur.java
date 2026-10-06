package fr.biovibralyon.avecdieu;

import android.content.Context;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.VibrationAttributes;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Vibrations du chapelet. Le greffon Haptics de Capacitor vibre sans préciser
// d'usage : Android les range alors en « retour tactile » et les supprime quand
// la vibration au toucher est coupée (constaté sur HyperOS). Ces vibrations-ci
// sont voulues par le priant : elles suivent l'intensité « multimédia », qui
// reste active en mode silencieux.
@CapacitorPlugin(name = "Vibreur")
public class Vibreur extends Plugin {

    @PluginMethod
    public void vibrer(PluginCall call) {
        int duree = call.getInt("duree", 40);
        Vibrator vibreur = vibreur();
        if (vibreur == null || !vibreur.hasVibrator()) {
            call.resolve();
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            vibreur.vibrate(
                VibrationEffect.createOneShot(duree, VibrationEffect.DEFAULT_AMPLITUDE),
                new VibrationAttributes.Builder().setUsage(VibrationAttributes.USAGE_MEDIA).build()
            );
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrerAncien(vibreur, VibrationEffect.createOneShot(duree, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            vibrerTresAncien(vibreur, duree);
        }
        call.resolve();
    }

    @SuppressWarnings("deprecation")
    private void vibrerAncien(Vibrator vibreur, VibrationEffect effet) {
        AudioAttributes usage = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).build();
        vibreur.vibrate(effet, usage);
    }

    @SuppressWarnings("deprecation")
    private void vibrerTresAncien(Vibrator vibreur, int duree) {
        vibreur.vibrate(duree);
    }

    @SuppressWarnings("deprecation")
    private Vibrator vibreur() {
        Context contexte = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager gestionnaire = (VibratorManager) contexte.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return gestionnaire == null ? null : gestionnaire.getDefaultVibrator();
        }
        return (Vibrator) contexte.getSystemService(Context.VIBRATOR_SERVICE);
    }
}
