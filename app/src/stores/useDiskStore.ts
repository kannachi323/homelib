import { create } from 'zustand';

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

type DiskState = {
  disks: Disk[];
  currentDisk?: Disk;
  scanStep: number;
  setDisks: (disks: Disk[]) => void;
  setCurrentDisk: (disk?: Disk) => void;
  setScanStep: (step: number) => void;
  loadDisksFromStorage: () => void;
};

export const useDiskStore = create<DiskState>((set) => ({
  disks: [],
  currentDisk: undefined,
  scanStep: 0,

  setDisks: (disks) => set({ disks }),
  setCurrentDisk: (disk) => set({ currentDisk: disk }),
  setScanStep: (step) => set({ scanStep: step }),

  loadDisksFromStorage: () => {
    const stored = localStorage.getItem('disks');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.length > 0) {
        console.log("Setting disks from localStorage:", parsed);
        set({ disks: parsed });
      }
    }
  },
}));
