import { useState, useEffect } from 'react';

import { DiskContext, type Disk } from './DiskContext';


export function DiskProvider({ children }: { children: React.ReactNode }) {
  const [disks, setDisks] = useState<Disk[]>([])
  const [currentDisk, setCurrentDisk] = useState<Disk>(); 

  useEffect(() => {
    // Simulate fetching disks from an API or local storage
    const fetchedDisks: Disk[] = [
      { name: "Disk 1", size: "500GB", usage: "10GB", id: '1' },
      { name: "Disk 2", size: "1TB", usage: "200GB", id: '2' },
      { name: "Disk 3", size: "2TB", usage: "250GB", id: '3' },
    ];
    setDisks(fetchedDisks);
    setCurrentDisk(fetchedDisks[0]);
  }, []);

  return (
    <DiskContext.Provider
      value={{disks, setDisks, currentDisk, setCurrentDisk}}
    >
      {children}
    </DiskContext.Provider>
  );
}