import { createContext } from 'react';

export type File = {
  name: string;
  path: string;
  size: number;
  isDir: boolean;
}

interface FileExplorerContext {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  layout: 'grid' | 'list';
  setLayout: (layout: 'grid' | 'list') => void;
  files: File[];
  setFiles: (files: File[]) => void;
}

export const FileExplorerContext = createContext<FileExplorerContext | undefined>(undefined);