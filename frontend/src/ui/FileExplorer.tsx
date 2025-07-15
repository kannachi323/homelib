import { useRef, useState } from "react";
import { MdSearch } from "react-icons/md";
import { MdRefresh } from "react-icons/md";
import { useEffect } from "react";
import { PiFolders } from "react-icons/pi";
import { FaSort } from "react-icons/fa";
import { CiGrid41 } from "react-icons/ci";
import { CiBoxList } from "react-icons/ci";
import { LiaFilterSolid } from "react-icons/lia";

import { useClickOutside } from "../hooks/useClickOutside";
import { useFileExplorer } from "../hooks/useFileExplorer";



export function FileExplorerTab({isOpen} : {isOpen: boolean}) {
  return (
    <div className={`flex flex-row ${isOpen ? 'justify-start gap-2' : 'justify-center'} items-center w-full`}>
      <PiFolders className="text-2xl"/>
      {isOpen && 
          <h1 className="text-lg font-bold whitespace-nowrap">
            Files
          </h1>
        }
    </div>
  )
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

export function FiltersBar() {
  return (
    <div className="sticky top-0 p-2 pb-0 h-12 flex items-center">
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

