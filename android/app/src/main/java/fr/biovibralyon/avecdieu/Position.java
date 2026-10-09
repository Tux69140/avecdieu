package fr.biovibralyon.avecdieu;

import android.Manifest;
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.LinkedHashSet;
import java.util.Set;

// La position des heures solaires, approximative seule. La géolocalisation de
// la WebView ne convenait pas : Capacitor y demande aussi la précise, que le
// manifeste ne déclare pas (Android 7 à 11 refusaient tout), et la WebView
// attend une position neuve qu'Android 7 peut tarder des minutes à fournir
// en approximatif, sans regarder la dernière connue (tablette du porteur du
// projet, 2026-10-09). La position ne quitte jamais le téléphone et n'est
// jamais écrite dans un journal.
@CapacitorPlugin(
    name = "Position",
    permissions = { @Permission(alias = Position.AUTORISATION, strings = { Manifest.permission.ACCESS_COARSE_LOCATION }) }
)
public class Position extends Plugin {

    static final String AUTORISATION = "position";
    // Une position de moins de dix minutes suffit : le soleil ne bouge pas si vite.
    private static final long RECENTE_MS = 10 * 60 * 1000;
    // Faute de position neuve, la dernière connue sert si elle a moins de six heures.
    private static final long ANCIENNE_MS = 6 * 60 * 60 * 1000;
    private static final long ATTENTE_MS = 20 * 1000;

    @PluginMethod
    public void localiser(PluginCall call) {
        if (getPermissionState(AUTORISATION) == PermissionState.GRANTED) chercher(call);
        else requestPermissionForAlias(AUTORISATION, call, "apresAutorisation");
    }

    @PermissionCallback
    private void apresAutorisation(PluginCall call) {
        if (getPermissionState(AUTORISATION) == PermissionState.GRANTED) chercher(call);
        else repondre(call, "refusee", null);
    }

    private void chercher(PluginCall call) {
        LocationManager gestionnaire = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (gestionnaire == null) {
            repondre(call, "introuvable", null);
            return;
        }
        Location derniere = derniereConnue(gestionnaire);
        if (derniere != null && age(derniere) <= RECENTE_MS) {
            repondre(call, "trouvee", derniere);
            return;
        }
        // Le réseau (Wi-Fi, antennes) est la seule source que l'approximative
        // ouvre ; le GPS seul exige la précise.
        if (!gestionnaire.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
            repondre(call, ageAcceptable(derniere) ? "trouvee" : "introuvable", derniere);
            return;
        }
        Handler fil = new Handler(Looper.getMainLooper());
        Ecoute ecoute = new Ecoute(gestionnaire, fil, call, derniere);
        try {
            gestionnaire.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, ecoute, Looper.getMainLooper());
            fil.postDelayed(ecoute::expirer, ATTENTE_MS);
        } catch (SecurityException | IllegalArgumentException e) {
            ecoute.expirer();
        }
    }

    // La source « fused » garde souvent la plus récente, mais Android 7 ne la
    // cite pas parmi les sources actives : elle est interrogée en plus.
    private static Location derniereConnue(LocationManager gestionnaire) {
        Set<String> sources = new LinkedHashSet<>(gestionnaire.getProviders(true));
        sources.add("fused");
        Location meilleure = null;
        for (String source : sources) {
            try {
                Location position = gestionnaire.getLastKnownLocation(source);
                if (position != null && (meilleure == null || age(position) < age(meilleure))) meilleure = position;
            } catch (SecurityException | IllegalArgumentException ignore) {
                // Le GPS, réservé à la précise, ou une source absente du téléphone.
            }
        }
        return meilleure;
    }

    private static long age(Location position) {
        return (SystemClock.elapsedRealtimeNanos() - position.getElapsedRealtimeNanos()) / 1_000_000;
    }

    private static boolean ageAcceptable(Location position) {
        return position != null && age(position) <= ANCIENNE_MS;
    }

    private static void repondre(PluginCall call, String sorte, Location position) {
        JSObject reponse = new JSObject();
        reponse.put("sorte", sorte);
        if ("trouvee".equals(sorte) && position != null) {
            reponse.put("latitude", position.getLatitude());
            reponse.put("longitude", position.getLongitude());
        }
        call.resolve(reponse);
    }

    // Une seule réponse : la première position venue, ou à l'expiration la
    // dernière connue si elle n'est pas trop ancienne.
    private static class Ecoute implements LocationListener {

        private final LocationManager gestionnaire;
        private final Handler fil;
        private final PluginCall call;
        private final Location derniere;
        private boolean finie;

        Ecoute(LocationManager gestionnaire, Handler fil, PluginCall call, Location derniere) {
            this.gestionnaire = gestionnaire;
            this.fil = fil;
            this.call = call;
            this.derniere = derniere;
        }

        @Override
        public void onLocationChanged(Location position) {
            finir("trouvee", position);
        }

        void expirer() {
            finir(ageAcceptable(derniere) ? "trouvee" : "introuvable", derniere);
        }

        private void finir(String sorte, Location position) {
            if (finie) return;
            finie = true;
            fil.removeCallbacksAndMessages(null);
            gestionnaire.removeUpdates(this);
            repondre(call, sorte, position);
        }

        // Exigées avant Android 11.
        @Override
        @SuppressWarnings("deprecation")
        public void onStatusChanged(String source, int etat, Bundle extras) {}

        @Override
        public void onProviderEnabled(String source) {}

        @Override
        public void onProviderDisabled(String source) {}
    }
}
