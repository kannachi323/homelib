
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './router';
import { AuthProvider } from './contexts/AuthProvider';
import { ClientProvider } from './contexts/ClientProvider';


createRoot(document.getElementById('root')!).render(
   
   <AuthProvider>
      <ClientProvider>
          <RouterProvider router={router} />
      </ClientProvider>
    </AuthProvider>


   
)
