package fr.biovibralyon.avecdieu;

import android.Manifest;
import android.content.pm.PackageManager;
import android.webkit.GeolocationPermissions;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;

// La position demandée à Android pour les heures solaires : l'approximative
// seule. Capacitor demande la précise avec, que le manifeste ne déclare pas
// (elle n'est jamais utile au soleil) : Android 7 à 11 refusaient alors tout
// (tablette du porteur du projet, 2026-10-09).
public class ClientPosition extends BridgeWebChromeClient {

    private final Bridge pont;
    private final ActivityResultLauncher<String> demande;
    private GeolocationPermissions.Callback enAttente;
    private String origineEnAttente;

    public ClientPosition(Bridge pont) {
        super(pont);
        this.pont = pont;
        demande = pont.registerForActivityResult(new ActivityResultContracts.RequestPermission(), this::repondre);
    }

    @Override
    public void onGeolocationPermissionsShowPrompt(String origine, GeolocationPermissions.Callback rappel) {
        if (accordee()) {
            rappel.invoke(origine, true, false);
            return;
        }
        enAttente = rappel;
        origineEnAttente = origine;
        demande.launch(Manifest.permission.ACCESS_COARSE_LOCATION);
    }

    private void repondre(boolean accordee) {
        if (enAttente == null) return;
        enAttente.invoke(origineEnAttente, accordee, false);
        enAttente = null;
        origineEnAttente = null;
    }

    private boolean accordee() {
        return ContextCompat.checkSelfPermission(pont.getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
}
