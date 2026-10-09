package fr.biovibralyon.avecdieu;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Les greffons propres à l'app s'enregistrent avant le démarrage du pont.
        registerPlugin(Vibreur.class);
        registerPlugin(Sonnerie.class);
        registerPlugin(Position.class);
        super.onCreate(savedInstanceState);
        Raccourcis.publier(this);
    }
}
