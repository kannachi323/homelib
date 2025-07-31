import { writeFile } from '@tauri-apps/plugin-fs';
import { basename } from "@tauri-apps/api/path";
import { platform } from '@tauri-apps/plugin-os';
import { findHomelibRootOnDisk } from './disks';



export async function downloadFromFilePath(filePath: string) : Promise<string> {
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

