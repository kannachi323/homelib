import { createBrowserRouter } from 'react-router';

import App from './App';
import Home from './pages/Home';
import DiskScan from './pages/DiskScan'
import DeviceScan from './pages/DeviceScan';
import Auth from './pages/Auth';
import LogIn from './pages/Auth/Login';
import SignUp from './pages/Auth/Signup';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {index: true, element: <Home />},
            {path: "disk-scan", element: <DiskScan />},
            {path: "device-scan", element: <DeviceScan />},
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