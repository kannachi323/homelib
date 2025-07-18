import { createBrowserRouter } from 'react-router';

import App from './App';
import Files from './pages/Files';
import DiskScan from './pages/DiskScan'
import Auth from './pages/Auth';
import LogIn from './pages/Auth/Login';
import SignUp from './pages/Auth/Signup';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {index: true, element: <Files />},
            {path: "disk-scan", element: <DiskScan />}
        ]
    },
    {
        path: "/auth",
        element: <Auth />,
        children: [
            {path: "login", element: <LogIn />},
            {path: "signup", element: <SignUp />}
        ]
    }
])