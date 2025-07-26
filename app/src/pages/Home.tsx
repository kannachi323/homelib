import { useEffect } from "react";
import { exists } from '@tauri-apps/plugin-fs';
import { openPath } from "@tauri-apps/plugin-opener";

import { downloadFile } from "../utils/files";
import { useFileExplorer } from "../hooks/useFileExplorer";
import { useClient } from "../hooks/useClient";
import { FiltersBar } from "../features/FileExplorer";
import { type File } from "../contexts/FileExplorerContext";
import FILE_SVG from "../assets/file.svg";
import FOLDER_SVG from "../assets/folder.svg";

export default function Home() {
  const { files, startAt, navigateTo  } = useFileExplorer();

  useEffect(() => {
      //remember what path i was on last when component was mounted
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath) {
        startAt(lastPath);

      } else {
        startAt('/homelib');
      }
  
    }, [startAt])

  async function handleFileClick(file: File) {
    //this is local download path
    let localDownloadPath = `homelib/local/Downloads/${file.name}`;
    
    if (file.isDir) {
      navigateTo(file.path);
      return;
    }


    try {
      const fileExists = await exists(localDownloadPath);
      
      if (!fileExists) {
        console.log('trying to download');
        localDownloadPath = await downloadFile(file.path);
      }

      console.log("got here");

      await openPath(localDownloadPath);

    } catch (error) {
      console.error("Error opening file:", error);
    }
    

  }

  const { createClientConnection, sendMessage, conn} = useClient();


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
        <button onClick={() => sendMessage(conn, "system", "Hello from client!")}>Send Message</button>
      </div>
    </div>

  );

}
