import { useEffect } from "react";
import { exists } from '@tauri-apps/plugin-fs';
import { openPath } from "@tauri-apps/plugin-opener";

import { downloadFile } from "../utils/files";
import { useFileExplorer } from "../hooks/useFileExplorer";
import { useClient } from "../hooks/useClient";
import { FiltersBar } from "../ui/FileExplorer";
import { type File } from "../contexts/FileExplorerContext";
import FILE_SVG from "../assets/file.svg";
import FOLDER_SVG from "../assets/folder.svg";

export default function Home() {
  const { files, startAt, navigateTo  } = useFileExplorer();

  useEffect(() => {
      //remember what path i was on last when component was mounted
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath) {
        startAt(null);

      } else {
        startAt('/');
      }
  
    }, [startAt])

  async function handleFileClick(file: File) {
    let downloadPath = `${import.meta.env.VITE_DOWNLOAD_DIR}/${file.name}`;
    if (file.isDir) {
      navigateTo(file.path);
    } else {
      try {
        const fileExists = await exists(downloadPath);
        
        if (!fileExists) {
          console.log('trying to download');
          downloadPath = await downloadFile(file.path);
        }

        console.log("got here");

        await openPath(downloadPath);

      } catch (error) {
        console.error("Error opening file:", error);
      }
    }
  }

  const { createClientConnection } = useClient();

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="relative flex-grow overflow-auto">
        <FiltersBar />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-5 p-2">
          {files.map((file) => (
            <div key={file.name} className="flex flex-col items-center rounded hover:bg-white/10 p-2"
              onDoubleClick={() => handleFileClick(file)}
            >
              {file.isDir ? <img src={FOLDER_SVG} className="w-[64px] h-[64px]" /> : <img src={FILE_SVG} className="w-[64px] h-[64px]"/>}
              <p className="text-sm text-center truncate w-full">{file.name}</p>
            </div>
          ))}
        </div>
        <button onClick={() => createClientConnection()}>connect to services</button>
      </div>
    </div>

  );

}
