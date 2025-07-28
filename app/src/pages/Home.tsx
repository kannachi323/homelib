import { useEffect } from "react";

import { useFileExplorer } from "../hooks/useFileExplorer";
import { type File } from "../contexts/FileExplorerContext";
import { useClient } from "../hooks/useClient";
import { FiltersBar} from "../features/FileExplorer";

import FILE_SVG from "../assets/file.svg";
import FOLDER_SVG from "../assets/folder.svg";
import { JoinIpify, GetLocalIP } from "../utils/channels/ipify";
import { openFile } from "../utils/files";

export default function Home() {
  const { files, startAt, navigateTo  } = useFileExplorer();
  const { conn, client } = useClient();

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
    if (file.isDir) {
      navigateTo(file.path);
    } else {
      openFile(file);
    }
  }

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
        <button onClick={() => JoinIpify(client, conn)}>Join ipify</button>
        <button onClick={() => GetLocalIP(client, conn)}>Get Local ip</button>
      </div>
    </div>

  );

}
