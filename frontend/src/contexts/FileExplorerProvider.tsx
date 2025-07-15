import { useState } from 'react';

import { FileExplorerContext } from './FileExplorerContext';


export function FileExplorerProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>('/homelib'); 
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  return (
    <FileExplorerContext.Provider
      value={{currentPath, setCurrentPath, layout, setLayout}}
    >
      {children}
    </FileExplorerContext.Provider>
  );
}