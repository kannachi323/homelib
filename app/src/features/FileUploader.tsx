import { useState } from "react";

import { useClient } from "../hooks/useClient";
import { uploadFiles, writeFromBlobData } from "../utils/files";
import { CreateTransferTask } from "../utils/channels/transfer";

export function FileUploader() {
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