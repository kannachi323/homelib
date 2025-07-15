import { GiHamburgerMenu } from "react-icons/gi";
import { FiHardDrive } from "react-icons/fi";
import { MdSearch } from "react-icons/md";
import { MdRefresh } from "react-icons/md";



import { Outlet } from "react-router"; // ✅ Use react-router-dom!
import { useState, useEffect } from "react";

import { useFileExplorer } from "./hooks/useFileExplorer";
import { useDisk } from "./hooks/useDisk";
import { type Disk } from "./contexts/DiskContext";
import { DiskProvider } from "./contexts/DiskProvider";
import { FileExplorerProvider } from "./contexts/FileExplorerProvider";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-row w-screen h-screen">
      <DiskProvider>
        <FileExplorerProvider>
          {/* Sidebar */}
          <aside
            className={`
              h-full border-r flex flex-col justify-between items-center 
              transition-all duration-300 bg-[#181818]
              ${isOpen ? "w-[25vw]" : "w-[5vw]"}
            `}
          >
            <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
          </aside>

          {/* Main Content */}
          <div className="w-full flex flex-col">
            <header className="h-1/12 border-b">
              
              <FileExplorer />
              
              
            </header>
            <main className="h-11/12 overflow-scroll">
              <Outlet />
            </main>
          </div>
  
        </FileExplorerProvider>



      </DiskProvider>
    </div>
        
  );
}

export function AppLogo() {
  return (
    <h1 className="text-2xl font-bold whitespace-nowrap">
      HomeLib
    </h1>
  );
}

export function Menu({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className={`flex flex-row ${isOpen ? 'justify-between' : 'justify-center'} items-center w-full p-2`}>
        {isOpen && <AppLogo />}
        
        <GiHamburgerMenu
          className="text-2xl cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
        
       
      </div>
       {isOpen && 
    
          <DiskTray />

        
       }
    </div>
  );
}

export function DiskTray() {
  function parseSize(value: string): number {
    if (value == undefined) return 0;
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    const unit = value.toUpperCase().includes("TB") ? "TB" : "GB";

    return unit === "TB" ? num * 1024 : num;  // Convert TB to GB
  }

  function calculateUsagePercentage(usage: string, size: string): number {
    const usageValue = parseSize(usage);
    const sizeValue = parseSize(size);

    if (sizeValue === 0) return 0;
    return Math.min((usageValue / sizeValue) * 100, 100);
  }

  const { disks, currentDisk, setCurrentDisk } = useDisk();
  const { setCurrentPath } = useFileExplorer();

  function handleDiskSelect(disk: Disk) {
    setCurrentDisk(disk);
    setCurrentPath(`/homelib/${disk.name}`);
  }

  return (
    <ul className="w-full space-y-3 overflow-y-auto">
      {disks.map((disk, idx) => (
        <li
          key={idx}
          className={`flex flex-row items-center gap-3 w-full p-2 transition-colors duration-200 text-gray-200 hover:bg-gray-700 ${currentDisk?.id === disk.id ? 'bg-gray-700': ''} cursor-pointer`}
          onClick={(() => handleDiskSelect(disk))}
        >
          <FiHardDrive className="text-2xl"/>
          <div className={`flex flex-col w-full`}>
            <span className="text-sm">{disk.name}</span>
            <div className="relative w-full h-2 bg-gray-600 rounded overflow-hidden my-1">
              <div
                className="absolute left-0 top-0 h-full bg-green-500"
                style={{ width: `${calculateUsagePercentage(disk.usage, disk.size)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{disk.usage} free / {disk.size} total</span>
            
          </div>
          
        </li>
      ))}
    </ul>
  );
}



export function FileExplorer() {
  const { currentPath, setCurrentPath } = useFileExplorer();

  useEffect(() => {
    const savedPath = localStorage.getItem("currentPath");
    if (savedPath) {
      setCurrentPath(savedPath);
    } else {
      setCurrentPath("/homelib");
    }
  }, [setCurrentPath]);

  useEffect(() => {
    localStorage.setItem("currentPath", currentPath);
  }, [currentPath]);

  return (
    <div className="flex items-center justify-between w-full h-full gap-4 p-2">
      {/* Current Path Input with Refresh */}
      <div className="relative flex items-center h-[32px] flex-grow max-w-[400px] border border-gray-500 rounded px-2">
        <input
          className="flex-grow outline-none bg-transparent text-sm"
          type="text"
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          onFocus={(e) => {
            const val = e.target.value;
            e.target.setSelectionRange(val.length, val.length);
          }}
        />
        <MdSearch className="ml-2 text-lg cursor-pointer text-gray-400 hover:text-gray-200" onClick={() => setCurrentPath(currentPath)} />

        <div className="
          absolute left-full translate-x-2
          flex flex-row items-center gap-2
          w-auto max-w-[200px] px-2 py-1
          bg-[#181818] rounded
        ">
          <MdRefresh className="text-sm cursor-pointer hover:text-gray-200" onClick={() => window.location.reload()}/>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center h-[32px] flex-grow max-w-[300px] border border-gray-500 rounded px-2 bg-transparent">
        <input
          className="flex-grow outline-none bg-transparent text-sm"
          type="text"
          placeholder="Search..."
        />
        <MdSearch className="ml-2 text-lg cursor-pointer text-gray-400 hover:text-gray-200" />
      </div>
    </div>
  );
}


export default App;
