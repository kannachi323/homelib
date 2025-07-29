import { type File } from "../contexts/FileExplorerContext";
import { writeFile } from '@tauri-apps/plugin-fs';
import { basename } from "@tauri-apps/api/path";
import { platform } from '@tauri-apps/plugin-os';
import { exists } from '@tauri-apps/plugin-fs';
import { openPath } from "@tauri-apps/plugin-opener";
import { findHomelibRootOnDisk } from "./disks";
import { Blob } from "../proto-gen/blob";
import Long from "long";


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
    const homelibRoot = await findHomelibRootOnDisk("/");
    const downloadPath = await encodePathWithOS(`${homelibRoot}/${fileName}`);
    
    await writeFile(downloadPath, data);

    return downloadPath;
    
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

export async function encodePathWithOS(inputPath: string): Promise<string> {
  const os = await platform();

  if (os === 'windows') {
    const normalized = inputPath.replace(/\\/g, '/');
    if (!normalized.match(/^[a-zA-Z]:\//)) {
      return `C:/${normalized}`;
    }
    return normalized;
  }

  return inputPath;
}


export async function openFile(file: File) {

  try {
    const fileExists = await exists(file.path);
    
    if (!fileExists) {
      await downloadFile(file.path);
    }

    await openPath(file.path);

  } catch (error) {
    console.error("Error opening file:", error);
  }
}

export async function uploadFiles(conn: WebSocket, src: string, dst: string, channelName: string, files: globalThis.File[]): Promise<void> {
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

  for (const file of files) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    console.log(`Uploading file: ${file.name}, Total Chunks: ${totalChunks}`);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const slice = file.slice(start, end);
      const arrayBuffer = await slice.arrayBuffer();

      const blob: Blob = {
        src: src,
        dst: dst,
        channelName,
        timestamp: new Date().toISOString(),
        size: Long.fromNumber(file.size),
        data: new Uint8Array(arrayBuffer),
        fileName: file.name,
        fileType: file.type,
        chunkIndex: i,
        totalChunks: totalChunks,
      };

      const encoded = Blob.encode(blob).finish(); 
      console.log(encoded);
      conn.send(encoded);
    }
  }
}

