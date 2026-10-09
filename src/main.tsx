import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { entretenirReserve } from './aelf/reserve'
import { suivreApparence } from './affichage/apparence'
import { retenirDefilement } from './composants/defilement'
import { Racine } from './composants/Racine'
import { EcranAccueil } from './ecrans/EcranAccueil'
import { EcranAPropos } from './ecrans/EcranAPropos'
import { EcranChapelet } from './ecrans/EcranChapelet'
import { EcranChapeletOuRosaire } from './ecrans/EcranChapeletOuRosaire'
import { EcranLieu } from './ecrans/EcranLieu'
import { EcranMenu } from './ecrans/EcranMenu'
import { EcranOffice } from './ecrans/EcranOffice'
import { EcranPriere } from './ecrans/EcranPriere'
import { EcranBatterie } from './ecrans/EcranBatterie'
import { EcranPrieresChapelet } from './ecrans/EcranPrieresChapelet'
import { EcranRappel } from './ecrans/EcranRappel'
import { EcranReglages } from './ecrans/EcranReglages'
import { EcranReglagesAffichage } from './ecrans/EcranReglagesAffichage'
import { EcranReglagesChapelet } from './ecrans/EcranReglagesChapelet'
import { EcranReglagesOffices } from './ecrans/EcranReglagesOffices'
import { EcranReglagesRappels } from './ecrans/EcranReglagesRappels'
import { EcranReinitialiser } from './ecrans/EcranReinitialiser'
import { EcranZone } from './ecrans/EcranZone'
import { suivreLesVoyages } from './lieu/voyage'
import { entretenirRappels, ouvrirLesNotifications } from './rappels/entretien'
import './styles/jetons.css'

const routeur = createBrowserRouter([
  {
    element: <Racine />,
    children: [
      { path: '/', element: <EcranAccueil /> },
      { path: '/jour/:date', element: <EcranAccueil /> },
      { path: '/chapelet', element: <EcranChapelet /> },
      { path: '/chapelet/:serie', element: <EcranChapelet /> },
      // Le Rosaire du jour, sur son propre seuil (phases 17 et 18).
      { path: '/rosaire', element: <EcranChapelet forme="rosaire" /> },
      { path: '/chapelet-ou-rosaire', element: <EcranChapeletOuRosaire /> },
      { path: '/office/:office/:date', element: <EcranOffice /> },
      { path: '/priere/:priere', element: <EcranPriere /> },
      // Les réglages en pages emboîtées (2026-10-08).
      { path: '/reglages', element: <EcranReglages /> },
      { path: '/reglages/rappels', element: <EcranReglagesRappels /> },
      { path: '/reglages/rappels/batterie', element: <EcranBatterie /> },
      { path: '/reglages/rappels/:priere', element: <EcranRappel /> },
      { path: '/reglages/chapelet', element: <EcranReglagesChapelet /> },
      { path: '/reglages/chapelet/prieres', element: <EcranPrieresChapelet /> },
      { path: '/reglages/offices', element: <EcranReglagesOffices /> },
      { path: '/reglages/offices/zone', element: <EcranZone /> },
      { path: '/reglages/affichage', element: <EcranReglagesAffichage /> },
      { path: '/reglages/reinitialiser', element: <EcranReinitialiser /> },
      { path: '/lieu', element: <EcranLieu /> },
      { path: '/menu', element: <EcranMenu /> },
      { path: '/a-propos', element: <EcranAPropos /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
retenirDefilement(routeur)

// Thème et taille du texte posés avant le premier affichage : pas d'éclair clair la nuit.
suivreApparence()
// Sept jours de textes d'avance, pour prier sans réseau (phase 9).
entretenirReserve()
// Une notification touchée ouvre sa prière, même app fermée ; les rappels du
// mois à venir sont refaits à chaque ouverture (phase 11).
ouvrirLesNotifications((route) => routeur.navigate(route))
entretenirRappels()
// En voyage, avec l'option, le lieu des heures solaires suit le téléphone (phase 12).
suivreLesVoyages()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routeur} />
  </StrictMode>,
)
