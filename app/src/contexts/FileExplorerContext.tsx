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
  forwardStack: string[];
  backStack: string[];
  startAt: (path: string | null) => void;
  navigateTo: (newPath: string) => void;
  goBack: () => void;
  goForward: () => void;
  fetchFiles: (path: string) => Promise<void>;
}

export const FileExplorerContext = createContext<FileExplorerContext | undefined>(undefined);