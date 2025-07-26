import { createContext } from 'react';

export type Disk = {
    name: string;
    device: string;
    mountpoint: string;
    fstype: string;
    total: number;
    used: number;
    free: number;
    usedPercent: number;
}

interface DiskContext {
  currentDisk: Disk | undefined;
  setCurrentDisk: (disk: Disk) => void;
  disks: Disk[];
  setDisks: (disks: Disk[]) => void;
  scanStep: number;
  setScanStep: (step: number) => void;
}

export const DiskContext = createContext<DiskContext | undefined>(undefined);