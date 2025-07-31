import { useEffect } from 'react';
import { useFileExplorerStore } from '../stores/useFileExplorerStore';

export function useLastPath() {
    const { currentPath, forwardStack, backStack }  = useFileExplorerStore()

    useEffect(() => {
        localStorage.setItem('lastPath', currentPath);
        localStorage.setItem('forwardStack', JSON.stringify(forwardStack));
        localStorage.setItem('backStack', JSON.stringify(backStack));
    }, [currentPath, forwardStack, backStack]);
}