import { useState, useEffect } from 'react';
import { RiScan2Fill } from "react-icons/ri";

import { Loading } from "../components/Loading";
import { useDisk } from "../hooks/useDisk";
import { type Disk } from '../contexts/DiskContext';


export function DiskScannerTab({ isOpen } : {isOpen: boolean}) {
  return (
    <div className={`flex flex-row ${isOpen ? 'justify-start gap-2' : 'justify-center'} items-center w-full`}>
      <RiScan2Fill className="text-2xl"/>
      {isOpen && 
          <h1 className="text-lg font-bold whitespace-nowrap">
            Disk Scanner
          </h1>
        }
    </div>
  )
}

export function DiskScannerWelcome() {
  const { setScanStep } = useDisk();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">
        Welcome! Let’s scan your device and show all available disks.
      </h1>
      <div className="rounded-full w-[128px] h-[128px] flex items-center justify-center border cursor-pointer hover:bg-white/20"
        onClick={() => setScanStep(1)}
      >

        Scan
      </div>
    </div>
  )

}

export function DiskScannerScanDisks() {
  const {setScanStep, setDisks} = useDisk();
  const [isDone, setIsDone] = useState(false);


   useEffect(() => {
    
    async function scanDisks() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/disks`);
        if (!res.ok) {
          console.error("Disk fetch failed:", res.statusText);
          return;
        }

        const data: Disk[] = await res.json();
        if (data.length > 0) {
          setDisks(data);
          setScanStep(2);
          localStorage.setItem('disks', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsDone(true);
      }
    }

    scanDisks();
  }, [setScanStep, setDisks]);



  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
    
      {!isDone && 
        <>
          
          <h1 className="text-2xl font-bold mb-4">Scanning for disks...</h1>
          <Loading />  
        </>
      }
    </div>
  )
}

export function DiskScannerView() {
  const { disks, setScanStep, setDisks } = useDisk();
  const [selectedDisks, setSelectedDisks] = useState<Set<string>>(new Set());

  function handleDiskToggle(disk: Disk) {
    setSelectedDisks((prev) => {
      const updated = new Set(prev);
      if (updated.has(disk.device)) {
        updated.delete(disk.device);
      } else {
        updated.add(disk.device);
      }
      return updated;
    });
  }

  function handleSaveDisks() {
    const selectedDiskList: Disk[] = disks.filter((d) => selectedDisks.has(d.device));
    setDisks(selectedDiskList);
    localStorage.setItem("disks", JSON.stringify(selectedDiskList));
    console.log("Selected disks saved:", selectedDiskList);
    setScanStep(0);
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">Choose disks to include:</h1>
      <ul className="w-full h-auto space-y-2 p-2 overflow-scroll">
        {disks.map((disk) => {
          const isSelected = selectedDisks.has(disk.device);
          return (
            <li
              key={disk.device}
              onClick={() => handleDiskToggle(disk)}
              className={`flex flex-row items-center justify-between w-full p-4 rounded cursor-pointer transition-colors
                ${isSelected ? "bg-blue-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-100"}`}
            >
              {/* Disk info */}
              <div className="flex flex-col">
                <div className="font-semibold">
                  {disk.device} ({disk.mountpoint})
                </div>
                <div className="text-sm text-gray-300">
                  FS: {disk.fstype} | Size: {disk.total}
                </div>
              </div>

              {/* Actual checkbox */}
              <input
                type="checkbox"
                readOnly
                checked={isSelected}
                className="w-5 h-5 ml-4 accent-blue-500 cursor-pointer"
              />
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleSaveDisks}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Save Selected Disks
      </button>
    </div>
  );
}
