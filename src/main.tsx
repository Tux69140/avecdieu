import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { entretenirReserve } from './aelf/reserve'
import { suivreApparence } from './affichage/apparence'
import { EcranAccueil } from './ecrans/EcranAccueil'
import { EcranAPropos } from './ecrans/EcranAPropos'
import { EcranChapelet } from './ecrans/EcranChapelet'
import { EcranMenu } from './ecrans/EcranMenu'
import { EcranOffice } from './ecrans/EcranOffice'
import { EcranReglages } from './ecrans/EcranReglages'
import './styles/jetons.css'

const routeur = createBrowserRouter([
  { path: '/', element: <EcranAccueil /> },
  { path: '/jour/:date', element: <EcranAccueil /> },
  { path: '/chapelet', element: <EcranChapelet /> },
  { path: '/chapelet/:serie', element: <EcranChapelet /> },
  { path: '/office/:office/:date', element: <EcranOffice /> },
  { path: '/reglages', element: <EcranReglages /> },
  { path: '/menu', element: <EcranMenu /> },
  { path: '/a-propos', element: <EcranAPropos /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

// Thème et taille du texte posés avant le premier affichage : pas d'éclair clair la nuit.
suivreApparence()
// Sept jours de textes d'avance, pour prier sans réseau (phase 9).
entretenirReserve()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routeur} />
  </StrictMode>,
)
