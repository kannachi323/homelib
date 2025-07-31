import { useRef, useState, useEffect } from "react";

import { MdRefresh } from "react-icons/md";
import { FaSort } from "react-icons/fa";
import { CiGrid41 } from "react-icons/ci";
import { CiBoxList } from "react-icons/ci";
import { LiaFilterSolid } from "react-icons/lia";

import { useClickOutside } from "../hooks/useClickOutside";
import FILE_SVG from "../assets/file.svg";
import FOLDER_SVG from "../assets/folder.svg";

import { useNavigate } from "react-router";
import { Home } from "lucide-react";
import { useFileExplorerStore, type File } from "../stores/useFileExplorerStore";
import { openPath } from "@tauri-apps/plugin-opener";

import { useClientStore } from "../stores/useClientStore";





export function HomeTab({isOpen} : {isOpen: boolean}) {
  const navigate = useNavigate();
  return (
    <div className={`flex flex-row ${isOpen ? 'justify-start gap-2' : 'justify-center p-2'} items-center w-full`}
      onClick={() => navigate('/')}
    >
      <Home />
      {isOpen && 
          <h1 className="text-lg font-bold whitespace-nowrap">
            Home
          </h1>
        }
    </div>
  )
}

export function HomeView() {
  const { files, navigateTo, startAt, fetchFiles } = useFileExplorerStore();

  const { syncClient } = useClientStore();
 
  useEffect(() => {
      //remember what path i was on last when component was mounted
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath) {
        startAt(lastPath);
        fetchFiles(lastPath);
      } else {
        startAt('/homelib');
        fetchFiles('/');
      }

      syncClient();
    }, [startAt, syncClient, fetchFiles])

  async function handleFileClick(file: File) {
    if (file.isDir) {
      navigateTo(file.path);
    } else {
      await openPath(file.path);
    }
  }
  

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-5 p-2">
      {files?.map((file) => (
        <div key={file.name} className="flex flex-col items-center rounded hover:bg-white/10 p-2"
          onDoubleClick={() => handleFileClick(file)}
          onContextMenu={(e) => {
            console.log("Right click on file:", file.name);
            e.stopPropagation();
          }}
        >
          {file.isDir ? <img src={FOLDER_SVG} className="w-[64px] h-[64px]" /> : <img src={FILE_SVG} className="w-[64px] h-[64px]"/>}
          <p className="text-sm text-center truncate w-full">{file.name}</p>
        </div>
      ))}

        
    </div>
  )
}

export function LayoutToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { layout, setLayout } = useFileExplorerStore();

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
      <span className="flex items-center text-xs text-blue-500 whitespace-nowrap bg-[#181818] p-2 rounded-lg">
        Last updated: {new Date().toLocaleDateString('en-US')}{' '}
        {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })}
        
      </span>
      <span className="p-1 rounded ml-1 mr-auto hover:bg-white/20 cursor-pointer">
        <MdRefresh className="text-xl" 
          onClick={() => window.location.reload()}
        />
      </span>
     
      <LayoutToggle />
  
      <LiaFilterSolid className="text-gray-500 text-xl mr-2" />
    </div>
  )
}
