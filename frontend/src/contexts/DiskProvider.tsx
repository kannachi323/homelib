import { useState, useEffect } from 'react';

import { DiskContext, type Disk } from './DiskContext';


export function DiskProvider({ children }: { children: React.ReactNode }) {
  const [disks, setDisks] = useState<Disk[]>([])
  const [currentDisk, setCurrentDisk] = useState<Disk>(); 
  const [scanStep, setScanStep] = useState<number>(0);

  useEffect(() => {
    const storedDisks = localStorage.getItem('disks');
    if (storedDisks) {
      const parsedDisks: Disk[] = JSON.parse(storedDisks);
      if (parsedDisks.length > 0) {
        console.log("Setting disks from localStorage:", parsedDisks);
        setDisks(parsedDisks);
      }
    }
  }, [])

  return (
    <DiskContext.Provider
      value={{disks, setDisks, currentDisk, setCurrentDisk, scanStep, setScanStep}}
    >
      {children}
    </DiskContext.Provider>
  );
}