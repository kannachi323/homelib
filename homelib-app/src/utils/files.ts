import { type File } from "../contexts/FileExplorerContext";
import { writeFile } from '@tauri-apps/plugin-fs';
import { basename } from "@tauri-apps/api/path";

export async function fetchFiles(setFiles : (files: File[]) => void, path : string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/files?path=${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      setFiles([]);
      throw new Error(`Error fetching files: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.length > 0) {
      setFiles(data);
    }
    

  } catch (error) {
    console.error("Failed to fetch files:", error);
    setFiles([]);
  }
}

export async function downloadFile(filePath: string) : Promise<string> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/file?path=${encodeURIComponent(filePath)}`);

    if (!res.ok) {
      throw new Error(`Error downloading file: ${res.statusText}`);
    }

    const blob = await res.blob();
    const data = new Uint8Array(await blob.arrayBuffer());

    const fileName = await basename(filePath);
    const downloadPath = `${import.meta.env.VITE_DOWNLOAD_DIR}/${fileName}`;


    await writeFile(downloadPath, data);

    return downloadPath;
    
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}