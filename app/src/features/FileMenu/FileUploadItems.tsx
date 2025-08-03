

import { FileUp, FolderUp } from "lucide-react";
import { handleFileUpload, handleFolderUpload } from "@/lib/files";

export function FileUploadItems() {

  return (
    <>
      <b className="p-2 block">Upload</b>
      <li
        className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c]"
        onClick={() => handleFileUpload()}
      >
        <FileUp className="w-5 h-5 mr-2" />
        <p>File</p>
      </li>
     
      <li
        className="flex items-center p-2 cursor-pointer hover:bg-[#5d5c5c] rounded-b"
        onClick={() => handleFolderUpload()}
      >
        <FolderUp className="w-5 h-5 mr-2" />
        <p>Folder</p>
      </li>
    </>
  );
}