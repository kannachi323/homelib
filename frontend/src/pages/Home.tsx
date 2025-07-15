import { useEffect, useRef, useState } from "react";
import { useDisk } from "../hooks/useDisk";
import { useFileExplorer } from "../hooks/useFileExplorer";
import { LiaFilterSolid } from "react-icons/lia";
import { FaSort } from "react-icons/fa";
import { CiGrid41 } from "react-icons/ci";
import { CiBoxList } from "react-icons/ci";

import { useClickOutside } from "../hooks/useClickOutside";



export default function Home() {
  const { setDisks, currentDisk } = useDisk();
  const { setCurrentPath } = useFileExplorer();

  useEffect(() => {
    async function fetchDisks() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const res = await fetch(`${apiUrl}/files?path=${baseUrl}/data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data) {
          setDisks([
            {
              name: "Home", size: "10TB", usage: "0GB", id: "1",
            }
          ]);
          if (currentDisk?.name) {
            setCurrentPath(`/homelib/${currentDisk.name}`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch disks:", error);
      }
    }

    if (currentDisk) {
      fetchDisks();
    }
  }, [currentDisk, setDisks, setCurrentPath]);

  return <DefaultHome />;
}

export function DefaultHome() {

  const files = [
    { name: "File1.txt" },
    { name: "File2.txt" },
    { name: "File3.txt" },
    { name: "File4.txt" },
    { name: "File5.txt" },
    { name: "File6.txt" },
    { name: "File7.txt" },
    { name: "File8.txt" },
    { name: "File9.txt" },
    { name: "File10.txt" },
  ]

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="relative flex-grow overflow-auto">

        <FiltersBar />
        
        <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4 p-4">
          {files.map((file) => (
            <div key={file.name} className="flex flex-col items-center p-4 border rounded cursor-pointer">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-sm text-center truncate">{file.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}

export function FiltersBar() {
  return (
    <div className="sticky top-0 px-4 h-12 flex items-center">
      <span className="text-xs text-blue-500 whitespace-nowrap bg-[#181818] p-2 mr-auto rounded-lg">
        Last updated: {new Date().toLocaleDateString('en-US')}{' '}
        {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // optional: true for AM/PM, false for 24h
        })}
      </span>
      <LayoutToggle />
     
    
      <LiaFilterSolid className="text-gray-500 text-xl mr-2" />
    </div>

  )
}

export function LayoutToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { layout, setLayout } = useFileExplorer();

  const toggleRef = useRef<HTMLDivElement>(null);

  useClickOutside(toggleRef, () => setIsOpen(false));


  const handleLayoutChange = (view: 'grid' | 'list') => {
    setLayout(view);
    setIsOpen(false); // Close dropdown
  };

  return (
    <div ref={toggleRef} className="relative flex flex-row items-center mr-5">
      {/* Clickable icon button */}
      <div
        className="flex flex-row items-center cursor-pointer hover:bg-white/10 p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {layout === "grid" ? (
          <CiGrid41 className="text-gray-300 text-xl" />
        ) : (
          <CiBoxList className="text-gray-300 text-xl" />
        )}
        <FaSort className="text-gray-300 text-sm ml-1" />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[140px] bg-[#2a2a2a] rounded shadow-lg border border-gray-700 z-50">
          <ul className="flex flex-col">
            <li
              onClick={() => handleLayoutChange("grid")}
              className={`flex gap-2 items-center p-2 hover:bg-white/10 cursor-pointer`}
            >
              <CiGrid41 className="text-lg" />
              <span className="text-sm">Grid View</span>
            </li>
            <li
              onClick={() => handleLayoutChange("list")}
              className={`flex gap-2 items-center p-2 hover:bg-white/10 cursor-pointer`}
            >
              <CiBoxList className="text-lg" />
              <span className="text-sm">List View</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export function AuthButtons() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-10">
      <h1 className="text-4xl font-bold">Welcome to HomeLib!</h1>
      <h2>Get Started</h2>

      <div className="flex flex-row justify-center gap-5 w-1/2 h-[64px] p-2">
        <button className="p-2 border-2 rounded-full w-1/4">Log in</button>
        <button className="p-2 border-2 rounded-full w-1/4">Sign up</button>
      </div>
    </div>
  );
}
