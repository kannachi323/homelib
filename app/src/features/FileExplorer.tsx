import { useState, useEffect } from "react";

import { useFileExplorer } from "../hooks/useFileExplorer";
import { useLastPath } from "../hooks/useLathPath";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";
import { MdSearch } from "react-icons/md";



export function FileExplorer() {
  const { goBack, goForward, forwardStack, backStack } = useFileExplorer();

  useLastPath();
  
  return (
    <div className="flex items-center justify-between w-full h-[50px] gap-4 p-2 bg-[#181818]">
      <div className="flex flex-row p-2 h-full gap-4 items-center">
        <RiArrowLeftSLine className={`text-3xl rounded transition-all duration-200 
          ${backStack.length === 0 
            ? 'opacity-30 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-white/20'}
        `}
          onClick={() => goBack()}
        />
        <RiArrowRightSLine className={`text-3xl rounded transition-all duration-200 
          ${forwardStack.length === 0 
            ? 'opacity-30 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-white/20'}
        `}
          onClick={() => goForward()}
        />
      </div>

      <PathSearch />
     

      <SearchBar />
     
    </div>
  );
}

export function SearchBar() {
  return (
    <div className="flex items-center h-[32px] flex-grow max-w-[300px] border border-gray-500 rounded px-2 bg-transparent">
      <input
        className="flex-grow outline-none bg-transparent text-sm"
        type="text"
        placeholder="Search..."
      />
      <MdSearch className="ml-2 text-lg cursor-pointer text-gray-400 hover:text-gray-200" />
    </div>
  )
   
}

export function PathSearch() {
  const { currentPath, setCurrentPath, navigateTo } = useFileExplorer();
  const [inputPath, setInputPath] = useState('');


  useEffect(() => {
    setInputPath(currentPath);
  }, [currentPath])

  return (
    <div className="relative flex items-center h-[32px] flex-grow max-w-[400px] border border-gray-500 rounded px-2">
      <input
        className="flex-grow outline-none bg-transparent text-sm"
        type="text"
        value={inputPath}
        onChange={(e) => setInputPath(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            navigateTo(inputPath);
          }
        }}
        onFocus={(e) => {
          const val = e.target.value;
          e.target.setSelectionRange(val.length, val.length);
        }}
      />
      <MdSearch className="ml-2 text-lg cursor-pointer text-gray-400 hover:text-gray-200" onClick={() => setCurrentPath(currentPath)} />
    </div>
  )
  
}