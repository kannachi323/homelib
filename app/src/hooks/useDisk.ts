import { useContext } from 'react';
import { DiskContext } from '../contexts/DiskContext';

export const useDisk = () => {
  const context = useContext(DiskContext);
  if (!context) {
    throw new Error('useDiskContext must be used within a FileExlporerProvider');
  }
  return context;
}