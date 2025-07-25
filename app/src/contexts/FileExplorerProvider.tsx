import { useState, useEffect, useCallback } from 'react';


import { FileExplorerContext } from './FileExplorerContext';
import { type File } from './FileExplorerContext';
import { fetchFiles } from '../utils/files';


export function FileExplorerProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>('/'); 
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [files, setFiles] = useState<File[]>([]);
  const [backStack, setBackStack] = useState<string[]>([]);
  const [forwardStack, setForwardStack] = useState<string[]>([]);

  const startAt = useCallback((path: string | null) => {
   
    setCurrentPath(path || '/homelib');
    

    const forwardStack = localStorage.getItem('forwardStack');
    if (forwardStack) {
      setForwardStack(JSON.parse(forwardStack));
    } else {
      setForwardStack([]);
    }
    const backStack = localStorage.getItem('backStack');
    if (backStack) {
      setBackStack(JSON.parse(backStack));
    } else {
      setBackStack([]);
    }
   
  }, []);

  const navigateTo = useCallback((newPath: string) => {
    setBackStack(prev => [...prev, currentPath]);
    setForwardStack([]);
    setCurrentPath(newPath);
    fetchFiles(setFiles, newPath);
  }, [setFiles, currentPath]);

  const goBack = useCallback(() => {
    if (backStack.length > 0) {
      const prev = backStack[backStack.length - 1];
      setBackStack(prevStack => prevStack.slice(0, -1));
      setForwardStack(prev => [...prev, currentPath]);
      setCurrentPath(prev);
    }
  }, [backStack, currentPath])

  const goForward = useCallback(() => {
    if (forwardStack.length > 0) {
      const next = forwardStack[forwardStack.length - 1];
      setForwardStack(prev => prev.slice(0, -1));
      setBackStack(prev => [...prev, currentPath]);
      setCurrentPath(next);
    }
  }, [forwardStack, currentPath]);

  useEffect(() => {
    fetchFiles(setFiles, currentPath);
  }, [currentPath]);

  return (
    <FileExplorerContext.Provider
      value={{
        currentPath,
        setCurrentPath,
        layout,
        setLayout,
        files,
        setFiles,
        startAt,
        navigateTo,
        goBack,
        goForward,
        forwardStack,
        backStack
      }}
    >
      {children}
    </FileExplorerContext.Provider>
  );
}