import { createContext } from 'react';

interface FileExplorerContext {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  layout: 'grid' | 'list';
  setLayout: (layout: 'grid' | 'list') => void;
}

export const FileExplorerContext = createContext<FileExplorerContext | undefined>(undefined);