import { useRef, useState } from 'react';
import { File, Plus } from 'lucide-react';


import { useClickOutside } from '../hooks/useClickOutside';


function NewFileMenuDropdown({
  setShowDropdown,
  parentRef,
}: {
  setShowDropdown: (show: boolean) => void;
  parentRef: React.RefObject<HTMLDivElement>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setShowDropdown(false));

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 w-full bg-[#222121] rounded-lg shadow-md z-50"
    >
      <b className="p-2 block">Create</b>
      <ul className="space-y-2 p-2">
        <li className="flex items-center p-2 cursor-pointer hover:bg-[#2a2a2a] rounded">
          <File className="text-2xl mr-2" />
          <p>File</p>
        </li>
        <li className="flex items-center p-2 cursor-pointer hover:bg-[#2a2a2a] rounded">
          <p>Folder</p>
        </li>
      </ul>
    </div>
  );
}
