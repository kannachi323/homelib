import { useState, useEffect } from 'react';
import { FiHardDrive } from "react-icons/fi";
import { useNavigate } from 'react-router';


import { Loading } from "../components/Loading";
import { useDisk } from "../hooks/useDisk";
import { type Disk } from '../contexts/DiskContext';
import { formatBytes } from '../utils/disks';



export function DiskScannerTab({ isOpen } : {isOpen: boolean}) {
  return (
    <div className={`flex flex-row ${isOpen ? 'justify-start gap-2' : 'justify-center p-2'} items-center w-full`}>
      <FiHardDrive className="text-2xl"/>
      {isOpen && 
          <h1 className="text-lg font-bold whitespace-nowrap">
            Disks
          </h1>
        }
    </div>
  )
}

export function DiskScannerWelcome() {
  const { setScanStep } = useDisk();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center space-y-6 bg-[#222121] text-white">
      <div className="flex items-center justify-center bg-white/10 rounded-full w-28 h-28">
        <FiHardDrive className="w-12 h-12 text-[#10A37F]" />
      </div>

      <h1 className="text-3xl font-semibold text-white">
        Let’s scan your disks
      </h1>

      <p className="text-gray-300 max-w-md">
        Do a quick scan to find your local disks. This helps HomeLib manage your files and storage efficiently.
      </p>

      <button
        onClick={() => setScanStep(1)}
        className="px-6 py-3 bg-[#10A37F] text-white rounded-full hover:bg-[#0e8c6f] transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Scan Disks
      </button>
    </div>
  );

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
          console.log("Disks found:", data);
          setDisks(data);
          localStorage.setItem('disks', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setTimeout(() => {
          setScanStep(2);
          setIsDone(true);
        }, 1500);
      }
    }
    scanDisks();
  }, [setScanStep, setDisks]);



  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center space-y-6 bg-[#222121] text-white">
      {!isDone && (
        <>
          <div className="flex items-center justify-center bg-white/10 rounded-full w-24 h-24">
            <FiHardDrive className="w-10 h-10 text-[#10A37F]" />
          </div>
          <h1 className="text-2xl font-semibold">Scanning for disks...</h1>
          <p className="text-gray-300 max-w-md">
            Sit tight while we detect your local storage. This won't take long...
          </p>
          <Loading />
        </>
      )}
    </div>
  );
}

export function DiskScannerResults() {
  const { disks, setScanStep, setDisks } = useDisk();
  const [selectedDisks, setSelectedDisks] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

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
    navigate('/');
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-6 bg-[#222121] text-white">
      <h1 className="text-2xl font-semibold mb-4">Choose disks to include</h1>

      <ul className="w-full max-w-xl space-y-3 overflow-y-auto px-5">
        {disks.map((disk) => {
          const isSelected = selectedDisks.has(disk.device);
          return (
            <li
              key={disk.device}
              onClick={() => handleDiskToggle(disk)}
              className={`flex flex-row items-center justify-between p-4 rounded-lg cursor-pointer transition-all
                ${isSelected 
                  ? "bg-[#10A37F] text-white" 
                  : "bg-white/5 hover:bg-white/10 text-white/90"}`}
            >
              <div className="flex flex-col w-[90%]">
                <div className="font-medium truncate overflow-hidden whitespace-nowrap">
                  {`${disk.name} (${disk.device})`}
                </div>
                <div className="text-sm text-gray-300">
                  FS: {disk.fstype} | Size: {formatBytes(disk.total)}
                </div>
              </div>

              <input
                type="checkbox"
                readOnly
                checked={isSelected}
                className="w-5 h-5 accent-[#10A37F] cursor-pointer bg-red-50"
              />
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleSaveDisks}
        className="mt-6 px-6 py-2 bg-[#10A37F] text-white rounded-full hover:bg-[#0e8c6f] transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Save
      </button>
    </div>
  );
}