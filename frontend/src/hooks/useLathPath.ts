import { useEffect } from 'react';
import { useFileExplorer } from './useFileExplorer';

export function useLastPath() {
    const { currentPath, forwardStack, backStack }  = useFileExplorer()

    useEffect(() => {
        localStorage.setItem('lastPath', currentPath);
        localStorage.setItem('forwardStack', JSON.stringify(forwardStack));
        localStorage.setItem('backStack', JSON.stringify(backStack));
    }, [currentPath, forwardStack, backStack]);
}