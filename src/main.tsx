import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { EcranChapelet } from './ecrans/EcranChapelet'
import './styles/jetons.css'

const routeur = createBrowserRouter([
  // L'accueil « Aujourd'hui » arrive en phase 8 ; d'ici là, il mène au chapelet.
  { path: '/', element: <Navigate to="/chapelet" replace /> },
  { path: '/chapelet', element: <EcranChapelet /> },
  { path: '/chapelet/:serie', element: <EcranChapelet /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routeur} />
  </StrictMode>,
)
