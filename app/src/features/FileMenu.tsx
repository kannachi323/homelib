import { useRef, useState } from 'react';
import { FilePlus, Plus, FolderPlus, FolderUp, FileUp } from 'lucide-react';


import { useClickOutside } from '../hooks/useClickOutside';

export function FileMenuTab({ isMenuOpen }: { isMenuOpen: boolean }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={`
          flex flex-row items-center w-full cursor-pointer z-10
          ${isMenuOpen ? 'justify-start gap-2' : 'justify-center p-2'}
        `}
        onClick={() => setShowDropdown(true)}
      >
        <Plus className="text-2xl" />
        {isMenuOpen && <b>New</b>}
      </div>

      {showDropdown && (
        <FileMenuDropdown
          setShowDropdown={setShowDropdown}
        />
      )}
    </div>
  )
}


function FileMenuDropdown({ setShowDropdown }: { setShowDropdown: (show: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setShowDropdown(false));

  return (
    <div
      ref={ref}
      className="absolute left-0 top-0 w-[200px] bg-[#353434] rounded-lg shadow-md z-50"
    >
      <ul className="text-sm border-b pb-1">
        <b className="p-2 block">Create</b>
        <li className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c] rounded-t">
          <FilePlus className="w-5 h-5 mr-2" />
          <p>New file</p>
        </li>
        <li className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]">
          <FolderPlus className="w-5 h-5 mr-2" />
          <p>New folder</p>
        </li> 
      </ul>
      <ul className="text-sm pt-1">
        <b className="p-2 block">Upload</b>
        <li className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]">
          <FileUp className="w-5 h-5 mr-2" />
          <p>File</p>
        </li>
        <li className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c] rounded-b">
          <FolderUp className="w-5 h-5 mr-2" />
          <p>Folder</p>
        </li>
      </ul>
    </div>
  );
}

