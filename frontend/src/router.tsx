import { createHashRouter } from 'react-router';
import App from './App';
import Files from './pages/Files';
import DiskScan from './pages/DiskScan'

export const router = createHashRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {index: true, element: <Files />},
            {path: "disk-scan", element: <DiskScan />}
        ]
    }
])