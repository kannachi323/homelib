
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './router';
import { AuthProvider } from './contexts/AuthProvider';


createRoot(document.getElementById('root')!).render(
   
   <AuthProvider>
      <RouterProvider router={router} />
   </AuthProvider>


   
)
