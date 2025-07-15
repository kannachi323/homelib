import { createHashRouter } from 'react-router';
import App from './App';
import Home from './pages/Home';

export const router = createHashRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {index: true, element: <Home />},
        ]
    }
])