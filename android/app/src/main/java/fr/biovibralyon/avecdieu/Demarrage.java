package fr.biovibralyon.avecdieu;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Le premier écran de l'app est dessiné (src/telephone/demarrage.ts) : l'écran
// de démarrage d'Android, gardé jusque-là par MainActivity, peut s'effacer.
@CapacitorPlugin(name = "Demarrage")
public class Demarrage extends Plugin {

    static volatile boolean affiche = false;

    @PluginMethod
    public void pret(PluginCall call) {
        affiche = true;
        call.resolve();
    }
}
