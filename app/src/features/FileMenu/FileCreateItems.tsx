import { handleNewFile, handleNewFolder } from "@/lib/files";
import { FilePlus, FolderPlus } from "lucide-react";

export function FileCreateItems() {
  return (
    <>
      <b className="p-2 block">Create</b>
      <li className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c] rounded-t"
        onClick={() => handleNewFile()}
      >
        <FilePlus className="w-5 h-5 mr-2" />
        <p>New file</p>
      </li>
      <li className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]"
        onClick={() => handleNewFolder()}
      >
        <FolderPlus className="w-5 h-5 mr-2" />
        <p>New folder</p>
      </li>
    </>
  )
}