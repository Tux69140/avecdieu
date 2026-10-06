import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { EcranAPropos } from './ecrans/EcranAPropos'
import { EcranChapelet } from './ecrans/EcranChapelet'
import { EcranMenu } from './ecrans/EcranMenu'
import { EcranOffice } from './ecrans/EcranOffice'
import { EcranOffices } from './ecrans/EcranOffices'
import { EcranReglages } from './ecrans/EcranReglages'
import './styles/jetons.css'

const routeur = createBrowserRouter([
  // L'accueil « Aujourd'hui » arrive en phase 8 ; d'ici là, il mène au chapelet.
  { path: '/', element: <Navigate to="/chapelet" replace /> },
  { path: '/chapelet', element: <EcranChapelet /> },
  { path: '/chapelet/:serie', element: <EcranChapelet /> },
  // Les offices du jour, ouverts par le menu en attendant l'accueil.
  { path: '/offices', element: <EcranOffices /> },
  { path: '/office/:office/:date', element: <EcranOffice /> },
  { path: '/reglages', element: <EcranReglages /> },
  { path: '/menu', element: <EcranMenu /> },
  { path: '/a-propos', element: <EcranAPropos /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routeur} />
  </StrictMode>,
)
