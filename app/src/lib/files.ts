import { open } from "@tauri-apps/plugin-dialog";
import { open as openFile, stat, readDir, type DirEntry, mkdir, writeFile, remove, rename } from "@tauri-apps/plugin-fs";
import { useFileExplorerStore, type File } from "@/stores/useFileExplorerStore";
import { useBlobBufferStore } from "@/stores/useBlobBufferStore";
import { useClientStore } from "@/stores/useClientStore";
import { TransferTask, useChannelStore } from "@/stores/useChannelStore";
import { basename } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";



 
export async function handleFileUpload() {
  const client = useClientStore.getState().client;
  const conn = useClientStore.getState().conn;
  if (!client || !conn) {
    console.error("Client or connection is not available");
    return;
  }
  const selected = await open({
    multiple: true,
    directory: false,
  });

  if (selected === null) {
    console.log("No files selected");
    return;
  }


  for (const filePath of selected as string[]) {
    const build = await buildFile(filePath);
    if (!build) {
      console.error(`Failed to prepare : ${filePath}`);
      continue;
    }
    const { taskID, fileHandle } = build;
    const uploadPath = useFileExplorerStore.getState().currentPath;

    try {
      await useBlobBufferStore.getState().sendFileBlobs(taskID, uploadPath, fileHandle);
    } catch (error) {
      console.error(`Error sending file blobs for ${filePath}:`, error);
    }
  }
}

export async function handleFolderUpload() {
  const selected: string[] | null = await open({
    multiple: true,
    directory: true,
  });

  if (!selected) return;

  for (const folderPath of selected) {
    const entries = await readDir(folderPath);
    if (!entries) {
      console.error(`Failed to read folder: ${folderPath}`);
      continue;
    }

    await buildFolder(entries, folderPath);
  }
}

//Helper functions (Don't export these)
async function buildFile(filePath: string) {
  const client = useClientStore.getState().client;
  if (!client) {
    console.error("Client is not available");
    return;
  }

  const chunkSize = 2 * 1024 * 1024;

  const fileHandle = await openFile(filePath, { read: true });
  if (!fileHandle) {
    console.error(`Failed to open file: ${filePath}`);
    return null;
  }

  const fileInfo = await fileHandle.stat();
  const fileSize = fileInfo.size;
  const totalChunks = Math.ceil(fileSize / chunkSize);


  const taskID = useChannelStore.getState().createTransferTask(TransferTask.UploadStart, client.id, client.id, totalChunks);
  if (!taskID) {
    console.error("Failed to create transfer task");
    return null;
  }

  return { fileHandle, taskID };
}


/* 
Recursively builds folder 

*/
async function buildFolder(entries: DirEntry[], parentPath: string) {
  for (const entry of entries) {
    const fullPath = `${parentPath}/${entry.name}`;
    const info = await stat(fullPath);

    if (info.isDirectory) {
      console.log("Creating folder:", fullPath);

      const subEntries = await readDir(fullPath);
      if (subEntries) {
        await buildFolder(subEntries, fullPath);
      }
    } else {

      console.log("Uploading file:", fullPath);
    }
  }
}


export async function handleNewFile() {
  const fetchFiles = useFileExplorerStore.getState().fetchFiles;
  const currentPath = useFileExplorerStore.getState().currentPath + "/New File";
  try {
      await writeFile(currentPath, new Uint8Array(0));
  } catch (error) {
      console.error("Error creating new file:", error);
  }
  fetchFiles(currentPath);
}


export async function handleNewFolder() {
  const { currentPath, fetchFiles } = useFileExplorerStore.getState();

  try {
    const entries = await readDir(currentPath);
    const folderNamesArray = await Promise.all(entries.map(entry => basename(entry.name)));
    const folderNames = new Set(folderNamesArray);

    let folderName = "New Folder";
    let i = 0;

    while (folderNames.has(folderName)) {
      i += 1;
      folderName = `New Folder (${i})`;
    }

    const newFolderPath = `${currentPath}/${folderName}`;
    await mkdir(newFolderPath, { recursive: true });

    fetchFiles(currentPath);
  } catch (error) {
    console.error("Error creating folder:", error);
  }
}

export async function handleDelete() {
  const selectedFiles = useFileExplorerStore.getState().selectedFiles;
  console.log("Selected files for deletion:", selectedFiles);
  if (selectedFiles.length === 0) {
    console.warn("No files selected for deletion");
    return;
  }

  for (const file of selectedFiles) {

    try {
      await remove(file.path, { recursive: true });
      const fetchFiles = useFileExplorerStore.getState().fetchFiles;
      const currentPath = useFileExplorerStore.getState().currentPath;
      console.log(`Deleted file or folder at ${file.path}`);
      fetchFiles(currentPath);
    } catch (error) {
      console.error(`Error deleting file or folder at ${file.path}:`, error);
    }
  }
  
}

export async function handleRename() {
  const fetchFiles = useFileExplorerStore.getState().fetchFiles;
  const currentPath = useFileExplorerStore.getState().currentPath;
  const selectedFile = useFileExplorerStore.getState().selectedFiles[0];


  let newFileName = prompt("");

  if (!newFileName) {
    newFileName = ""
  }

  const newFilePath = currentPath + "/" + newFileName;
  try {
    await rename(selectedFile.path, newFilePath);
  } catch (error) {
    console.error(`Error renaming file from ${selectedFile.path} to ${newFilePath}:`, error);
    return;
  } finally {
      fetchFiles(currentPath);
  }
}

export async function handleCut() {
  //TODO: Implement cut functionality

}

export async function handleCopy() {  
  //TODO: Implement copy functionality

}

export async function handleFileClick(file: File) {
  const navigateTo = useFileExplorerStore.getState().navigateTo;
  if (file.isDir) {
    navigateTo(file.path);
  } else {
    await openPath(file.path);
  }
}

