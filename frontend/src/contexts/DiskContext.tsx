import { createContext } from 'react';

export type Disk = {
    name: string;
    size: string;
    usage: string;
    id: string;
}

interface DiskContext {
  currentDisk: Disk | undefined;
  setCurrentDisk: (disk: Disk) => void;
  disks: Disk[];
  setDisks: (disks: Disk[]) => void;
}

export const DiskContext = createContext<DiskContext | undefined>(undefined);