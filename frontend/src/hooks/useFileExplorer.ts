import { useContext } from 'react';
import { FileExplorerContext } from '../contexts/FileExplorerContext';

export const useFileExplorer = () => {
  const context = useContext(FileExplorerContext);
  if (!context) {
    throw new Error('useFileExplorerContext must be used within a FileExlporerProvider');
  }
  return context;
}