package fr.biovibralyon.avecdieu;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Les greffons propres à l'app s'enregistrent avant le démarrage du pont.
        registerPlugin(Vibreur.class);
        registerPlugin(Sonnerie.class);
        super.onCreate(savedInstanceState);
        // Avant onStart : ses demandes d'autorisation doivent s'inscrire ici.
        getBridge().getWebView().setWebChromeClient(new ClientPosition(getBridge()));
    }
}
