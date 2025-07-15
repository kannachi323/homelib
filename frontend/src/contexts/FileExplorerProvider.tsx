import { useState } from 'react';

import { FileExplorerContext } from './FileExplorerContext';
import { type File } from './FileExplorerContext';


export function FileExplorerProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>('/homelib'); 
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [files, setFiles] = useState<File[]>([]);

  return (
    <FileExplorerContext.Provider
      value={{currentPath, setCurrentPath, layout, setLayout, files, setFiles}}
    >
      {children}
    </FileExplorerContext.Provider>
  );
}