package fr.biovibralyon.avecdieu;

import android.os.Bundle;
import android.os.SystemClock;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.splashscreen.SplashScreenViewProvider;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Au-delà, l'écran de démarrage s'efface même sans nouvelles de la page.
    private static final long ATTENTE_MAX = 4000;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // L'écran de démarrage reste jusqu'au premier écran de l'app, puis
        // s'efface d'un coup, sans fondu ni parchemin vide entre les deux
        // (choix du porteur du projet, 2026-10-20).
        SplashScreen demarrage = SplashScreen.installSplashScreen(this);
        Demarrage.affiche = false;
        long debut = SystemClock.uptimeMillis();
        demarrage.setKeepOnScreenCondition(
            () -> !Demarrage.affiche && SystemClock.uptimeMillis() - debut < ATTENTE_MAX
        );
        demarrage.setOnExitAnimationListener(SplashScreenViewProvider::remove);
        // Les greffons propres à l'app s'enregistrent avant le démarrage du pont.
        registerPlugin(Vibreur.class);
        registerPlugin(Sonnerie.class);
        registerPlugin(Position.class);
        registerPlugin(Demarrage.class);
        super.onCreate(savedInstanceState);
        Raccourcis.publier(this);
    }
}
