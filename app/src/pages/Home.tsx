import { useEffect, useState } from "react";

import { useFileExplorer } from "../hooks/useFileExplorer";
import { type File } from "../contexts/FileExplorerContext";
import { useClient } from "../hooks/useClient";
import { FiltersBar} from "../features/FileExplorer";

import FILE_SVG from "../assets/file.svg";
import FOLDER_SVG from "../assets/folder.svg";
import { openFile, uploadFiles, writeFromBlobData } from "../utils/files";
import { JoinTransferChannel, CreateTransferTask } from "../utils/channels/transfer";

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
        <button onClick={() => JoinTransferChannel(client, conn)} className="bg-white/50 p-2 rounded-lg">
          Join Transfer Channel
        </button>
        <FileUploader />
      </div>
    </div>

  );

}


function FileUploader() {
  const [selectedFiles, setSelectedFiles] = useState<globalThis.File[]>([]);

  const { client, conn, blobData } = useClient(); 

  if (!client || !conn) {
    return undefined;
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);
    }
  }

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} />
      <ul>
        {selectedFiles.map((file, idx) => (
          <li key={idx}>
            {file.name} ({file.size} bytes)
          </li>
        ))}
      </ul>
       <button onClick={() => CreateTransferTask(client, conn, "upload")} className="bg-white/50 p-2 rounded-lg">Create transfer task</button>
       <button onClick={() => uploadFiles(conn, client.id, client.id, `transfer:${client.id}`, selectedFiles)} className="bg-white/50 p-2 rounded-lg">
          Upload Files
        </button>
        <button onClick={() => writeFromBlobData(blobData)} className="bg-white/50 p-2 rounded-lg">
          Write from Blob Data
        </button>
    </div>
  );
}

