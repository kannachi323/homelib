
import { handleDelete, handleRename, handleCut, handleCopy } from "@/lib/files";
import { useFileExplorerStore } from "@/stores/useFileExplorerStore";
import { Trash2, Pencil, Scissors, Copy } from "lucide-react";

export function FileEditItems() {
  const selectedFiles = useFileExplorerStore.getState().selectedFiles;

  return (
    <>
      <b className="p-2 block">Edit</b>
       <li
        className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]"
        onClick={handleCut}
      >
        <Scissors className="w-5 h-5 mr-2"/>
        <p>Cut</p>
      </li>
       <li
        className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]"
        onClick={handleCopy}
      >
        <Copy className="w-5 h-5 mr-2"/>
        <p>Copy</p>
      </li>
      
      {selectedFiles.length === 1 && 
        <li
          className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]"
          onClick={handleRename}
        >
          <Pencil className="w-5 h-5 mr-2"/>
          <p>Rename</p>
        </li> 
      }
      <li
        className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]"
        onClick={handleDelete}
      >
        <Trash2 className="w-5 h-5 mr-2"/>
        <p>Delete</p>
      </li>
    </>
  );
}